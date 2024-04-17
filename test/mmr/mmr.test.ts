import { expect } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../../deploy/utils';

describe("MMR", function () {
  let MMRContract: Contract;
  let ownerWallet: Wallet;
  let userWallet: Wallet;

  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    userWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    MMRContract = await deployContract("MMR", [], { wallet: ownerWallet, silent: true });
    console.log('MMR Tree : 5 |                             31');
    console.log('           4 |             15                                 30                                    46');
    console.log('           3 |      7             14                 22                 29                 38                 45');
    console.log('           2 |   3      6     10       13       18       21        25       28        34        37       41        44       49');
    console.log('           1 | 1  2   4  5   8  9    11  12   16  17    19  20   23  24    26  27   32  33    35  36   39  40    42  43   47  48    50');
    console.log('       width | 1  2   3  4   5  6     7   8    9  10    11  12   13  14    15  16   17  18    19  20   21  22    23  24   25  26    27');
  });

  context('Test pure functions', async () => {
    describe.only('getChildren()', async () => {
      it('should return 1,2 as children for 3', async () => {
        const res = await MMRContract.getChildren(3);
        console.log(res);
        expect(res.left).to.equal(1n);
        expect(res.right).to.equal(2n);
      });
      it('should return 7,14 as children for 15', async () => {
        const res = await MMRContract.getChildren(15);
        console.log(res);
        expect(res.left).to.equal(7n);
        expect(res.right).to.equal(14n);
      });
    });
    describe('getPeakIndexes()', async () => {
    });
    describe('hashBranch()', async () => {
    });
    describe('hashLeaf()', async () => {
    });
    describe('mountainHeight()', async () => {
    });
  });
});

