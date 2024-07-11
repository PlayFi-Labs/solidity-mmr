import { ethers } from "ethers";
import { Provider } from "zksync-ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const contractAddress = process.env.FINGERPRINT_PROXY_SC;

    // Setup the zkSync provider and wallet
    const zkSyncUrl = "https://sepolia.era.zksync.dev";
    const provider = new Provider(zkSyncUrl);
    const PRIVATE_KEY = process.env.ZKSYNC_SEPOLIA_PRIVATE_KEY || "";
    const wallet = new ethers.Wallet(PRIVATE_KEY).connect(provider);
    const address = wallet.address;
    const balance = await provider.getBalance(address);

    console.log(`Wallet address: ${address}`);
    console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
        console.error("Wallet has insufficient funds");
        return;
    }

    // Create a JSON object and convert to SHA-256 hash
    const jsonObject = { "gamer": "Merkle", "strikes": 793287, "place": "SP", "weapon": "AK-47", "place2": "Y" };
    const jsonString = JSON.stringify(jsonObject);
    const dataBytes = ethers.toUtf8Bytes(jsonString);
    const dataHash = ethers.keccak256(dataBytes);
    console.log(`Data hash: ${dataHash}`);

    // Setup the function call to check if the hash is already appended
    const functionSignatureCheck = "isHashAppended(bytes32)";
    const functionHashCheck = ethers.keccak256(ethers.toUtf8Bytes(functionSignatureCheck)).slice(0, 10);
    const dataHashPadded = dataHash.slice(2).padStart(64, "0");
    const dataCheck = functionHashCheck + dataHashPadded;

    // Setup the function call to append the hash
    const functionSignature = "appendData(bytes32)";
    const functionHash = ethers.keccak256(ethers.toUtf8Bytes(functionSignature)).slice(0, 10);
    const data = functionHash + dataHashPadded;

    const result = await provider.call({
        to: contractAddress,
        data: dataCheck,
        from: address,
    });

    // Decode the result of the check
    const isAppended = ethers.AbiCoder.defaultAbiCoder().decode(["bool"], result)[0];
    console.log(`Is hash appended: ${isAppended}`);

    if (isAppended) {
        console.log("Hash already appended, exiting.");
        return;
    }

    try {
        const gasEstimate = await provider.estimateGas({
            to: contractAddress,
            data: data,
            from: address,
        });
        console.log(`Estimated gas: ${gasEstimate.toString()}`);
    } catch (error) {
        console.error(`Gas estimation failed: ${error.message}`);
        console.error(`Error details: ${JSON.stringify(error, null, 2)}`);
        return;
    }

    try {
        const tx = await wallet.sendTransaction({
            to: contractAddress,
            data: data,
        });
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log("Transaction confirmed");
    } catch (error) {
        console.error(`Transaction failed: ${error.message}`);
        console.error(`Error details: ${JSON.stringify(error, null, 2)}`);

        if (error.data) {
            try {
                const reason = ethers.toUtf8String('0x' + error.data.slice(138));
                console.error(`Revert reason: ${reason}`);
            } catch (innerError) {
                console.error(`Failed to decode revert reason: ${innerError.message}`);
            }
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
