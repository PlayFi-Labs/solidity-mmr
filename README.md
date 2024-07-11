# Mountain Merkle Range

This project was scaffolded with [zksync-cli](https://github.com/matter-labs/zksync-cli) and is focused on the implementation of Merkle Mountain Ranges.

Merkle Mountain Ranges (MMRs) are an advanced data structure derived from Merkle trees, designed to store lists of items efficiently. One of their main benefits is the ability to provide compact proofs of inclusion, making it highly efficient to verify whether an item is part of a list without needing the entire dataset. Additionally, MMRs support append-only operations, allowing data to be added while maintaining the integrity and verifiability of the structure. This makes MMRs particularly useful in scenarios where data integrity and auditability are crucial, such as in blockchain technology and data security applications.

## Project Layout

- `/contracts`: Contains solidity smart contracts.
- `/deploy`: Scripts for contract deployment and interaction.
- `/test`: Test files.
- `hardhat.config.ts`: Configuration settings.

## Setting Up Environment

This project uses `.env` files to secure private keys. Follow these steps to set up:

1. Move `.env.example` to `.env` with `mv .env.example .env`
2. Add your private key in `.env`:

```bash
WALLET_PRIVATE_KEY=your_private_key_here...
```

## How to Use

- `npm run node`: Starts a local Hardhat node with `npx hardhat node-zksync`.
- `npm run compile`: Compiles contracts.
- `npm run deploy`: Deploys using script `npx hardhat deploy-zksync --script 01_deploy_mmr.ts --network inMemoryNode`.
- `npm run test`: Tests the contracts.

Note: `npm run deploy` is set in the `package.json`. You can also run your files directly, for example: `npx hardhat deploy-zksync --script 01_deploy_mmr.ts --network <NETWORK>`

### Local Deployment

To set up a local deployment, you need to first start a zkSync node using Hardhat, and then deploy your contracts. Here are the steps:

1. **Install dependencies**: Before starting a zkSync node, you need to install the necessary dependencies. Run the following command:

```bash
npm install
```

2. **Start a zkSync node**: Run the following command to start a zkSync node using Hardhat:

```bash
npm run node
```

This command will start a local zkSync node that you can use for testing and development.

3. **Compile Contracts**

```bash
npm run compile
```

4. **Deploy FingerPrint Smart Contract**

```bash
npx hardhat deploy-zksync --script 01_deploy_fingerPrint-zkSync.ts --network inMemoryNode
```

5. **Verify FingerPrint Smart Contract**

This command is used to verify the FingerPrint Smart Contract on the zkSync Sepolia Testnet

```bash
npx hardhat verify-fingerprint-contracts-zksync --network zkSyncSepoliaTestnet
```

6. **Run the Script**

Before running the script, you need to specify the address of the FingerPrint Proxy Smart Contract and the Private Key of your Wallet. This is done by setting the value of `FINGERPRINT_PROXY_SC` and `ZKSYNC_SEPOLIA_PRIVATE_KEY` in your `.env` file

```bash
npx hardhat run scripts/fp_interaction-SC.ts --network inMemoryNode
```

Please note that these steps assume that you have already installed all the necessary dependencies and have a correctly configured Hardhat environment.

### Local Tests

1. **Run Tests**

```bash
npx hardhat test --network inMemoryNode
```

## Useful Links

- [Official Site](https://www.playfi.ai/)
- [GitHub](https://github.com/PlayFi-Labs)
- [Twitter](https://twitter.com/PlayFiGaming)
- [Discord](https://discord.com/invite/playfi)

## License

This project is under the [MIT](./LICENSE) license.