// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) claimedAirdropList;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {

    }

    function airdrop() external {
        require(claimedAirdropList[msg.sender] == false, "This user has claimed airdrop already");
        _mint(msg.sender, 1000000);
        claimedAirdropList[msg.sender] = true;
    }

}
