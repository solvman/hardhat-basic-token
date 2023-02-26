// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

error Token__ZeroAddressNotAllowed();
error Token__SenderInsufficientFunds();
error Token__SpenderZeroAddressNotAllowed();
error Token__AllowanceInsufficientFunds();

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = totalSupply;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        if (_to == address(0x0)) {
            revert Token__ZeroAddressNotAllowed();
        }
        balanceOf[_from] = balanceOf[_from] - (_value);
        balanceOf[_to] = balanceOf[_to] + (_value);
        emit Transfer(_from, _to, _value);
    }

    function transfer(address _to, uint256 _value) external returns (bool success) {
        if (balanceOf[msg.sender] < _value) {
            revert Token__SenderInsufficientFunds();
        }
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool success) {
        if (_spender == address(0)) {
            revert Token__SpenderZeroAddressNotAllowed();
        }
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {
        if (_value > balanceOf[_from]) {
            revert Token__SenderInsufficientFunds();
        }
        if (_value > allowance[_from][msg.sender]) {
            revert Token__AllowanceInsufficientFunds();
        }
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - (_value);
        _transfer(_from, _to, _value);
        return true;
    }
}
