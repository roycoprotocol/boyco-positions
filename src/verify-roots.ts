import { request, gql } from "graphql-request";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { MerkleProof } from "./types";

interface QueryResponse {
  lpTokensMerkleBridgedToDestinations: {
    marketHash: string;
    merkleRoot: string;
  }[];
  singleTokensMerkleBridgedToDestinations: {
    marketHash: string;
    merkleRoot: string;
  }[];
}

export const ROYCO_CCDM_SOURCE_BOYCO_MAINNET_SUBGRAPH_URL =
  "https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-ccdm-source-boyco-mainnet/2.0.1/gn";

export const main = async () => {
  const dataDir = "./src/data";

  const files = await readdir(dataDir);
  const marketIds = files.map((file) => {
    return file.replace(".json", "");
  });
  const marketHashes = files.map((file) => {
    const parts = file.split("_");
    return parts.at(-1)?.replace(".json", "") ?? file;
  });

  const merkleRootsQuery = gql`
    query MyQuery($marketHashes: [String!]) {
      lpTokensMerkleBridgedToDestinations(
        first: 1000
        where: { marketHash_in: $marketHashes }
      ) {
        marketHash
        merkleRoot
      }
      singleTokensMerkleBridgedToDestinations(
        first: 1000
        where: { marketHash_in: $marketHashes }
      ) {
        marketHash
        merkleRoot
      }
    }
  `;

  const response = await request<QueryResponse>(
    ROYCO_CCDM_SOURCE_BOYCO_MAINNET_SUBGRAPH_URL,
    merkleRootsQuery,
    {
      first: 1000,
      marketHashes: marketHashes,
    }
  );

  const merkleRoots = [
    ...response.lpTokensMerkleBridgedToDestinations,
    ...response.singleTokensMerkleBridgedToDestinations,
  ];

  let correctCount = 0;
  let incorrectCount = 0;

  for (let i = 0; i < marketIds.length; i++) {
    const filePath = path.join(dataDir, `${marketIds[i]}.json`);

    // read the json file
    const file = await readFile(filePath, "utf-8");
    const data = JSON.parse(file) as MerkleProof;

    const merkleRoot = data.merkle_root;
    const marketHash = data.market_hash;

    const merkleRootFromSubgraph = merkleRoots.find(
      (root) => root.marketHash === marketHash
    )?.merkleRoot;

    if (merkleRootFromSubgraph !== merkleRoot) {
      incorrectCount++;
    } else {
      correctCount++;
    }
  }

  console.log(`Correct Merkle Roots: ${correctCount}`);
  console.log(`Incorrect Merkle Roots: ${incorrectCount}`);
};

main();
