# Mountain Merkle Range for FingerPrint Verification

This project, scaffolded with [zksync-cli](https://github.com/matter-labs/zksync-cli), focuses on the implementation of Merkle Mountain Ranges (MMRs) specifically for FingerPrint verification. 

MMRs are an advanced data structure derived from Merkle trees, designed to efficiently store lists of items. They are particularly beneficial for providing compact proofs of inclusion, which is crucial for verifying the authenticity and integrity of digital fingerprints in a blockchain environment. This feature makes it highly efficient to verify whether a fingerprint is part of a list without needing the entire dataset. Additionally, MMRs support append-only operations, allowing data to be added while maintaining the integrity and verifiability of the structure. This capability is essential for scenarios where data integrity and auditability are crucial, such as in blockchain technology and data security applications, making MMRs an ideal choice for fingerprint verification.

## Project Layout

- `/contracts`: Contains Solidity smart contracts.
- `/deploy`: Scripts for contract deployment.
- `/test`: Test files.
- `/scripts`: Utility scripts for interaction.
- `/tasks`: Directory for Hardhat tasks.
- `hardhat.config.ts`: Configuration settings.

The integration of MMRs for fingerprint verification offers a robust solution for ensuring the authenticity and integrity of data in blockchain applications. By leveraging the append-only and compact proof features of MMRs, this project aims to provide a secure and efficient method for managing digital fingerprints.

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