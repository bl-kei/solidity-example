//SPDX-License-Identifier: MIT License
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    IERC20 token;

    constructor (address _token) {
        token = IERC20(_token);
    }
    
    function addLiquidity(uint256 _tokenAmount) public payable {
        token.transferFrom(msg.sender, address(this), _tokenAmount);
    }
    // ETH -> ERC20
    function ethToTokenSwap(uint256 _mintTokens) public payable {
        // calculate amount out (zero fee)
        uint256 outputAmount = getOutputAmount(
            msg.value, 
            address(this).balance - msg.value, 
            token.balanceOf(address(this)));

        require(outputAmount >= _mintTokens, "Inffucient outputAmount");
        //transfer token out
        IERC20(token).transfer(msg.sender, outputAmount);
    }
    // ERC20 -> ETH
    function TokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public payable {
        // calculate amount out (zero fee)
        uint256 outputAmount = getOutputAmount(
            _tokenSold, 
            token.balanceOf(address(this)), 
            address(this).balance);

        unchecked {
            console.log('%s, %s', outputAmount, _minEth);
            if (outputAmount >= _minEth) {
                console.log('true');
            } else {
                console.log('false');
            }
        }

        require(outputAmount >= _minEth, "Inffucient outputAmount");
        //transfer token out
        IERC20(token).transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(outputAmount);
    }

    function getPrice(uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        uint256 numerator = inputReserve;
        uint256 denominator = outputReserve;
        return numerator / denominator;
    }

    function getOutputAmount(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        uint256 numerator = (inputAmount * outputReserve);
        uint256 denominator = (inputReserve + inputAmount);
        return numerator / denominator;
    }
}
