import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import { solidityPackedKeccak256, ZeroHash, Wallet } from "ethers";
import BoycoPositions from "./boyco_positions.json";
import {
  computeDepositLeaf,
  createJsonFile,
  type BoycoPosition,
} from "./utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

export const computeMerkleProofsByRawMarketRefId = async (
  rawMarketRefId: string
) => {
  const outputPath = `./src/data/${rawMarketRefId}.json`;

  // Check if file already exists
  if (existsSync(outputPath)) {
    console.log(
      `\n=> Skipping Market ID: ${rawMarketRefId} - JSON file already exists`
    );
    return;
  }

  console.log(
    `\n=> Computing Merkle Proofs for Market ID: ${rawMarketRefId}...`
  );

  const boycoPositions = BoycoPositions as BoycoPosition[];

  // Sort by ascending order of merkle_deposit_nonce
  const depositData = boycoPositions
    .filter((position) => position.raw_market_ref_id === rawMarketRefId)
    .sort(
      (a, b) =>
        parseInt(a.merkle_deposit_nonce) - parseInt(b.merkle_deposit_nonce)
    )
    .map((position) => ({
      ...position,
      merkleDepositNonce: position.merkle_deposit_nonce,
      depositor: position.account_address,
      amountDeposited: position.amount_deposited,
    }));

  let leaves = Array.from({ length: 2 ** 23 }, () => ZeroHash);

  console.log("Computing Deposit Leaves...");

  const leafStartTime = performance.now();
  depositData.forEach((v, i) => {
    leaves[i] = computeDepositLeaf(v);
  });
  const leafEndTime = performance.now();

  console.log(
    `Deposit Leaves Computed in ${(
      (leafEndTime - leafStartTime) /
      1000
    ).toFixed(2)} seconds`
  );

  console.log("\nGenerating Merkle Tree...");

  const treeStartTime = performance.now();
  const tree = SimpleMerkleTree.of(leaves, {
    // Turn OFF leaf-sorting so we keep the same insertion order
    sortLeaves: false,
  });
  const treeEndTime = performance.now();

  console.log(
    `Merkle Tree Created in ${((treeEndTime - treeStartTime) / 1000).toFixed(
      2
    )} seconds`
  );

  const proofs = depositData.map((v, i) => {
    return {
      id: v.id,
      proof: tree.getProof(i),
    };
  });

  const merkleRoot = tree.root;
  const marketHash = depositData[0]?.market_id;

  const data = {
    market_hash: marketHash,
    merkle_root: merkleRoot,
    proofs,
  };

  await createJsonFile(data, outputPath);
};

export const main = async () => {
  const boycoPositions = BoycoPositions as BoycoPosition[];

  // find all distinct raw_market_ref_id
  const rawMarketRefIds = boycoPositions.map(
    (position) => position.raw_market_ref_id
  );

  const uniqueRawMarketRefIds = [...new Set(rawMarketRefIds)];

  // const testRawMarketRefId = uniqueRawMarketRefIds[0];

  // if (!testRawMarketRefId) {
  //   throw new Error("No test raw market ref id found");
  // }

  for (let i = 0; i < uniqueRawMarketRefIds.length; i++) {
    const rawMarketRefId = uniqueRawMarketRefIds[i];

    if (rawMarketRefId) {
      await computeMerkleProofsByRawMarketRefId(rawMarketRefId);
    }
  }

  // computeMerkleProofsByRawMarketRefId(testRawMarketRefId);
};

main();
