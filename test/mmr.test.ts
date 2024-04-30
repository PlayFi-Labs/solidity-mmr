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
      { game: 'Elder Scrolls V: Skyrim', character: 'Dragonborn', ability: 'Fus Ro Dah' },
      { game: 'Halo', character: 'Master Chief', weapon: 'Energy Sword' },
      { game: 'Call of Duty', weapon: 'M4A1', attachment: 'Red Dot Sight' },
      { game: 'Battlefield', vehicle: 'Tank', model: 'T-34' },
      { game: 'The Witcher 3', character: 'Geralt', ability: 'Igni' },
      { game: 'Cyberpunk 2077', character: 'V', ability: 'Hack' },
      { game: 'Animal Crossing', item: 'Fishing Rod', material: 'Bamboo' },
      { game: 'Super Mario Odyssey', character: 'Mario', ability: 'Triple Jump' },
      { game: 'Dark Souls III', character: 'Ashen One', weapon: 'Sword of Fire' },
      { game: 'Bloodborne', character: 'Hunter', weapon: 'Hunter\'s Axe' },
      { game: 'Sekiro', character: 'Wolf', ability: 'Shinobi Prosthetic' },
      { game: 'Street Fighter V', character: 'Ryu', ability: 'Hadoken' },
      { game: 'Tekken 7', character: 'Jin Kazama', ability: 'Electric Wind God Fist' },
      { game: 'Genshin Impact', character: 'Diluc', ability: 'Dawn' },
      { game: 'Destiny 2', character: 'Cayde-6', weapon: 'Ace of Spades' },
      { game: 'Borderlands 3', character: 'Moze', ability: 'Iron Bear' },
      { game: 'Assassin\'s Creed Odyssey', character: 'Kassandra', ability: 'Spartan Kick' },
      { game: 'Star Wars Jedi: Fallen Order', character: 'Cal Kestis', ability: 'Force Push' },
      { game: 'Monster Hunter World', weapon: 'Long Sword', material: 'Dragonbone' },
      { game: 'Mass Effect 3', character: 'Shepard', ability: 'Biotic Charge' },
      { game: 'Diablo III', character: 'Necromancer', ability: 'Corpse Explosion' },
      { game: 'Path of Exile', character: 'Exile', ability: 'Vaal Skill' }
    ];    

    for (let i = 0; i < gamingData.length; i++) {
      const dataBytes = ethers.toUtf8Bytes(JSON.stringify(gamingData[i]));
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
    describe("Validate correct peak index calculation", function() {
      beforeEach(async function () {
        mmrContract = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
      });
      it("should return 2 peaks when total elements are 3", async function() {
          for (let i = 0; i < 3; i++) { // Include 3 elements total from scratch
              await mmrContract.append(dataHash[i]);
          }
          const width = await mmrContract.getWidth();
          const res = await mmrContract.numOfPeaks(width);
          expect(res).to.equal(2n); // Correct for 3 elements (11 in binary)
      });
  
      it("should return 3 peaks when total elements are 7", async function() {
          for (let i = 0; i < 7; i++) { // Reset index to include 7 elements total from scratch
              await mmrContract.append(dataHash[i]);
          }
          const width = await mmrContract.getWidth();
          const res = await mmrContract.numOfPeaks(width);
          expect(res).to.equal(3n); // Correct for 7 elements (111 in binary)
      });
  
      it("should return 4 peaks when total elements are 15", async function() {
          for (let i = 0; i < 15; i++) { // Reset index to include 15 elements total from scratch
              await mmrContract.append(dataHash[i]);
          }
          const width = await mmrContract.getWidth();
          const res = await mmrContract.numOfPeaks(width);
          expect(res).to.equal(4n); // Correct for 15 elements (1111 in binary)
      });
  
      it("should return 5 peaks when total elements are 31", async function() {
          for (let i = 0; i < 31; i++) { // Reset index to include 31 elements total from scratch
              await mmrContract.append(dataHash[i]);
          }
          const width = await mmrContract.getWidth();
          const size = await mmrContract.getSize();
          const res = await mmrContract.numOfPeaks(width);
          expect(res).to.equal(5n); // Correct for 31 elements (11111 in binary)
      });
    describe('Validate correct peak indexes calculation', async () => {
      it ('should return peak indexes [15, 22, 25] when total elements are 14', async () => {
        const res = await mmrContract.getPeakIndexes(14);
        expect(res[0]).to.equal(15n);
        expect(res[1]).to.equal(22n);
        expect(res[2]).to.equal(25n);
      });
      it ('should return peak indexes [15, 22, 25, 26] when total elements are 15', async () => {
        const res = await mmrContract.getPeakIndexes(15);
        expect(res[0]).to.equal(15n);
        expect(res[1]).to.equal(22n);
        expect(res[2]).to.equal(25n);
        expect(res[3]).to.equal(26n);
      });
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
  });

  context('Test for checking the MMR properties as the range increases', async () => {
    describe('MMR with Append Test Suite', async () => {
      let mmr: Contract;
      before(async () => {
        mmr = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
      });
        for (let i = 0; i < dataHash.length; i++) {
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
  });

  context('MMR with Complete Test Suite', function () {
    describe('when 31 elements are appended', function () {
      let mmr: Contract;
      before(async () => {
        mmr = await deployContract('MMR', [], { wallet: ownerWallet, silent: true });
        for (let i = 0; i < dataHash.length; i++) {
          const hash = dataHash[i];
          await mmr.append(hash);
        }
      });
      it('should verify each hash was correctly inserted', async function () {
        for (let i = 0; i < dataHash.length; i++) {
          const hash = dataHash[i];
          const hashExists = await mmr.isHashAppended(hash);
          expect(hashExists).to.be.true;
        }
      });
      it('should not find non-existent hashes in the tree', async function () {
        const nonExistentHash = ethers.keccak256('0x1234567890abcdef');
        const hashNotExists = await mmr.isHashAppended(nonExistentHash);
        expect(hashNotExists).to.be.false;
      });
      it('should return a non-zero root hash', async function () {
        const root = await mmr.getRoot();
        expect(root).to.not.empty;
      });
      it('should return the correct Merkle proof for a valid leaf index', async function () {
        const index = 8;
        const totalSize = await mmr.getSize();
        expect(index).to.be.greaterThan(0);
        expect(index).to.be.lessThanOrEqual(Number(totalSize));
    
        const isLeaf = await mmr.isLeaf(index);
        expect(isLeaf).to.be.true;
    
        if (isLeaf) {
          const proof = await mmr.getMerkleProof(index);
          expect(proof).to.exist;
          expect(proof.root).to.exist;
          expect(proof.width).to.equal(await mmr.getWidth());
          expect(proof.peakBaggingArray).to.exist;
          expect(proof.siblings).to.exist;
        }
      });
      it('should return the correct size', async function () {
        const size = await mmr.getSize();
        expect(size).to.equal(57n);
      });
      it('should return the correct width', async function () {
        const width = await mmr.getWidth();
        expect(width).to.equal(31n);
      });
      it('should return the correct number of peaks', async function () {
        const width = await mmr.getWidth();
        const peaks = await mmr.numOfPeaks(width);
        expect(peaks).to.equal(5n);
      });
      it('should return the correct peak indexes for 31 elements', async function () {
        const peakIndexes = await mmr.getPeakIndexes(31);
        expect(peakIndexes[0]).to.equal(31n);
        expect(peakIndexes[1]).to.equal(46n);
        expect(peakIndexes[2]).to.equal(53n);
        expect(peakIndexes[3]).to.equal(56n);
        expect(peakIndexes[4]).to.equal(57n);
      });  
    });
  });    
});