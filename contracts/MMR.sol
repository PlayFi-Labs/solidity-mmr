//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @author Wanseob Lim <email@wanseob.com>
 * @title Merkle Mountain Range solidity library
 *
 * @dev The index of this MMR implementation starts from 1 not 0.
 *      And it uses keccak256 for its hash function instead of blake2b
 */

/// @title A contract to implement Merkle Mountain Range
/// @dev This contract is a contract to implement Merkle Mountain Range (MMR) in Solidity.
 contract MMR {

    /// @dev The struct to store the Merkle Mountain Range (MMR data
    /// @param root The root hash of the tree
    /// @param size The size of the tree
    /// @param width The width of the tree
    /// @param hashes mapping of hashes for nodes
    /// @param data mapping of leaf data
    struct Tree {
        bytes32 root;
        uint256 size;
        uint256 width;
        mapping(uint256 => bytes32) hashes;
        mapping(bytes32 => bool) hashExists;

    }

    Tree private tree;

    /// @dev This function is used to append a new hash data to the tree
    /// @param dataHash The data hashed to be appended to the tree
    function append(bytes32 dataHash) public {
        bytes32 leaf = hashLeaf(tree.size + 1, dataHash);
        // Put the hashed leaf to the map
        tree.hashes[tree.size + 1] = leaf;
        // Add the hash to the hashExists mapping
        tree.hashExists[dataHash] = true;
        tree.width += 1;
        // Find peaks for the enlarged tree
        uint256[] memory peakIndexes = getPeakIndexes(tree.width);
        // The right most peak's value is the new size of the updated tree
        tree.size = getSize(tree.width);
        // Starting from the left-most peak, get all peak hashes using _getOrCreateNode() function.
        bytes32[] memory peaks = new bytes32[](peakIndexes.length);
        for (uint i = 0; i < peakIndexes.length; i++) {
            peaks[i] = _getOrCreateNode(tree, peakIndexes[i]);
        }
        // Create the root hash and update the tree
        tree.root = peakBagging(tree.width, peaks);
    }

    /// @dev This function is used to get the peaks of the tree
    /// @return peaks of the tree
    function getPeaks() public view returns (bytes32[] memory peaks) {
        // Find peaks for the enlarged tree
        uint256[] memory peakNodeIndexes = getPeakIndexes(tree.width);
        // Starting from the left-most peak, get all peak hashes using _getOrCreateNode() function.
        peaks = new bytes32[](peakNodeIndexes.length);
        for (uint i = 0; i < peakNodeIndexes.length; i++) {
            peaks[i] = tree.hashes[peakNodeIndexes[i]];
        }
        return peaks;
    }

    /// @dev This function is used to get the leaf index of the tree
    /// @param width The width of the tree
    /// @return leaf index of the tree
    function getLeafIndex(uint width) public pure returns (uint) {
        if(width % 2 == 1) {
            return getSize(width);
        } else {
            return getSize(width - 1) + 1;
        }
    }

    /// @dev This function is used to get the size of the tree
    /// @param width The width of the tree
    /// @return size of the tree
    function getSize(uint width) public pure returns (uint256) {
        return (width << 1) - numOfPeaks(width);
    }

    /// @dev This function is used to get the width of the Merkle Mountain Range (MMR)
    /// @return width The width of the MMR
    function getWidth() public view returns (uint) {
        return tree.width;
    }

    /// @dev This function is used to get the root of the tree
    /// @return root value of the tree
    function getRoot() public view returns (bytes32) {
        return tree.root;
    }

    /// @dev This function is used to get the size of the tree
    /// @return size of the tree
    function getSize() public view returns (uint256) {
        return tree.size;
    }

    /// @dev This function is used to get the node of the tree
    /// @param index The index of the tree
    /// @return the hash value of a node for the given position. Note that the index starts from 1
    function getNode(uint256 index) public view returns (bytes32) {
        return tree.hashes[index];
    }


    /// @dev This function is used to get the merkle proof of the tree and returns merkle proof for a leaf. Note that the index starts from 1
    /// @param index The index of the tree
    function getMerkleProof(uint256 index) public view returns (
        bytes32 root,
        uint256 width,
        bytes32[] memory peakBaggingArray,
        bytes32[] memory siblings
    ){
        require(index < tree.size, "Out of range");
        require(isLeaf(index), "Not a leaf");

        root = tree.root;
        width = tree.width;
        // Find all peaks for bagging
        uint256[] memory peaks = getPeakIndexes(tree.width);

        peakBaggingArray = new bytes32[](peaks.length);
        uint256 cursor;
        for (uint i = 0; i < peaks.length; i++) {
            // Collect the hash of all peaks
            peakBaggingArray[i] = tree.hashes[peaks[i]];
            // Find the peak which includes the target index
            if (peaks[i] >= index && cursor == 0) {
                cursor = peaks[i];
            }
        }
        uint256 leftIndex;
        uint256 rightIndex;

        // Get hashes of the siblings in the mountain which the index belongs to.
        // It moves the cursor from the summit of the mountain down to the target index
        uint8 height = heightAt(cursor);
        siblings = new bytes32[](height - 1);
        while (cursor != index) {
            height--;
            (leftIndex, rightIndex) = getChildren(cursor);
            // Move the cursor down to the left side or right side
            cursor = index <= leftIndex ? leftIndex : rightIndex;
            // Remaining node is the sibling
            siblings[height - 1] = tree.hashes[index <= leftIndex ? rightIndex : leftIndex];
        }
    }

    /// @dev This function is used to get the merkle proof of the tree and returns merkle proof for a leaf.
    /// @param root The root of the tree
    /// @param width The width of the tree
    /// @param peaks The peaks of the tree
    /// @param itemHashes The item hashes of the tree
    /// @return newRoot of the tree
    function rollUp(
        bytes32 root,
        uint256 width,
        bytes32[] memory peaks,
        bytes32[] memory itemHashes
    ) public pure returns (bytes32 newRoot) {
        // Check the root equals the peak bagging hash
        require(root == peakBagging(width, peaks), "Invalid root hash from the peaks");
        uint tmpWidth = width;
        bytes32[255] memory tmpPeakMap = peaksToPeakMap(width, peaks);
        for (uint i = 0; i < itemHashes.length; i++) {
            tmpPeakMap = peakUpdate(tmpWidth, tmpPeakMap, itemHashes[i]);
            tmpWidth++;
        }
        return peakBagging(tmpWidth, peakMapToPeaks(tmpWidth, tmpPeakMap));
    }

    /// @dev This auxiliar function is used to get the merkle proof of the tree and returns merkle proof for a leaf.
    /// @param width The width of the tree
    /// @param peaks The peaks of the tree
    /// @return newRoot of the tree
    function peakBagging(uint256 width, bytes32[] memory peaks) public pure returns (bytes32) {
        uint size = getSize(width);
        require(numOfPeaks(width) == peaks.length, "Received invalid number of peaks");
        return keccak256(abi.encodePacked(size, keccak256(abi.encodePacked(size, peaks))));
    }

    /// @dev This auxiliar function is used to get the merkle proof of the tree and returns merkle proof for a leaf.
    /// @param width The width of the tree
    /// @param peaks The peaks of the tree
    /// @return peakMap of the tree
    function peaksToPeakMap(uint width, bytes32[] memory peaks) public pure returns (bytes32[255] memory peakMap) {
        uint bitIndex;
        uint peakRef;
        uint count = peaks.length;
        for(uint height = 1; height <= 255; height++) {
            // Index starts from the right most bit
            bitIndex = 255 - height;
            peakRef = 1 << (height - 1);
            if((width & peakRef) != 0) {
                peakMap[bitIndex] = peaks[--count];
            } else {
                peakMap[bitIndex] = bytes32(0);
            }
        }
        require(count == 0, "Invalid number of peaks");
    }

    /// @dev This auxiliar function is used to get the merkle proof of the tree and returns merkle proof for a leaf.
    /// @param width The width of the tree
    /// @param peakMap The peakMap of the tree
    /// @return peaks of the tree
    function peakMapToPeaks(uint width, bytes32[255] memory peakMap) public pure returns (bytes32[] memory peaks) {
        uint arrLength = numOfPeaks(width);
        peaks = new bytes32[](arrLength);
        uint count = 0;
        for(uint i = 0; i < 255; i++) {
            if(peakMap[i] != bytes32(0)) {
                peaks[count++] = peakMap[i];
            }
        }
        require(count == arrLength, "Invalid number of peaks");
    }


    /// @dev This auxiliar function is used to update the peakMap of the tree
    /// @param width The width of the tree
    /// @param prevPeakMap The prevPeakMap of the tree
    /// @param itemHash The itemHash of the tree
    /// @return nextPeakMap of the tree
    function peakUpdate(
        uint width,
        bytes32[255] memory prevPeakMap,
        bytes32 itemHash
    ) public pure returns (
        bytes32[255] memory nextPeakMap
    ) {
        uint newWidth = width + 1;
        uint cursorIndex = getLeafIndex(newWidth);
        bytes32 cursorNode = hashLeaf(cursorIndex, itemHash);
        uint bitIndex;
        uint peakRef;
        bool prevPeakExist;
        bool nextPeakExist;
        bool obtained;

        for(uint height = 1; height <= 255; height++) {
            // Index starts from the right most bit
            bitIndex = 255 - height;
            if(obtained) {
                nextPeakMap[bitIndex] = prevPeakMap[bitIndex];
            } else {
                peakRef = 1 << (height - 1);
                prevPeakExist = (width & peakRef) != 0;
                nextPeakExist = (newWidth & peakRef) != 0;

                // Get new cursor node with hashing the peak and the current cursor
                cursorIndex++;
                if(prevPeakExist) {
                    cursorNode = hashBranch(cursorIndex, prevPeakMap[bitIndex], cursorNode);
                }
                // If new peak exists for the bit index
                if(nextPeakExist) {
                    // If prev peak exists for the bit index
                    if(prevPeakExist) {
                        nextPeakMap[bitIndex] = prevPeakMap[bitIndex];
                    } else {
                        nextPeakMap[bitIndex] = cursorNode;
                    }
                    obtained = true;
                } else {
                    nextPeakMap[bitIndex] = bytes32(0);
                }
            }
        }
    }


    //// @dev This function verifies if a given value exists in the Merkle Mountain Range (MMR) tree. It uses the concept of an inclusion proof, which is a proof that an element is a member of a set. 
    //// @param root The root of the MMR.
    //// @param width The width of the MMR.
    //// @param index The index of the item in the MMR.
    //// @param value The value of the item.
    //// @param peaks The peaks of the MMR.
    //// @param siblings The siblings in the MMR.
    //// @return A boolean value indicating whether the given value exists in the MMR.
    function verifyProof(
        bytes32 root,
        uint256 width,
        uint256 index,
        bytes memory value,
        bytes32[] memory peaks,
        bytes32[] memory siblings
    ) public pure returns (bool) {
        uint size = getSize(width);
        require(size >= index, "Index is out of range");
        // Check the root equals the peak bagging hash
        require(root == keccak256(abi.encodePacked(size, keccak256(abi.encodePacked(size, peaks)))), "Invalid root hash from the peaks");

        // Find the mountain where the target index belongs to
        uint256 cursor;
        bytes32 targetPeak;
        uint256[] memory peakIndexes = getPeakIndexes(width);
        for (uint i = 0; i < peakIndexes.length; i++) {
            if (peakIndexes[i] >= index) {
                targetPeak = peaks[i];
                cursor = peakIndexes[i];
                break;
            }
        }
        require(targetPeak != bytes32(0), "Target is not found");

        // Find the path climbing down
        uint256[] memory path = new uint256[](siblings.length + 1);
        uint256 left;
        uint256 right;
        uint8 height = uint8(siblings.length) + 1;
        while (height > 0) {
            // Record the current cursor and climb down
            path[--height] = cursor;
            if (cursor == index) {
                // On the leaf node. Stop climbing down
                break;
            } else {
                // On the parent node. Go left or right
                (left, right) = getChildren(cursor);
                cursor = index > left ? right : left;
                continue;
            }
        }

        // Calculate the summit hash climbing up again
        bytes32 node;
        while (height < path.length) {
            // Move cursor
            cursor = path[height];
            if (height == 0) {
                // cursor is on the leaf
                node = hashLeaf(cursor, keccak256(value));
            } else if (cursor - 1 == path[height - 1]) {
                // cursor is on a parent and a sibling is on the left
                node = hashBranch(cursor, siblings[height - 1], node);
            } else {
                // cursor is on a parent and a sibling is on the right
                node = hashBranch(cursor, node, siblings[height - 1]);
            }
            // Climb up
            height++;
        }

        // Computed hash value of the summit should equal to the target peak hash
        require(node == targetPeak, "Hashed peak is invalid");
        return true;
    }

    /// @dev This function takes indexes and hashes of the left and right children for returning the hash of the packed index, left, and right parameters
    /// @param index The index of the node in the Merkle tree.
    /// @param left The hash of the left child node.
    /// @param right The hash of the right child node.
    /// @return The keccak256 hash of a parent node with hash(M | Left child | Right child). Note M is the index of the node
    function hashBranch(uint256 index, bytes32 left, bytes32 right) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(index, left, right));
    }

    /// @dev This function takes an index and a data hash for returning the hash of a leaf node
    /// @param dataHash The hash of the data for the leaf node.
    /// @return The keccak256 hash of the hash of a leaf node with hash(M | DATA ) M is the index of the node
    function hashLeaf(uint256 index, bytes32 dataHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(index, dataHash));
    }

    /// @dev Check if a specific hash exists in the MMR
    /// @param hash The hash to check
    /// @return Boolean indicating if the hash exists in the tree
    function isHashAppended(bytes32 hash) public view returns (bool) {
        return tree.hashExists[hash];
    }

    /// @dev This function calculates the height of a mountain (sub-tree) in a Merkle Mountain Range (MMR) given its size
    /// @param size The number of nodes in the mountain.
    /// @return The height of the highest peak
    function mountainHeight(uint256 size) public pure returns (uint8) {
        uint8 height = 1;
        while (uint256(1) << height <= size + height) {
            height++;
        }
        return height - 1;
    }

    /// @dev This function calculates the height of a node at a given index in a Merkle Mountain Range (MMR)
    /// @param index The index of the node in the MMR.
    /// @return height of the index
    function heightAt(uint256 index) public pure returns (uint8 height) {
        uint256 reducedIndex = index;
        uint256 peakIndex;
        // If an index has a left mountain subtract the mountain
        while (reducedIndex > peakIndex) {
            reducedIndex -= (uint256(1) << height) - 1;
            height = mountainHeight(reducedIndex);
            peakIndex = (uint256(1) << height) - 1;
        }
        // Index is on the right slope
        height = height - uint8((peakIndex - reducedIndex));
    }

    /// @dev This function checks if a node at a given index in a Merkle Mountain Range (MMR) is a leaf node
    /// @param index The index of the node in the MMR.
    /// @return A boolean indicating whether the index is the leaf node or not
    function isLeaf(uint256 index) public pure returns (bool) {
        return heightAt(index) == 1;
    }

    /// @dev This function calculates the indices of the left and right children of a node at a given index in a Merkle Mountain Range (MMR)
    /// @param index The index of the node in the MMR
    /// @return left The index of the left child node
    function getChildren(uint256 index) public pure returns (uint256 left, uint256 right) {
        left = index - (uint256(1) << (heightAt(index) - 1));
        right = index - 1;
        require(left != right, "Not a parent");
    }

    /// @dev This function calculates the indices of the peaks in a Merkle Mountain Range (MMR) given its width
    /// @param width The width of the MMR
    /// @return peakIndexes all peaks of the smallest merkle mountain range tree which includes the given index(size)
    function getPeakIndexes(uint256 width) public pure returns (uint256[] memory peakIndexes) {
        peakIndexes = new uint256[](numOfPeaks(width));
        uint count;
        uint size;
        for(uint i = 255; i > 0; i--) {
            if(width & (1 << (i - 1)) != 0) {
                // peak exists
                size = size + (1 << i) - 1;
                peakIndexes[count++] = size;
            }
        }
        require(count == peakIndexes.length, "Invalid bit calculation");
    }


    /// @dev This function calculates the number of peaks in a Merkle Mountain Range (MMR) given its width
    /// @param width The width of the MMR.
    /// @return num The number of peaks in the MMR.
    function numOfPeaks(uint256 width) public pure returns (uint num) {
        uint256 bits = width;
        while(bits > 0) {
            if(bits % 2 == 1) num++;
            bits = bits >> 1;
        }
        return num;
    }

    /// @dev This function retrieves the hash of a node at a given index in the Merkle Mountain Range (MMR) stored in the given tree
    /// @param tree The MMR tree stored in storage.
    /// @param index The index of the node in the MMR.
    /// @return The hash of the node at the given index.
    function _getOrCreateNode(Tree storage tree, uint256 index) private returns (bytes32) {
        require(index <= tree.size, "Out of range");
        if (tree.hashes[index] == bytes32(0)) {
            (uint256 leftIndex, uint256 rightIndex) = getChildren(index);
            bytes32 leftHash = _getOrCreateNode(tree, leftIndex);
            bytes32 rightHash = _getOrCreateNode(tree, rightIndex);
            tree.hashes[index] = hashBranch(index, leftHash, rightHash);
        }
        return tree.hashes[index];
    }
}