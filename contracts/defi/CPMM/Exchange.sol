//SPDX-License-Identifier: MIT License
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    IERC20 token;

    constructor (address _token) ERC20("Gray Uniswap V2", "GUNI-V2"){
        token = IERC20(_token);
    }
    
    // _maxTokens -> the value included Slippage
    function addLiquidity(uint256 _maxTokens) public payable {
        uint256 totalLiquidity = totalSupply();
        if (totalLiquidity > 0) { // Already Liquidity exists
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = token.balanceOf(address(this));
            uint256 tokenAmount = msg.value * tokenReserve / ethReserve;
            require(_maxTokens >= tokenAmount, "");
            token.transferFrom(msg.sender, address(this), tokenAmount);
            uint256 liquidityMinted = totalLiquidity * msg.value / ethReserve;
            _mint(msg.sender, liquidityMinted);
        } else {
            uint256 tokenAmount = _maxTokens;
            uint256 initialLiquidity = address(this).balance;
            _mint(msg.sender, initialLiquidity);
            token.transferFrom(msg.sender, address(this), tokenAmount);
        }
    }

    function removeLiquidity(uint256 _lpTokenAmount) public {
        uint256 totalLiquidity = totalSupply();
        uint256 ethAmount = _lpTokenAmount * address(this).balance / totalLiquidity;
        uint256 tokenAmount = _lpTokenAmount * token.balanceOf(address(this)) / totalLiquidity;

        _burn(msg.sender, _lpTokenAmount);

        payable(msg.sender).transfer(ethAmount);
        token.transfer(msg.sender, tokenAmount);
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
