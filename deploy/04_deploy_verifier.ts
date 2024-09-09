import * as dotenv from "dotenv";
import { DeployFunction } from "hardhat-deploy/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Provider, types, Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const contractName = "Groth16Verifier";

    const provider = Provider.getDefaultProvider(types.Network.Sepolia);
    const ethProvider = hre.ethers.getDefaultProvider("sepolia");

    const PRIVATE_KEY = process.env.ZKSYNC_SEPOLIA_PRIVATE_KEY !== undefined ? process.env.ZKSYNC_SEPOLIA_PRIVATE_KEY : "";

    const zkWallet = new Wallet(PRIVATE_KEY, provider, ethProvider);

    const deployer = new Deployer(hre, zkWallet);

    const contract = await deployer.loadArtifact(contractName);

    // Deploy the contract
    const groth16VerifierContract = await deployer.deploy(contract);

    // Wait for deployment to finish
    await groth16VerifierContract.waitForDeployment();

    const contractAddress = await groth16VerifierContract.getAddress();
    console.log(contractName + " deployed to:", contractAddress);

    // Save the contract address to the deployments file
    const deployments = await hre.deployments;
    await deployments.save(contractName, {
        address: contractAddress,
        abi: contract.abi,
    });

    return true;
};

export default func;
func.id = "DeployGroth16VerifierZKSync";
func.tags = ["DeployGroth16VerifierZKSync"];
