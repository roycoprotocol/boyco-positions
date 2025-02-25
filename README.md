# Boyco Positions

## Overview

Each depositor inside boyco market has a unique position in terms of weiroll wallet -- so let's say that a user deposited 3 times in "KODIAK" market -- then that user will have 3 weiroll wallets -- and each weiroll wallet is categorized as a unique position -- and each position has associated deposited amount + incentives.

The info for each position is stored inside `boyco_positions.json` file at [src/boyco_positions.json](./src/boyco_positions.json) file.

## Notations for Position inside `boyco_positions.json`

- `id` - Unique id for each position, `<SOURCE_CHAIN_ID>_<WEIROLL_WALLET_ADDRESS>`
- `raw_market_ref_id` - Market reference id on source chain, `<SOURCE_CHAIN_ID>_<MARKET_TYPE>_<MARKET_HASH>`
- `raw_offer_ref_id` - Offer reference id on source chain, `<SOURCE_CHAIN_ID>_<OFFER_TYPE>_<OFFER_HASH>`
- `raw_weiroll_wallet_withdrawn_destination_ref_id` - Weiroll wallet withdrawn destination reference id on destination chain, `<DESTINATION_CHAIN_ID>_<WEIROLL_WALLET_ADDRESS>`
- `source_chain_id` - Source chain id (always `1`, denotes Ethereum Mainnet)
- `destination_chain_id` - Destination chain id (always `80094`, denotes Berachain Mainnet)
- `weiroll_wallet` - Weiroll wallet address
- `account_address` - Account address
- `market_id` - Market hash
- `reward_style` - Reward style (always `0`, denotes upfront rewards)
- `token_0_id` - Token deposited on source chain
- `token_0_amount` - Amount of token deposited on source chain
- `token_1_ids` - Array of point incentive ids distributed to the user on source chain
- `token_1_amounts` - Array of amounts of point incentive amounts distributed to the user on source chain
- `receipt_token_id` - Token to be given to the user on destination chain
- `receipt_token_amount` - Amount of token to be given to the user on destination chain
- `unlock_timestamp` - Timestamp when the user can withdraw their position on destination chain
- `ccdm_nonce` - Nonce for the ccdm for this position
- `deposit_leaf` - Deposit leaf for this position inside merkle tree
- `merkle_deposit_nonce` - Merkle deposit nonce for this position
- `amount_deposited` - Amount deposited by the user on source chain
- `total_amount_bridged` - Total amount bridged in batch (note: all the depositors of each market are bridged in batch, so this amount denotes the total amount bridged in batch, it's not the user amount deposited)
- `deposit_transaction_hash` - Transaction hash of the deposit transaction on source chain
- `bridge_transaction_hash` - Transaction hash of the bridge transaction on source chain
- `process_transaction_hash` - Transaction hash of the process transaction on destination chain
- `execute_transaction_hash` - Transaction hash of the execute transaction on destination chain
- `merkle_proof` - Merkle proof for this position, this is the proof that user will submit on destination chain to withdraw their receipt token

## Merkle Proofs

All the merkle proofs are stored market-wise and weiroll wallet-wise in [src/data](./src/data) directory.

The `.json` file name is `<CHAIN_ID>_<MARKET_TYPE>_<MARKET_HASH>.json`.

```
src/data/
├── 1_0_0x0a7565b14941c6a3dde083fb7a857e27e12c55fa34f709c37586ec585dbe7f3f.json
├── 1_0_0x1e0a98a276ba873cfa427e247c7d0e438f604a54fcb36481063e1220af021faf.json
├── 1_0_0x2a3a73ba927ec6bbf0e2e12e21a32e274a295389ce9d6ae2b32435d12c597c2c.json
└── ...
```

## Data Generation Scripts

Note: You don't need to run these scripts, just use the already generated data in [src/data](./src/data) directory & [src/boyco_positions.json](./src/boyco_positions.json) file.

These scripts are just for reference to show how the data was calculated and verified.

### Install dependencies

```bash
npm install
```

### Generate Merkle Proofs

```bash
npm run generate
```

### Verify Merkle Roots

```bash
npm run verify
```

### Store Merkle Proofs in Database

```bash
npm run store
```
