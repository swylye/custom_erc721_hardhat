const { ethers } = require("hardhat")

const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "488",
        callbackGasLimit: "500000",
        interval: 60, // 1 minute
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.5"),
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        interval: 30, // 30 seconds
    }
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}