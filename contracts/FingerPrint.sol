// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
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
  using Strings for string;

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

  /// @dev Function to append a new hash to the MMR
  /// @param dataHash The data hash to append to the MMR
  function appendData(bytes32 dataHash) public {
    require(dataHash != bytes32(0), InvalidDataHash());
    require(!isHashAppended(dataHash), DataHashAlreadyAppended());
    append(dataHash);
  }

}