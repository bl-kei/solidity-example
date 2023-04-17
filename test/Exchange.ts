import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Exchange } from '../typechain-types/contracts/Exchange';
import { Token } from '../typechain-types/contracts/Token';

const toWei = (value: number) => ethers.utils.parseEther(value.toString());

const getBalance = ethers.provider.getBalance;

describe('Exchange', () => {
  let owner: any;
  let user: any;
  let exchange: Exchange;
  let token: Token;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory('Token');
    token = await TokenFactory.deploy('GrayToken', 'GRAY', toWei(1000000));
    await token.deployed();

    const ExchangeFactory = await ethers.getContractFactory('Exchange');
    exchange = await ExchangeFactory.deploy(token.address);
    await exchange.deployed();
  });

  describe('addLiquidity', async () => {
    it('add Liquidity', async () => {
      await token.approve(exchange.address, toWei(1000));
      await exchange.addLiquidity(toWei(1000), { value: toWei(1000) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1000));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(1000));
    });
  });

  describe('swap', async () => {
    it('swap', async () => {
      await token.approve(exchange.address, toWei(1000));
      await exchange.addLiquidity(toWei(1000), { value: toWei(1000) });

      await exchange.connect(user).ethToTokenSwap({ value: toWei(1) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1001));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(999));
      expect(await token.balanceOf(user.address)).to.equal(toWei(1));
      // expect(await getBalance(user.address)).to.equal(toWei(9999));
    });
  });
});
