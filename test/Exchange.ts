import { ethers } from 'hardhat';
import { expect } from 'chai';

import { BigNumber } from 'ethers';

import { Exchange } from '../typechain-types/contracts/defi/CPMM/Exchange';
import { Token } from '../typechain-types/contracts/defi/CPMM/Token';

const toWei = (value: number) => ethers.utils.parseEther(value.toString());
const toEther = (value: BigNumber) => ethers.utils.formatEther(value);

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
      await token.approve(exchange.address, toWei(500));
      await exchange.addLiquidity(toWei(500), { value: toWei(1000) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1000));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(500));

      await token.approve(exchange.address, toWei(100));
      await exchange.addLiquidity(toWei(100), { value: toWei(200) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1200));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(600));
    });
  });

  describe('removeLiquidity', async () => {
    it('remove Liquidity', async () => {
      await token.approve(exchange.address, toWei(500));
      await exchange.addLiquidity(toWei(500), { value: toWei(1000) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1000));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(500));

      await token.approve(exchange.address, toWei(100));
      await exchange.addLiquidity(toWei(100), { value: toWei(200) });

      expect(await getBalance(exchange.address)).to.equal(toWei(1200));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(600));

      await exchange.removeLiquidity(toWei(600));
      expect(await getBalance(exchange.address)).to.equal(toWei(600));
      expect(await token.balanceOf(exchange.address)).to.equal(toWei(300));
    });
  });

  describe('getOutputAmount', async () => {
    it('correct getOutputAmount', async () => {
      await token.approve(exchange.address, toWei(4000));
      //4:1
      await exchange.addLiquidity(toWei(4000), { value: toWei(1000) });
      const tokenReserve = await token.balanceOf(exchange.address);
      const etherReserve = await getBalance(exchange.address);
      expect(
        toEther(
          await exchange.getOutputAmount(
            toWei(1),
            getBalance(exchange.address),
            token.balanceOf(exchange.address)
          )
        )
      ).to.equal('3.996003996003996003');
    });
  });

  describe('ethToTokenSwap', async () => {
    it('correct ethToTokenSwap', async () => {
      await token.approve(exchange.address, toWei(4000));
      //4:1
      await exchange.addLiquidity(toWei(4000), { value: toWei(1000) });
      // 1ETH : ??
      await exchange
        .connect(user)
        .ethToTokenSwap(toWei(0.0003), { value: toWei(1) });

      console.log(toEther(await token.balanceOf(user.address)));
    });
  });

  describe('TokenToEthSwap', async () => {
    it('correct TokenToEthSwap', async () => {
      await token.approve(exchange.address, toWei(4000));
      //4:1
      await exchange.addLiquidity(toWei(4000), { value: toWei(1000) });
      await exchange
        .connect(user)
        .ethToTokenSwap(toWei(0.0001), { value: toWei(1) });

      console.log(`before token swap ${await token.balanceOf(user.address)}`);

      // 1Token : ??
      await token.connect(user).approve(exchange.address, toWei(1000));
      await exchange.connect(user).TokenToEthSwap(toWei(0.0001), 100000);

      console.log(
        `after token swap ${toEther(await token.balanceOf(user.address))}`
      );
    });
  });

  describe.skip('swapWithFee', async () => {
    it('correct swapWithFee', async () => {
      await token.approve(exchange.address, toWei(50));

      await exchange.addLiquidity(toWei(50), { value: toWei(50) });

      await exchange
        .connect(user)
        .ethToTokenSwap(toWei(11), { value: toWei(30) });

      expect(toEther(await token.balanceOf(user.address)).toString()).to.equal(
        '11.179422835633626097'
      );

      await exchange.removeLiquidity(toWei(30));

      expect(toEther(await token.balanceOf(owner.address)).toString()).to.equal(
        '999973.292346298619824341'
      );
    });
  });

  describe('tokenToTokenSwap', async () => {
    it('correct tokenToTokenSwap', async () => {
      [owner, user] = await ethers.getSigners();
      const FactoryFactory = await ethers.getContractFactory('Factory');
      const factory = await FactoryFactory.deploy();
      await factory.deployed();

      const GrayTokenFactory = await ethers.getContractFactory('Token');
      const grayToken = await GrayTokenFactory.deploy(
        'GrayToken',
        'GRAY',
        toWei(1010)
      );
      await grayToken.deployed();

      const BlackTokenFactory = await ethers.getContractFactory('Token');
      const blackToken = await BlackTokenFactory.deploy(
        'BlackToken',
        'BLACK',
        toWei(1000)
      );
      await blackToken.deployed();

      // create gray/Eth pair exchange contract
      const grayEthExchangeAddress = await factory.callStatic.createExchange(
        grayToken.address
      );
      console.log(grayEthExchangeAddress);
      console.log(await factory.getExchange(grayToken.address));
      await factory.createExchange(grayToken.address);

      // create black/Eth pair exchange contract
      const blackEthExchangeAddress = await factory.callStatic.createExchange(
        blackToken.address
      );
      console.log(blackEthExchangeAddress);
      console.log(await factory.getExchange(blackToken.address));
      await factory.createExchange(blackToken.address);

      // add liquidity 1000/1000
      await grayToken.approve(grayEthExchangeAddress, toWei(1000));
      await blackToken.approve(blackEthExchangeAddress, toWei(1000));

      const ExchangeFactory = await ethers.getContractFactory('Exchange');
      await ExchangeFactory.attach(grayEthExchangeAddress).addLiquidity(
        toWei(1000),
        { value: toWei(1000) }
      );
      await ExchangeFactory.attach(blackEthExchangeAddress).addLiquidity(
        toWei(1000),
        { value: toWei(1000) }
      );

      await grayToken.approve(grayEthExchangeAddress, toWei(10));
      await ExchangeFactory.attach(grayEthExchangeAddress).TokenToTokenSwap(
        toWei(10),
        toWei(9),
        toWei(9),
        blackToken.address
      );

      console.log(toEther(await blackToken.balanceOf(owner.address)));
      console.log(toEther(await blackToken.balanceOf(grayEthExchangeAddress)));
    });
  });
});
