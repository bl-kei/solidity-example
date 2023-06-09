import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      gas: 10000000,
      gasPrice: 875000000,
    },
  },
};

export default config;
