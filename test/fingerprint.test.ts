import { expect } from 'chai';
import { Contract, Wallet } from 'zksync-ethers';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { ethers } from 'ethers';

describe.only('FingerPrint Contract', function () {
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
            try {
                await fingerPrintContract.appendData(zeroHash);
                expect.fail('Expected appendData to revert with zero hash, but it did not');
            } catch (error) {
                expect((error as Error).message).to.include('revert');
            }
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
            try {
                await fingerPrintContract.appendData(dataHash);
                expect.fail('Expected appendData to revert with duplicate data hash, but it did not');
            } catch (error) {
                expect((error as Error).message).to.include('revert');
            }
        });
    });
});