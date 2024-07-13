// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./libraries/MMR.sol";
import "./interfaces/IFingerPrint.sol";

/*

                 .-+*###+-.
               =*%%%%%%%%%%#=:
               :=*%%%%%%%%%%%#+-.
                   .-+#%%%%%%%%%%%*=:
    :+##+-             :=#%%%%%%%%%%%#+-
   *%%%%%%%*=:            .-+#%%%%%%%%%%*.
  *%%%%%%%%#+:                :=#%%%%%%%%*
  #%%%%%%*:         .==:         .*%%%%%%%
  #%%%%%%=       :+#%%%%#+-       -%%%%#+:
  #%%%%%%=     :#%%%%%%%%%%#-     -%*=.
  #%%%%%%=     -%%%%%%%%%%%%=     .
  #%%%%%%=     -%%%%%%%%%%%%=
  #%%%%%%=     -%%%%%%%%%%%%=            :
  #%%%%%%=      .=*%%%%%%*=:         .-+#%
  #%%%%%%=          -++-.         :=#%%%%%
  *%%%%%%=                    .-+#%%%%%%%#
  .#%%%%%=                 :=*%%%%%%%%%%#:
    =*%%%=       #+-.  .-+#%%%%%%%%%%%*=
       -+=       #%%%##%%%%%%%%%%%#*-.
                 #%%%%%%%%%%%%%#=:
                 #%%%%%%%%%#*-.
                 :=*%%%%#=:

*/

/// @title FingerPrint Contract using Mountain Merkle Range Tree
/// @author eludius18
/// @notice This contract allows for the storage and retrieval of fingerprints (hashes)
/// @dev The contract uses keccak256 to generate the digital fingerprints of the entered data.
contract FingerPrint is 
Initializable,
AccessControlUpgradeable,
MMR,
IFingerPrint
{

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

  /* constructor() {
    _disableInitializers();
  } */

  /// @dev Initializes the contract
  /// @param admin The address of the admin
  function initialize(address admin) public initializer {
    __AccessControl_init();
    if (admin == address(0)) revert InvalidAddress(admin);
    _grantRole(ADMIN_ROLE, admin);
  }

  /// @dev Function to append a new hash to the MMR
  /// @param dataHash The data hash to append to the MMR
  function appendData(bytes32 dataHash) public override {
    require(dataHash != bytes32(0), InvalidDataHash());
    require(!isHashAppended(dataHash), DataHashAlreadyAppended());
    append(dataHash);
    emit DataHashAppended(dataHash);
  }

  /// @dev Function to check if a hash has been appended to the MMR
  /// @param dataHash The data hash to check
  /// @return Boolean indicating if the hash has been appended
  function isHashAppended(bytes32 dataHash) public view override(IFingerPrint, MMR) returns (bool) {
    return tree.hashExists[dataHash];
  }

    /// @dev Function to verify if a hash exists in the MMR using the Merkle proof
    /// @param dataHash The hash to verify
    /// @return Boolean indicating if the hash exists in the MMR
    function verifyHash(bytes32 dataHash) public view returns (bool) {
        uint256 index = tree.hashToIndex[dataHash];
        if (index == 0) revert InvalidHashIndex();
        (bytes32 root, uint256 width, bytes32[] memory peakBaggingArray, bytes32[] memory siblings) = getMerkleProof(index);
        bytes memory value = abi.encodePacked(dataHash);
        return verifyProof(root, width, index, value, peakBaggingArray, siblings);
    }
}
