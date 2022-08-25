const { ethers } = require("hardhat")

const networkConfig = {
    5: {
        name: "goerli",
        mintPrice: ethers.utils.parseEther("0.01"),
    },
    31337: {
        name: "hardhat",
        mintPrice: ethers.utils.parseEther("0.1"),
    }
}

const developmentChains = ["hardhat", "localhost"]


module.exports = {
    networkConfig,
    developmentChains,
}