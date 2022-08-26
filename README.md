# Custom ERC721
This is a custom ERC721 with metadata and enumeration extensions. Compared to the OpenZeppelin version, it is more gas efficient as there are only minimal state variables stored. 

There's a slight gas saving for transfers but the gas used for minting is only about 10% (one tenth) of the gas usage compared to OpenZeppelin's contract. You can compare the gas usage here in the [gas report file](https://github.com/swylye/custom_erc721_hardhat/blob/main/gas-report.txt)

## Usage
You can refer to [CustomToken.sol](https://github.com/swylye/custom_erc721_hardhat/blob/main/contracts/test/CustomToken.sol) for how to implement this. There is also an OpenZeppelin equivalent for comparison ([OZToken.sol](https://github.com/swylye/custom_erc721_hardhat/blob/main/contracts/test/OZToken.sol)).
