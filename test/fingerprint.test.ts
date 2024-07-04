import { expect } from 'chai';
import { Contract, Wallet } from 'zksync-ethers';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { ethers } from 'ethers';

describe('FingerPrint Contract', function () {
    let fingerPrintContract: Contract;
    let ownerWallet: Wallet;
    let dataHash: string;

    before(async function () {
        ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        fingerPrintContract = await deployContract('FingerPrint', [], { wallet: ownerWallet, silent: true });

        const gamingData = { game: 'League of Legends', character: 'Ahri', ability: 'Orb of Deception' };
        const dataBytes = ethers.toUtf8Bytes(JSON.stringify(gamingData));
        dataHash = ethers.keccak256(dataBytes);
    });

    describe('Function appendData', function () {
        it('should revert if dataHash is zero', async function () {
            const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
            await expect(fingerPrintContract.appendData(zeroHash))
                .to.be.revertedWithCustomError(fingerPrintContract, "InvalidDataHash");
        });

        it('should append a valid data hash successfully', async function () {
            const initialSize = await fingerPrintContract.getSize();
            await fingerPrintContract.appendData(dataHash);
            const newSize = await fingerPrintContract.getSize();

            expect(newSize).to.equal(initialSize + 1n);

            const root = await fingerPrintContract.getRoot();
            expect(root).to.not.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

            const hashExists = await fingerPrintContract.isHashAppended(dataHash);
            expect(hashExists).to.be.true;
        });

        it('should revert if data hash is already appended', async function () {
            await expect(fingerPrintContract.appendData(dataHash))
                .to.be.revertedWithCustomError(fingerPrintContract, "DataHashAlreadyAppended");
        });
    });
});
