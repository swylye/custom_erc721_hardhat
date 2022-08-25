const { assert, expect } = require("chai")
const { providers } = require("ethers")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Both tokens", function () {
        let deployer, accounts
        const chainId = network.config.chainId
        const mintPrice = networkConfig[chainId]["mintPrice"]
        let mintCount

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            accounts = await ethers.getSigners()
        })

        describe("ERC721C Token", function () {
            let token

            beforeEach(async () => {
                token = await ethers.getContract("CustomToken", deployer)
            })

            describe("constructor", function () {
                it("sets up the initial values correctly", async () => {
                    const tokenMintPrice = await token.getMintPrice()
                    assert.equal(tokenMintPrice.toString(), mintPrice.toString())
                })
            })

            describe("mint token", function () {
                it("should fail if incorrect fee amount passed in", async () => {
                    await expect(token.mint(1, { value: mintPrice.add(1) })).to.be.revertedWith("INCORRECT_FUND_AMOUNT")
                    await expect(token.mint(1, { value: mintPrice.sub(1) })).to.be.revertedWith("INCORRECT_FUND_AMOUNT")
                })

                it("mint correctly when correct amount is passed in", async () => {
                    let counter = 0
                    for (let i = 1; i <= 10; i++) {
                        let correctFees = mintPrice.mul(i)
                        let tx = await token.mint(i, { value: correctFees })
                        counter += i
                    }
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    assert.equal(totalSupply.toString(), counter.toString())
                    assert.equal(minterBalance.toString(), counter.toString())
                })
            })

            describe("burn token", function () {
                let acc1, acc1ConnectedToken

                beforeEach(async () => {
                    acc1 = accounts[1]
                    acc1ConnectedToken = token.connect(acc1)
                    const mintTx = await acc1ConnectedToken.mint(10, { value: mintPrice.mul(10) })
                })

                it("fails if not token owner", async () => {
                    await expect(token.burn(0)).to.be.reverted
                })

                it("fails if token ID does not exist", async () => {
                    await expect(acc1ConnectedToken.burn(100)).to.be.reverted
                })

                it("should be able to burn token", async () => {
                    const tx = await acc1ConnectedToken.burn(0)
                    await tx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(acc1.address)
                    assert.equal(totalSupply.toString(), "9")
                    assert.equal(minterBalance.toString(), "9")
                })
            })

            describe("transfer token", function () {
                let acc1, acc2
                let acc1ConnectedToken, acc2ConnectedToken

                beforeEach(async () => {
                    acc1 = accounts[1]
                    acc2 = accounts[2]
                    acc1ConnectedToken = token.connect(acc1)
                    acc2ConnectedToken = token.connect(acc2)
                    const mintTx = await token.mint(10, { value: mintPrice.mul(10) })
                })

                it("fails if incorrect from address", async () => {
                    await expect(token.transferFrom(acc1.address, acc2.address, 0)).to.be.reverted
                })

                it("fails if initiated from non owner or approved address", async () => {
                    await expect(acc1ConnectedToken.transferFrom(deployer, acc2.address, 0)).to.be.reverted
                })

                it("fails if token ID does not exist", async () => {
                    await expect(token.transferFrom(deployer, acc2.address, 20)).to.be.reverted
                })

                it("should be able to transfer token", async () => {
                    const tx = await token.transferFrom(deployer, acc2.address, 0)
                    await tx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(0)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                })

                it("should be able to transfer from approved address - specific token", async () => {
                    const approveTx = await token.approve(acc1.address, 1)
                    await approveTx.wait(1)
                    const transferTx = await acc1ConnectedToken.transferFrom(deployer, acc2.address, 1)
                    await transferTx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(1)
                    const approvedAddressPostTransfer = await token.getApproved(1)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                    assert(approvedAddressPostTransfer != acc1.address)
                })

                it("should be able to transfer from approved address - all tokens", async () => {
                    const approveTx = await token.setApprovalForAll(acc1.address, true)
                    await approveTx.wait(1)
                    const transferTx = await acc1ConnectedToken.transferFrom(deployer, acc2.address, 2)
                    await transferTx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(2)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                })
            })
        })


        describe("OZ ERC721 Token", function () {
            let token

            beforeEach(async () => {
                token = await ethers.getContract("OZToken", deployer)
            })

            describe("constructor", function () {
                it("sets up the initial values correctly", async () => {
                    const tokenMintPrice = await token.getMintPrice()
                    assert.equal(tokenMintPrice.toString(), mintPrice.toString())
                })
            })

            describe("mint token", function () {
                it("should fail if incorrect fee amount passed in", async () => {
                    await expect(token.mint(1, { value: mintPrice.add(1) })).to.be.revertedWith("INCORRECT_FUND_AMOUNT")
                    await expect(token.mint(1, { value: mintPrice.sub(1) })).to.be.revertedWith("INCORRECT_FUND_AMOUNT")
                })

                it("mint correctly when correct amount is passed in", async () => {
                    let counter = 0
                    for (let i = 1; i <= 10; i++) {
                        let correctFees = mintPrice.mul(i)
                        let tx = await token.mint(i, { value: correctFees })
                        counter += i
                    }
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    assert.equal(totalSupply.toString(), counter.toString())
                    assert.equal(minterBalance.toString(), counter.toString())
                })
            })

            describe("burn token", function () {
                let acc1, acc1ConnectedToken

                beforeEach(async () => {
                    acc1 = accounts[1]
                    acc1ConnectedToken = token.connect(acc1)
                    const mintTx = await acc1ConnectedToken.mint(10, { value: mintPrice.mul(10) })
                })

                it("fails if not token owner", async () => {
                    await expect(token.burn(0)).to.be.reverted
                })

                it("fails if token ID does not exist", async () => {
                    await expect(acc1ConnectedToken.burn(100)).to.be.reverted
                })

                it("should be able to burn token", async () => {
                    const tx = await acc1ConnectedToken.burn(0)
                    await tx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(acc1.address)
                    assert.equal(totalSupply.toString(), "9")
                    assert.equal(minterBalance.toString(), "9")
                })
            })

            describe("transfer token", function () {
                let acc1, acc2
                let acc1ConnectedToken, acc2ConnectedToken

                beforeEach(async () => {
                    acc1 = accounts[1]
                    acc2 = accounts[2]
                    acc1ConnectedToken = token.connect(acc1)
                    acc2ConnectedToken = token.connect(acc2)
                    const mintTx = await token.mint(10, { value: mintPrice.mul(10) })
                })

                it("fails if incorrect from address", async () => {
                    await expect(token.transferFrom(acc1.address, acc2.address, 0)).to.be.reverted
                })

                it("fails if initiated from non owner or approved address", async () => {
                    await expect(acc1ConnectedToken.transferFrom(deployer, acc2.address, 0)).to.be.reverted
                })

                it("fails if token ID does not exist", async () => {
                    await expect(token.transferFrom(deployer, acc2.address, 20)).to.be.reverted
                })

                it("should be able to transfer token", async () => {
                    const tx = await token.transferFrom(deployer, acc2.address, 0)
                    await tx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(0)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                })

                it("should be able to transfer from approved address - specific token", async () => {
                    const approveTx = await token.approve(acc1.address, 1)
                    await approveTx.wait(1)
                    const transferTx = await acc1ConnectedToken.transferFrom(deployer, acc2.address, 1)
                    await transferTx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(1)
                    const approvedAddressPostTransfer = await token.getApproved(1)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                    assert(approvedAddressPostTransfer != acc1.address)
                })

                it("should be able to transfer from approved address - all tokens", async () => {
                    const approveTx = await token.setApprovalForAll(acc1.address, true)
                    await approveTx.wait(1)
                    const transferTx = await acc1ConnectedToken.transferFrom(deployer, acc2.address, 2)
                    await transferTx.wait(1)
                    const totalSupply = await token.totalSupply()
                    const minterBalance = await token.balanceOf(deployer)
                    const acc2Balance = await token.balanceOf(acc2.address)
                    const transferredTokenOwner = await token.ownerOf(2)
                    assert.equal(totalSupply.toString(), "10")
                    assert.equal(minterBalance.toString(), "9")
                    assert.equal(acc2Balance.toString(), "1")
                    assert.equal(transferredTokenOwner, acc2.address)
                })
            })
        })
    })