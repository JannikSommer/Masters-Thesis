// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

/// @title Controlling access from other addresses.
/// @author Jannik Lucas Sommer & Magnus Mølgaard Lund.
/// @notice Derived from OpenZeppelin Address.sol.
contract MessageControlable {
  /// @notice Requires that message sender is not the origin of the transaction. 
  /// @dev 'msg.sender.code.length > 0' was not usable in the require statement
  ///      when the message.sender was in a constructor call. 
  modifier onlyContract() {
    require(msg.sender != tx.origin, "Call only accesible from smart contract");
    _;
  }
}