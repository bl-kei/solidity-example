// SPDX-License-Identifier: MIT License
pragma solidity >= 0.8.0 < 0.9.0;

contract ERC20 {
  mapping(address => uint) private _balances;
  mapping(address => mapping(address=>uint)) private _allowances;
  uint private _totalSupply;
  string private _name;
  string private _symbol;
  uint8 private _decimals;
  
  address public owner;
  mapping(address => bool) private _blackList;

  modifier checkBlackList() {
    require(!_blackList[msg.sender], "BlackList User");
    _;
  }

  modifier checkBalance(uint amount) {
    require(_balances[msg.sender] > amount, "Not sufficient balance");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only Onwer");
    _;
  }

  event Transfer(address indexed from, address indexed to, uint amount);
  event Approval(address indexed from, address indexed to, uint amount);

  constructor(string memory __name, string memory __symbol, uint8 __decimals) {
    _name = __name;
    _symbol = __symbol;
    _decimals = __decimals;
    _totalSupply = 1000000000 * (10**__decimals);
    owner = msg.sender;
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }

  function decimals() public view returns (uint8) {
    return _decimals;
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view returns (uint256) {
    return _balances[account];
  }

  function transfer(address to, uint256 amount) public checkBalance(amount) checkBlackList returns (bool) {
    _balances[msg.sender] -= amount;
    _balances[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
  }

  function allowance(address _owner, address _spender) public view returns (uint256) {
    return _allowances[_owner][_spender];
  }

  function approve(address spender, uint256 amount) public checkBalance(amount) checkBlackList returns (bool) {
    _allowances[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
  }

  function mint(address to, uint amount) public onlyOwner {
    _balances[to] += amount;
    _totalSupply += amount;
  }

  function burn(address to, uint amount) public onlyOwner {
    _balances[to] -= amount;
    _totalSupply -= amount;
  }

  function burnByUser(uint amount) public {
    transfer(address(0), amount);
    _totalSupply -= amount;
  }

  function setBlackList(address to) public onlyOwner {
    _blackList[to] = true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public checkBlackList returns (bool) {
    require(_balances[from] > amount, "Not sufficient Balance");
    require(_allowances[from][to] > amount, "Not Allowed Amount");
    require(to == msg.sender, "Not Allowed User");
    _balances[from] -= amount;
    _balances[to] += amount;

    emit Transfer(from, to, amount);
    return true;
  }
}