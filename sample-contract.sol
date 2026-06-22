// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract VulnerableBank {

    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // Vulnerability 1: Reentrancy
    // External call happens BEFORE the balance is updated,
    // allowing an attacker's fallback function to re-enter withdraw()
    // and drain funds before balances[msg.sender] is set to zero.
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    // Vulnerability 2: Missing access control
    // Any address can call this and change the owner,
    // since there is no onlyOwner check.
    function setOwner(address newOwner) public {
        owner = newOwner;
    }

    // Vulnerability 3: Unprotected selfdestruct
    // Anyone can call this and destroy the contract,
    // sending all remaining funds to themselves.
    function destroy() public {
        selfdestruct(payable(msg.sender));
    }

    // Vulnerability 4: Use of tx.origin for authorization
    // tx.origin can be manipulated via a malicious intermediary contract,
    // making this check unsafe compared to msg.sender.
    function adminAction() public {
        require(tx.origin == owner, "Not authorized");
        // perform some admin-only logic
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
