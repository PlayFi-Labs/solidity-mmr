import * as dotenv from "dotenv";
import { DeployFunction } from "hardhat-deploy/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { getNamedAccounts } from "hardhat";
import { Provider, types, Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { admin } = await getNamedAccounts();

    const contractName = "FingerPrint";

    const provider = Provider.getDefaultProvider(types.Network.Sepolia);
    const ethProvider = hre.ethers.getDefaultProvider("sepolia");

    const PRIVATE_KEY = process.env.ZKSYNC_SEPOLIA_PRIVATE_KEY !== undefined ? process.env.ZKSYNC_SEPOLIA_PRIVATE_KEY : "";

    const zkWallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    const deployer = new Deployer(hre, zkWallet);

    const contract = await deployer.loadArtifact(contractName);

    const fingerPrintContract = await hre.zkUpgrades.deployProxy(deployer.zkWallet, contract, [admin], { initializer: "initialize" });

    await fingerPrintContract.waitForDeployment();

    const fingerPrintAddress = await fingerPrintContract.getAddress();
    console.log(contractName + " deployed to:", fingerPrintAddress);

    // Save the contract address to the deployments file
    const deployments = await hre.deployments;
    await deployments.save(contractName, {
        address: fingerPrintAddress,
        abi: contract.abi,
    });

    return true;
};

export default func;
func.id = "DeployFingerPrintZKSync";
func.tags = ["DeployFingerPrintZKSync"];