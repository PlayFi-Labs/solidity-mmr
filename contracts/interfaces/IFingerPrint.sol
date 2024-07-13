// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;


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

/// @title FingerPrint Interface
/// @notice This interface defines the standard functions and events for the FingerPrint contract
/// @dev This interface is used to ensure the FingerPrint contract implements the necessary functions for handling data hashes
interface IFingerPrint
{
  event DataHashAppended(bytes32 indexed dataHash);

  error InvalidDataHash();
  error DataHashAlreadyAppended();
  error InvalidHashIndex();
  error InvalidAddress(address account);
  
  function appendData(bytes32 dataHash) external;
  function isHashAppended(bytes32 dataHash) external view returns (bool);
}
