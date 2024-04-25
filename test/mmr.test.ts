import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';

describe("MMR", function () {
  let mmrContract: Contract;
  let ownerWallet: Wallet;

  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    mmrContract = await deployContract("MMR", [], { wallet: ownerWallet, silent: true });
    console.log('MMR Tree : 5 |                             31');
    console.log('           4 |             15                                 30                                    46');
    console.log('           3 |      7             14                 22                 29                 38                 45');
    console.log('           2 |   3      6     10       13       18       21        25       28        34        37       41        44       49');
    console.log('           1 | 1  2   4  5   8  9    11  12   16  17    19  20   23  24    26  27   32  33    35  36   39  40    42  43   47  48    50');
    console.log('       width | 1  2   3  4   5  6     7   8    9  10    11  12   13  14    15  16   17  18    19  20   21  22    23  24   25  26    27');
  });

  context('Initial setup validation', function () {
    describe('Test MMR initialization with no data', function () {
      it('Initialize MMR with no prior data, should be empty', async function () {
        const root = await mmrContract.getRoot();
        expect(root).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

        const size = await mmrContract.getSize();
        expect(size).to.equal(0n);

        const peaks = await mmrContract.getPeaks();
        expect(peaks).to.be.empty;
      });
    });
  
    describe('Test MMR initialisation with existing data', function () {
      it('Initialise MMR from an empty state and then append data', async function () {
        const initialRoot = await mmrContract.getRoot();
        expect(initialRoot).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');

        const initialSize = await mmrContract.getSize();
        expect(initialSize).to.equal(0n);

        await mmrContract.append("0x012300");
        await mmrContract.append("0x012340");
        await mmrContract.append("0x00123400");

        const newRoot = await mmrContract.getRoot();
        const newSize = await mmrContract.getSize();

        expect(newRoot).to.not.equal(initialRoot);
        expect(newSize).to.not.equal(initialSize);
      });
    });
  });
  context('Testing basic operations', async () => {
    describe('Validate children node retrieval functionality', async () => {
      it('should return 1,2 as children for 3', async () => {
        const res = await mmrContract.getChildren(3);
        expect(res.left).to.equal(1n);
        expect(res.right).to.equal(2n);
      });
      it('should return 7,14 as children for 15', async () => {
        const res = await mmrContract.getChildren(15);
        expect(res.left).to.equal(7n);
        expect(res.right).to.equal(14n);
      });
      it ('should return 30,15 as children for 31', async () => {
        const res = await mmrContract.getChildren(31);
        expect(res.left).to.equal(15n);
        expect(res.right).to.equal(30n);
      });
      it('should be reverted for leaves like 1,2,4', async () => {
        try {
            await mmrContract.getChildren(1);
            expect.fail("Expected getChildren to revert for leaf 1, but it didn't");
        } catch (error) {
            expect((error as Error).message).to.include("Not a parent");
        }

        try {
            await mmrContract.getChildren(2);
            expect.fail("Expected getChildren to revert for leaf 2, but it didn't");
        } catch (error) {
            expect((error as Error).message).to.include("Not a parent");
        }
    
        try {
            await mmrContract.getChildren(4);
            expect.fail("Expected getChildren to revert for leaf 4, but it didn't");
        } catch (error) {
            expect((error as Error).message).to.include("Not a parent");
        }
      });
    });
  context('Test for checking the MerkleProof creation', async () => {
      let mmr;
      let res: Array<undefined>;
      before(async () => {
        mmr = await deployContract("MMR", [], { wallet: ownerWallet, silent: true });
        for (let i = 0; i < 7; i++) {
            await mmr.append(`0x000${i}`);
        }
        const index = 8;
        res = await mmr.getMerkleProof(index);
        if (!res || !Array.isArray(res) || res.length < 3) {
            throw new Error('getMerkleProof did not return expected result');
        }
      });
    describe('Validate Merkle Proof creation', async () => {
      it('should return 0x2f... for its root value', async () => {
          expect(res[0]).to.equal('0x88dfff1699bf22520652e93f236f3f58959d4c27dea45f51055a2d77fb93ec11');
      });
      it('should return 7 for its width', async () => {
          expect(res[1]).to.equal(7n);
      });
      it('should return [0xfdb6.., 0x3fd8.., 0x2fce..] for its peaks', async () => {
          expect(res[2][0]).to.equal('0x3ac80852966392520aa17c48a62b2dfe22b108dcd87c8f23379d4c85a2df4d65');
          expect(res[2][1]).to.equal('0xf2edcdb56d70287f5073604592c0c450defa40606011d674872c8f5564d9467d');
          expect(res[2][2]).to.equal('0x35a18c4845979c4361b304605bb19b195d3cc2417eeed4e4e422fcc6ec0a4c1e');
      });
      it('should return hash value at the index 9 as its sibling', async () => {
          expect(res[3][0]).to.equal('0x700084bf5cb6e85b7bd0eeeac40470f14a4a91ddf4d05070369aa9cf48a0e51e');
      });

    });
  
    describe('Test for checking the MMR properties as the range increases', async () => {
      let mmr: Contract;
      before(async () => {
        mmr = await deployContract("MMR", [], { wallet: ownerWallet, silent: true });
      });
    
        for (let i = 0; i < 10; i++) {
          it(`should have correct properties after ${i} appends`, async () => {
            await mmr.append(`0x000${i}`);
            const size = BigInt(await mmr.getSize());
            const width = BigInt(await mmr.getWidth());
            const peaks = await mmr.getPeaks();
      
            const expectedSize = (width << BigInt(1)) - BigInt(await mmr.numOfPeaks(width));
            const expectedWidth = BigInt(i + 1);
            const expectedPeaks = BigInt(await mmr.numOfPeaks(width));
      
            expect(size.toString()).to.equal(expectedSize.toString());
            expect(width.toString()).to.equal(expectedWidth.toString());
            expect(peaks.length).to.equal(Number(expectedPeaks));
          });
        }
      });
    });
    describe("MMR with Complete Test Suite", async () => {
    });
  });    
});

