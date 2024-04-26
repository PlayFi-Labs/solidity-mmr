import { expect } from 'chai';
import { Contract, Wallet } from 'zksync-ethers';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { createHash } from 'crypto';
import { ethers } from 'ethers';

describe('MMR', function () {
  let mmrContract: Contract;
  let ownerWallet: Wallet;
  let dataHash: Array<string> = [];

  before(async function () {
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    mmrContract = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
    console.log('MMR Tree : 5 |                             31');
    console.log('           4 |             15                                 30                                    46');
    console.log('           3 |      7             14                 22                 29                 38                 45');
    console.log('           2 |   3      6     10       13       18       21        25       28        34        37       41        44       49');
    console.log('           1 | 1  2   4  5   8  9    11  12   16  17    19  20   23  24    26  27   32  33    35  36   39  40    42  43   47  48    50');
    console.log('       width | 1  2   3  4   5  6     7   8    9  10    11  12   13  14    15  16   17  18    19  20   21  22    23  24   25  26    27');

    const gamingData = [
      { game: 'League of Legends', character: 'Ahri', ability: 'Orb of Deception' },
      { game: 'World of Warcraft', character: 'Thrall', ability: 'Earthquake' },
      { game: 'Fortnite', weapon: 'Pump Shotgun', material: 'Wood' },
      { game: 'Valorant', character: 'Sage', ability: 'Resurrection' },
      { game: 'Overwatch', character: 'Mercy', ability: 'Valkyrie' },
      { game: 'Dota 2', character: 'Invoker', ability: 'Sun Strike' },
      { game: 'Apex Legends', character: 'Lifeline', ability: 'Combat Medic' },
      { game: 'Minecraft', tool: 'Pickaxe', material: 'Diamond' },
      { game: 'FIFA 2022', team: 'Real Madrid', player: 'Karim Benzema' },
      { game: 'Elder Scrolls V: Skyrim', character: 'Dragonborn', ability: 'Fus Ro Dah' }
    ];
    

    for (let i = 0; i < gamingData.length; i++) {
        // Convert the object to a JSON string and then to bytes
        const dataBytes = ethers.toUtf8Bytes(JSON.stringify(gamingData[i]));
    
        // Hash the data
        const dataHashed = ethers.keccak256(dataBytes);
    
        dataHash.push(dataHashed);
    }
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

        await mmrContract.append(dataHash[0]);
        await mmrContract.append(dataHash[1]);
        await mmrContract.append(dataHash[2]);

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
            expect.fail('Expected getChildren to revert for leaf 1, but it didnt');
        } catch (error) {
            expect((error as Error).message).to.include('Not a parent');
        }

        try {
            await mmrContract.getChildren(2);
            expect.fail('Expected getChildren to revert for leaf 2, but it didnt');
        } catch (error) {
            expect((error as Error).message).to.include('Not a parent');
        }
    
        try {
            await mmrContract.getChildren(4);
            expect.fail('Expected getChildren to revert for leaf 4, but it didnt');
        } catch (error) {
            expect((error as Error).message).to.include('Not a parent');
        }
      });
    });
  context('Test for checking the MerkleProof creation', async () => {
      let mmr;
      let res: Array<undefined>;

      before(async () => {
        mmr = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
        // Check if mmr is defined
        if (!mmr) {
          throw new Error('MMR contract is not defined');
        }

        for (let i = 0; i < 7; i++) {
          // Check if dataHash[i] is defined
          if (!dataHash[i]) {
              throw new Error(`dataHash at index ${i} is not defined`);
          }
        
          await mmr.append(dataHash[i]);
        }
        const index = 8;
        res = await mmr.getMerkleProof(index);
        if (!res || !Array.isArray(res) || res.length < 3) {
            throw new Error('getMerkleProof did not return expected result');
        }
      });
    describe('Validate Merkle Proof creation', async () => {
      it('should return a non-empty root value', async () => {
          expect(res[0]).to.not.empty;
      });
      it('should return 7 for its width', async () => {
          expect(res[1]).to.equal(7n);
      });
      it('should return non-empty peaks', async () => {
          expect(res[2][0]).to.not.empty;
          expect(res[2][1]).to.not.empty;
          expect(res[2][2]).to.not.empty;
      });
      it('should return a non-empty hash value at index 9 as its sibling', async () => {
          expect(res[3][0]).to.not.empty;
      });
    });
  
    describe('Test for checking the MMR properties as the range increases', async () => {
      let mmr: Contract;
      before(async () => {
        mmr = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
      });
    
        for (let i = 0; i < 10; i++) {
          it(`should have correct properties after ${i} appends`, async () => {
            await mmr.append(dataHash[i]);
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
    describe('MMR with Complete Test Suite', function () {
      let mmrContract: Contract;
      let ownerWallet: Wallet;
    
      // Helper function to create SHA-256 hash from JSON data
      function gamingData(data: any) {
        return '0x' + createHash('sha256').update(JSON.stringify(data)).digest('hex');
      }
    
      before(async function () {
        ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        mmrContract = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
      });
    
      describe('MMR Initial and Basic Functional Tests', function () {
        it('Initialize MMR with no prior data, should be empty', async function () {
          const root = await mmrContract.getRoot();
          expect(root).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    
          const size = await mmrContract.getSize();
          expect(size).to.equal(0n);
    
          const peaks = await mmrContract.getPeaks();
          expect(peaks).to.be.empty;
        });
    
        it('Initialize MMR and append data', async function () {
          const initialRoot = await mmrContract.getRoot();
          expect(initialRoot).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
    
          const initialSize = await mmrContract.getSize();
          expect(initialSize).to.equal(0n);
    
          await mmrContract.append(dataHash[0]);
          await mmrContract.append(dataHash[1]);
          await mmrContract.append(dataHash[2]);
    
          const newRoot = await mmrContract.getRoot();
          const newSize = await mmrContract.getSize();
    
          expect(newRoot).to.not.equal(initialRoot);
          expect(newSize).to.not.equal(initialSize);
        });
      });
    
      describe('Test appending and verifying gaming data hashes in MMR', function () {
        let dataHash: Array<string> = [];
        before(async function () {
          for (let i = 0; i < dataHash.length; i++) {
            const dataBytes = ethers.toUtf8Bytes(JSON.stringify(dataHash[i]));
            await mmrContract.append(dataBytes);
            dataHash.push(dataBytes.toString());
          }
        });
        it('should append hashes and verify each hash was correctly inserted', async function () {
          for (let i = 0; i < dataHash.length; i++) {
            const dataBytes = ethers.toUtf8Bytes(JSON.stringify(dataHash[i]));
            
            const hashExists = await mmrContract.isHashAppended(dataBytes);
            expect(hashExists).to.be.true;
          }
        });
        it('should not find non-existent hashes in the tree', async function () {
          const nonExistentHash = ethers.keccak256('0x1234567890abcdef');
      
          const hashNotExists = await mmrContract.isHashAppended(nonExistentHash);
          expect(hashNotExists).to.be.false;
        });
      });
    });
  });    
});

