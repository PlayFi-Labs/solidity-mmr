import { deployContract } from "./utils";

// Deploy and fund Paymaster
export default async function() {

  const mmr = await deployContract("MMR");
  const mmrAddress = await mmr.getAddress();
  console.log(`MMR deployed at address: ${mmrAddress}`);
}