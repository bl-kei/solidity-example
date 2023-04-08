// SPDX-License-Identifier: MIT License
pragma solidity >= 0.8.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExToken is ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    _mint(msg.sender, 10000 * (10**18));
  }
}
