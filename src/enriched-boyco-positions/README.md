# Enriched Boyco Positions

- Total Positions: 21299
- Date Snapshot Timestamp: 3/1/2025 12:50 PM PT

## File Formats

- csv: [here](./enriched_boyco_positions.csv)
- json: [here](./enriched_boyco_positions.json)
- md: [here](./enriched_boyco_positions.md)

## Notations

- `id`: Boyco Position ID
- `account_address`: Address of the account that owns the position
- `market_id`: Market hash of the recipe market
- `name`: Name of the recipe market
- `weiroll_wallet`: Address of weiroll wallet on Berachain
- `input_token_id`: Token ID of deposit token
- `input_token_raw_amount`: Token amount deposited in wei
- `input_token_amount`: Token amount deposited in decimal normalized format
- `input_token_amount_usd`: Token amount deposited in USD value
- `input_token_decimals`: Number of decimals of the deposit token
- `input_token_price`: Price of the deposit token in USD
- `receipt_token_id`: Token ID of receipt token
- `receipt_token_raw_amount`: Token amount received in wei
- `receipt_token_amount`: Token amount received in decimal normalized format
- `receipt_token_amount_usd`: Token amount received in USD value
- `receipt_token_decimals`: Number of decimals of the receipt token
- `receipt_token_price`: Price of the receipt token in USD
- `ccdm_nonce`: Nonce used for CCDM
- `deposit_leaf`: Deposit leaf of the position in merkle tree
- `merkle_deposit_nonce`: Nonce used for merkle tree deposit
- `amount_deposited`: Raw amount deposited, same as `input_token_raw_amount`
- `total_amount_bridged`: Total amount bridged in the batch of bridge transaction
- `deposit_transaction_hash`: Transaction hash of the deposit transaction on Ethereum
- `bridge_transaction_hash`: Transaction hash of the bridge transaction on Ethereum
- `process_transaction_hash`: Transaction hash of the process transaction on Berachain
- `execute_transaction_hash`: Transaction hash of the execute transaction on Berachain

> Note: total_amount_bridged refers to the sum of all the raw_amounts included in the bridge transaction -- so it means that total_amount_bridged includes position of multiple weiroll wallets -- therefore, to calculate the amount owed to a weiroll wallet on Berachain, we use this formula:

```
receipt_token_raw_amount = (amount_deposited / total_amount_bridged) * total_receipt_token_amount_on_berachain
```

> Note: We have already calculated the amount owed to each weiroll wallet on Berachain in the `receipt_token_raw_amount` column -- so you don't need to re-calculate receipt token amount for each position -- the formula above was just for reference.
