// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

/// @title Event data capabilities experiment
/// @notice Test properties of events in Ethereum
contract FirstExepriment {
  event Announcement(
    string indexed prop1,
    string indexed prop2,
    string indexed prop3,
    string prop4, 
    string prop5
  );

  function announce(
    string memory prop1,
    string memory prop2,
    string memory prop3,
    string memory prop4,
    string memory prop5) public {
    emit Announcement(prop1, prop2, prop3, prop4, prop5);
  }

}