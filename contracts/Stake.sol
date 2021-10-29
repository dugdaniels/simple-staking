//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

contract Stake is Ownable {

    using SafeERC20 for IERC20;

    mapping(address => uint) public stakes; // address => amount of tokens

    uint public minStake; // minimum stake amount
    IERC20 public token; // address of the token for stakes

    constructor(uint _minStake, IERC20 _token) {
        minStake = _minStake; 
        token = _token;
    } 

    function stake(uint _amount) public { 
        token.safeTransferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] += _amount;
    }

    function unstake(uint _amount) public {
        require(stakes[msg.sender] >= _amount);
        token.safeTransfer(msg.sender, _amount);
        stakes[msg.sender] -= _amount;
    }

    function isFullyStaked(address _address) public view returns (bool) {
        return stakes[_address] >= minStake;
    }

    function setMinStake(uint _minStake) public onlyOwner {
        minStake = _minStake;
    }
}
