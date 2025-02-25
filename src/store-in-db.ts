import { readdir, readFile } from "fs/promises";
import { type MerkleProof } from "./types";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const main = async () => {
  const sql = neon(process.env.DATABASE_URL as string);

  const dataDir = "./src/data";
  const files = await readdir(dataDir);

  for (const file of files) {
    const merkleProof = JSON.parse(
      await readFile(path.join(dataDir, file), "utf-8")
    ) as MerkleProof;

    const { market_hash, merkle_root, proofs } = merkleProof;

    for (const proof of proofs) {
      const { id, proof: merkle_proof } = proof;

      await sql`
        UPDATE boyco_positions
        SET merkle_proof = ${merkle_proof}
        WHERE id = ${id}
      `;
    }
  }
};

main();
