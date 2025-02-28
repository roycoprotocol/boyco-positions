import { type BoycoPosition } from "./utils";
import BoycoPositions from "./boyco_positions.json";

const main = async () => {
  const boycoPositions = BoycoPositions as BoycoPosition[];

  const receiptTokenIds = [
    ...new Set(boycoPositions.map((position) => position.receipt_token_id)),
  ];

  console.log("Unique Receipt Token IDs:", receiptTokenIds);

  console.log("Total Unique Receipt Token IDs:", receiptTokenIds.length);
};

main();
