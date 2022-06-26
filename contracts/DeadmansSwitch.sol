// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DeadmansSwitch is Ownable {
    uint256 public blockFrequency = 10;
    uint256 public lastBlock;

    address public emergencyAddress;

    event ReceivedEther(address indexed sender, uint256 amount);
    event RescuedFunds(
        address indexed caller,
        address indexed emergencyAddress,
        uint256 amount
    );

    constructor(address _emergencyAddress) {
        lastBlock = block.number;
        emergencyAddress = _emergencyAddress;
    }

    receive() external payable {
        emit ReceivedEther(msg.sender, msg.value);
    }

    function setBlockFrequency(uint256 _blockFrequency) external onlyOwner {
        blockFrequency = _blockFrequency;
    }

    function setEmergencyAddress(address _emergencyAddress) external onlyOwner {
        emergencyAddress = _emergencyAddress;
    }

    function stillAlive() public onlyOwner {
        lastBlock = block.number;
    }

    function rescueFunds() external {
        if (block.number > lastBlock + blockFrequency) {
            uint256 balance = address(this).balance;
            payable(emergencyAddress).transfer(balance);
            emit RescuedFunds(msg.sender, emergencyAddress, balance);
        }
    }
}
