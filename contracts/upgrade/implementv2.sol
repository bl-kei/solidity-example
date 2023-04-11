// SPDX-License-Identifier: MIT License
pragma solidity >= 0.8.0 < 0.9.0;

contract ImpleV2 {
  address public implementation;
  uint public x;

  function inc() external {
    x += 1;
  }
  function dec() external {
    x -= 1;
  }
}