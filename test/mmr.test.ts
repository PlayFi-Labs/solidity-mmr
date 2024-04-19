import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';


describe.only("MMR", function () {
  let mmrContract: Contract;
  let ownerWallet: Wallet;
  let userWallet: Wallet;


  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    userWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
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
        console.log(res);
        expect(res.left).to.equal(1n);
        expect(res.right).to.equal(2n);
      });
      it('should return 7,14 as children for 15', async () => {
        const res = await mmrContract.getChildren(15);
        console.log(res);
        expect(res.left).to.equal(7n);
        expect(res.right).to.equal(14n);
      });
      it ('should return 30,15 as children for 31', async () => {
        const res = await mmrContract.getChildren(31);
        console.log(res);
        expect(res.left).to.equal(15n);
        expect(res.right).to.equal(30n);
      });
      it('should be reverted for leaves like 1,2,4', async () => {
        try {
            await mmrContract.getChildren(1);
            expect.fail("Expected getChildren to revert for leaf 1, but it didn't");
        } catch (error) {
            expect(error.message).to.include("Not a parent");
        }

        try {
            await mmrContract.getChildren(2);
            expect.fail("Expected getChildren to revert for leaf 2, but it didn't");
        } catch (error) {
            expect(error.message).to.include("Not a parent");
        }
    
        try {
            await mmrContract.getChildren(4);
            expect.fail("Expected getChildren to revert for leaf 4, but it didn't");
        } catch (error) {
            expect(error.message).to.include("Not a parent");
        }
      });
    });
  });
});

