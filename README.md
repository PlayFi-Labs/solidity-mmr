# Mountain Merkle Range

This project was scaffolded with [zksync-cli](https://github.com/matter-labs/zksync-cli).

## Project Layout

- `/contracts`: Contains solidity smart contracts.
- `/deploy`: Scripts for contract deployment and interaction.
- `/test`: Test files.
- `hardhat.config.ts`: Configuration settings.

## How to Use

- `npm run compile`: Compiles contracts.
- `npm run deploy-mmr`: Deploys using script `deploy/mmr/01_deploy_mmr.ts`.
- `npm run interact`: Interacts with the deployed contract using `/deploy/interact.ts`.
- `npm run test`: Tests the contracts.

Note: Both `npm run deploy-mmr` is set in the `package.json`. You can also run your files directly, for example: `npx hardhat deploy-zksync --script deploy-mmr.ts`

### Environment Settings

To keep private keys safe, this project pulls in environment variables from `.env` files. Primarily, it fetches the wallet's private key.

Rename `.env.example` to `.env` and fill in your private key:

```
WALLET_PRIVATE_KEY=your_private_key_here...
```

### Network Support

`hardhat.config.ts` comes with a list of networks to deploy and test contracts. Add more by adjusting the `networks` section in the `hardhat.config.ts`. To make a network the default, set the `defaultNetwork` to its name. You can also override the default using the `--network` option, like: `hardhat test --network dockerizedNode`.

### Local Deployment

To set up a local deployment, you need to first start a zkSync node using Hardhat, and then deploy your contracts. Here are the steps:

1. **Install dependencies**: Before starting a zkSync node, you need to install the necessary dependencies. Run the following command:

```bash
npm install
```

2. **Start a zkSync node**: Run the following command to start a zkSync node using Hardhat:

```bash
npx hardhat node-zksync
```

This command will start a local zkSync node that you can use for testing and development.

3. **Compile contracts**

```bash
npm run compile
```

4. **Deploy MMR contract**

```bash
npx hardhat deploy-zksync --script 01_deploy_mmr.ts --network inMemoryNode
```

Please note that these steps assume that you have already installed all the necessary dependencies and have a correctly configured Hardhat environment.

### Local Tests

1. **Run Tests**

```bash
npx hardhat test --network inMemoryNode
```

## Useful Links

- [Docs](https://era.zksync.io/docs/dev/)
- [Official Site](https://zksync.io/)
- [GitHub](https://github.com/matter-labs)
- [Twitter](https://twitter.com/zksync)
- [Discord](https://join.zksync.dev/)

## License

This project is under the [MIT](./LICENSE) license.