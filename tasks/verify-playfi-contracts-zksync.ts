import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import { VERIFYFINGERPRINTCONTRACTSZKSYNC } from "./task-names";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { Provider, types } from "zksync-ethers";

dotenv.config();

task(VERIFYFINGERPRINTCONTRACTSZKSYNC, "Verifies the FingerPrint contract", async (_taskArgs, hre) => {
  const { deployments } = hre;
  // Load deployment details
  let deployment;
  try {
    deployment = await deployments.get("FingerPrint");
  } catch (error) {
    console.error("Error fetching deployment details for FingerPrint:", error);
    throw new Error("No deployment found for: FingerPrint");
  }

  if (!deployment || !deployment.address) {
    throw new Error("FingerPrint contract address is not defined. Ensure it is deployed correctly.");
  }

  const fingerPrintContract = deployment.address;

  const provider = Provider.getDefaultProvider(types.Network.Sepolia);

  let fingerPrintImpl = await getImplementationAddress(provider, fingerPrintContract);

  try {
    await hre.run("verify:verify", {
      address: fingerPrintImpl,
      constructorArguments: [],
    });
  } catch (e) {
    // @ts-ignore
    if (e.name === "NomicLabsHardhatPluginError" && e.message.indexOf("Contract source code already verified") !== -1) {
      console.log("Contract source already verified!");
    } else {
      console.log(e);
    }
  }
});
