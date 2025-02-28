import dotenv from "dotenv";
import BoycoPostions from "./boyco_positions.json";
import { type BoycoPosition } from "./utils";
import { Contracts } from "./contracts";
import { encodeFunctionData } from "viem";
import { BigNumber } from "ethers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

dotenv.config();

const boycoPositions = BoycoPostions as BoycoPosition[];

const simulatePositionWithdrawal = async (position: BoycoPosition) => {
  const { TENDERLY_API_KEY, TENDERLY_ACCOUNT_SLUG, TENDERLY_PROJECT_SLUG } =
    process.env;

  const res = await fetch(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`,
    {
      method: "POST",
      headers: {
        "X-Access-Key": `${TENDERLY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "tenderly_simulateTransaction",
        network_id: "80094",
        from: position.account_address,
        to: Contracts[80094].DepositExecutor.address,
        input: encodeFunctionData({
          abi: Contracts[80094].DepositExecutor.abi,
          functionName: "withdrawMerkleDeposit",
          args: [
            position.weiroll_wallet,
            position.merkle_deposit_nonce,
            position.amount_deposited,
            position.merkle_proof,
          ],
        }),
        save: true,
        save_if_fails: true,
        block_header: {
          timestamp: BigNumber.from(position.unlock_timestamp).toHexString(),
        },
      }),
    }
  );

  const data = await res.json();
  const simulationId = data.simulation.id;

  // console.log(data.simulation);

  // Check if simulation was successful
  const isSuccess = data.simulation.status === true ? true : false;

  // Enable sharing
  await fetch(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulations/${simulationId}/share`,
    {
      method: "POST",
      headers: {
        "X-Access-Key": `${TENDERLY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    url: `https://www.tdly.co/shared/simulation/${simulationId}`,
    success: isSuccess,
  };
};

interface SimulationData {
  marketIndex: number;
  marketId: string;
  marketUrl: string;
  position: BoycoPosition;
  simulationId: string;
  simulationUrl: string;
  success: boolean;
}

const main = async () => {
  const uniqueMarketIds = [
    ...new Set(boycoPositions.map((pos) => pos.market_id)),
  ];
  let readmeContent = "# Simulated Withdrawals by Market\n\n";
  let marketCount = 0;
  const simulationsData: SimulationData[] = [];

  // Add table header with Status column
  readmeContent +=
    "| Market Index | Market ID | Market | Simulation | Status |\n";
  readmeContent +=
    "|--------------|-----------|---------|------------|--------|\n";

  // First pass: collect all data and build table rows
  const tableRows: string[] = [];
  const detailedContent: string[] = [];

  for (const marketId of uniqueMarketIds) {
    // if (marketCount >= 2) break;

    const marketPositions = boycoPositions.filter(
      (pos) => pos.market_id === marketId
    );
    const randomPosition =
      marketPositions[Math.floor(Math.random() * marketPositions.length)];

    console.log(`Processing market ${marketId}...`);

    if (!randomPosition) {
      console.log(`No position found for market ${marketId}`);
      continue;
    }

    const simulation = await simulatePositionWithdrawal(randomPosition);
    const simulationId = simulation.url.split("/").pop() || "";
    const marketUrl = `https://app.royco.org/market/1/0/${marketId}`;
    const status = simulation.success ? "Success" : "Failed";

    // Add table row with status
    tableRows.push(
      `| ${
        marketCount + 1
      } | ${marketId} | [Link](${marketUrl}) | [${simulationId}](${
        simulation.url
      }) | ${status} |`
    );

    // Store detailed content
    detailedContent.push(
      `\n## ${marketCount + 1}. Market ID: ${marketId}\n\n` +
        `### Position\n\n` +
        "```json\n" +
        JSON.stringify(randomPosition, null, 2) +
        "\n```\n\n" +
        `### Simulation\n\n` +
        `Tenderly Link: [${simulationId}](${simulation.url})\n\n`
    );

    // Store simulation data
    simulationsData.push({
      marketIndex: marketCount + 1,
      marketId,
      marketUrl,
      position: randomPosition,
      simulationId,
      simulationUrl: simulation.url,
      success: simulation.success,
    });

    marketCount++;
  }

  // Combine all content
  readmeContent += tableRows.join("\n"); // Add all table rows together
  readmeContent += detailedContent.join(""); // Add all detailed content

  // Ensure data directory exists
  await mkdir("./src/positions", { recursive: true });

  // Save simulations data to JSON file
  await writeFile(
    join("./src/positions", "simulations.json"),
    JSON.stringify(simulationsData, null, 2)
  );
  console.log("simulations.json has been created successfully!");

  // Write to README.md
  await writeFile("README.md", readmeContent);
  console.log("README.md has been created successfully!");
};

main().catch(console.error);
