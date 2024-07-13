import { expect } from 'chai';
import { Contract, Wallet } from 'zksync-ethers';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { ethers } from 'ethers';

describe('FingerPrint Contract', function () {
    let fingerPrintContract: Contract;
    let ownerWallet: Wallet;
    let dataHash: string;
    let dataHash2: string;
    let dataHash3: string;


    before(async function () {
        ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        fingerPrintContract = await deployContract('FingerPrint', [], { wallet: ownerWallet, silent: true });

        const gamingData = { game: 'League of Legends', character: 'Ahri', ability: 'Orb of Deception' };
        const dataBytes = ethers.toUtf8Bytes(JSON.stringify(gamingData));
        dataHash = ethers.keccak256(dataBytes);

        const gamingData2 = { game: 'Dota 2', character: 'Invoker', ability: 'Sun Strike' };
        const dataBytes2 = ethers.toUtf8Bytes(JSON.stringify(gamingData2));
        dataHash2 = ethers.keccak256(dataBytes2);

        const gamingData3 = { game: 'Dota 3', character: 'Invoker', ability: 'Sun Strike' };
        const dataBytes3 = ethers.toUtf8Bytes(JSON.stringify(gamingData3));
        dataHash3 = ethers.keccak256(dataBytes3);
    });

    describe('Function appendData', function () {
        it('should revert if dataHash is zero', async function () {
            const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
            await expect(fingerPrintContract.appendData(zeroHash))
                .to.be.revertedWithCustomError(fingerPrintContract, 'InvalidDataHash');
        });

        it('should append a valid dataHash successfully and emit DataHashAppended', async function () {
            await expect(fingerPrintContract.appendData(dataHash))
                .to.emit(fingerPrintContract, 'DataHashAppended')
                .withArgs(dataHash);
            
            const hashExists = await fingerPrintContract.isHashAppended(dataHash);
            expect(hashExists).to.be.true;
        });

        it('should revert if data hash is already appended', async function () {
            await expect(fingerPrintContract.appendData(dataHash))
                .to.be.revertedWithCustomError(fingerPrintContract, 'DataHashAlreadyAppended');
        });

        it('should append a different valid dataHash successfully and emit DataHashAppended', async function () {
            await expect(fingerPrintContract.appendData(dataHash2))
                .to.emit(fingerPrintContract, 'DataHashAppended')
                .withArgs(dataHash2);
            
            const hashExists = await fingerPrintContract.isHashAppended(dataHash2);
            expect(hashExists).to.be.true;
        });
    });

    describe('Function verifyHash', function () {
        it('should return true for an appended hash', async function () {
            const result = await fingerPrintContract.verifyHash(dataHash);
            expect(result).to.be.true;
        });
        it('should return false for a non-appended hash', async function () {
            await expect(fingerPrintContract.verifyHash(dataHash3))
            .to.be.revertedWithCustomError(fingerPrintContract, 'InvalidHashIndex');
        });
    });
});