import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'HTTP://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xcd72d2976c81a9cd726ec5594864a43a3a772d933e9fb5aed1086685b8fac3b2',
        '0x8d7a700df5e5e6d57af53b72a785cbb16030abb3c64d35c632c100c57ed7750e',
        '0x2eb627d2d85b0d2e05bf9fbd297cf17050856af8b10e5646edf714e41c8efffe',
        '0xd4a1d1ab4f0d62ecd8c1abc4d7c548ee2b98e75e38e3fe3ecde278bc63c5503c',
        '0x41fc897decc05ad317fcf944c8f314f1ee939784ee14d4d3b371d88d74a4d882',
        '0x981921043abd8006561da593567a59a22b3cf0670161c04c3299d9b4c4e76f79',
        '0x97ff3247e300b70096a94226531ebe733fe62a50a0ba9cb871140df231db21ec',
        '0xaedb863dfffdc50e689fce7ccc36167936c0308473bf26214ad30e7244b3ecb9',
        '0x980bae0983f366ced29f34d389849d4eb87275d6febb362bda1b86ac263da2bb',
        '0x9155eb877e65d6d01e7d5463b297b50218ebf8f11d8175c9bc224b95bdaa2227',
      ]
    },
  },
};

export default config;
