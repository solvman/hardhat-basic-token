const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentNetworks, tokenConfig } = require("../helper-hardhat.config");

!developmentNetworks.includes(network.name)
  ? describe.skip
  : describe("Token tests", function () {
      let token, owner, account1;

      const transferAmount = ethers.constants.One;
      const zeroAddress = ethers.constants.AddressZero;

      before(async function () {
        [owner, account1, account2] = await ethers.getSigners();
        await deployments.fixture("Token");
        token = await ethers.getContract("Token", owner);
      });

      describe("Constructor", function () {
        it("sets token name", async function () {
          assert.equal(await token.name(), tokenConfig.name);
        });
        it("sets token symbol", async function () {
          assert.equal(await token.symbol(), tokenConfig.symbol);
        });
        it("sets token decimals", async function () {
          assert.equal(await token.decimals(), tokenConfig.decimals);
        });
        it("sets amount of initial supply", async function () {
          assert.equal((await token.totalSupply()).toString(), tokenConfig.totalSupply.toString());
        });
        it("sets owner balance to initial supply", async function () {
          assert.equal((await token.balanceOf(owner.address)).toString(), tokenConfig.totalSupply.toString());
        });
      });

      describe("transfer()", function () {
        it("transfers correct amount", async function () {
          await token.transfer(account1.address, transferAmount);
          assert.equal((await token.balanceOf(account1.address)).toString(), transferAmount);
        });
        it("reverts with Token__SenderInsufficientFunds", async function () {
          await expect(
            token.transfer(account1.address, (await token.balanceOf(owner.address)).add(transferAmount))
          ).to.be.revertedWithCustomError(token, "Token__SenderInsufficientFunds");
        });
        it("reverts with Token__ZeroAddressNotAllowed", async function () {
          await expect(token.transfer(zeroAddress, transferAmount)).to.be.revertedWithCustomError(
            token,
            "Token__ZeroAddressNotAllowed"
          );
        });
        it("emits Transfer() event", async function () {
          await expect(token.transfer(account1.address, transferAmount))
            .to.emit(token, "Transfer")
            .withArgs(owner.address, account1.address, transferAmount);
        });
      });

      describe("approve()", function () {
        it("records correct allowance", async function () {
          await token.approve(account1.address, transferAmount);
          assert.equal((await token.allowance(owner.address, account1.address)).toString(), transferAmount);
        });
        it("reverts with Token__SpenderZeroAddressNotAllowed", async function () {
          await expect(token.approve(zeroAddress, transferAmount)).to.be.revertedWithCustomError(
            token,
            "Token__SpenderZeroAddressNotAllowed"
          );
        });
        it("emits Approval() event", async function () {
          await expect(token.approve(account1.address, transferAmount))
            .to.emit(token, "Approval")
            .withArgs(owner.address, account1.address, transferAmount);
        });
      });

      describe("transferFrom()", function () {
        transferAllowance = transferAmount.add(transferAmount);
        let sender, spender, recepient, initialSenderBalance;

        before(async function () {
          [sender, spender, recepient] = await ethers.getSigners();
          initialSenderBalance = await token.balanceOf(sender.address);
          await token.approve(spender.address, transferAllowance);
          await token.connect(spender).transferFrom(sender.address, recepient.address, transferAmount);
        });

        it("decreases allowance balance by transfer amount", async function () {
          assert.equal(
            (await token.allowance(sender.address, spender.address)).toString(),
            transferAllowance.sub(transferAmount)
          );
        });
        it("transfers correct amount - recepients balance verified", async function () {
          assert.equal((await token.balanceOf(recepient.address)).toString(), transferAmount);
        });
        it("transfers correct amount - senders balance verified", async function () {
          assert.equal((await token.balanceOf(sender.address)).toString(), initialSenderBalance.sub(transferAmount));
        });
        it("reverts with Token__SenderInsufficientFunds", async function () {
          await expect(
            token.connect(spender).transferFrom(sender.address, recepient.address, initialSenderBalance)
          ).to.be.revertedWithCustomError(token, "Token__SenderInsufficientFunds");
        });
        it("reverts with Token__AllowanceInsufficientFunds", async function () {
          await expect(
            token
              .connect(spender)
              .transferFrom(sender.address, recepient.address, transferAllowance.add(transferAllowance))
          ).to.be.revertedWithCustomError(token, "Token__AllowanceInsufficientFunds");
        });
        it("emits Transfer() event", async function () {
          await expect(token.connect(spender).transferFrom(sender.address, recepient.address, transferAmount))
            .to.emit(token, "Transfer")
            .withArgs(sender.address, recepient.address, transferAmount);
        });
      });
    });
