const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'pay.env') });

const { ethers } = require('ethers');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticateToken = require('../middlewares/JWTauth');
const userStore = require('../Models/userInfoStore');
const UserChargeService = require("../Models/UserChargeService");

const tokenJWTtime = '4m';
let chargeTime=4* 60 * 1000; // 10 minutes in milliseconds for charghing period
// const userChargeService = new UserChargeService(userStore);

// اتصال به شبکه
const INFURA_API_URL = process.env.INFURA_API_URL;
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const YOUR_WALLET = process.env.YOUR_WALLET.toLowerCase();

const USDT_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
const provider = new ethers.JsonRpcProvider(INFURA_API_URL);

// =================== verify ===================
router.post('/verify', async (req, res) => {
  try {
    const chargingData = req.body.chargingData;
    const userInfo = userStore.getUserInfo();

    // محاسبه بدهی کاربر (به‌روز رسانی قبل از تایید)
    userInfo.chargingDebt = UserChargeService.chargingDebtCalculation(
      userInfo.maxBalance,
      userInfo.lastTimeCharge,
      chargingData.userLevel,
      userInfo.chargingDebt,
      chargeTime
    );

    const MIN_AMOUNT = BigInt(ethers.parseUnits(userInfo.chargingDebt.toString(), 18));
    const result = await verifyUSDTTransaction(
      chargingData.txHash,
      chargingData.walletAddress,
      MIN_AMOUNT,
      userInfo
    );

    if (result.valid) {
      UserChargeService.increaseAuthLevel(userInfo, chargingData.txHash,chargeTime);

      const JWTauth = userInfo.userPassword;
      const token = jwt.sign({ wallet: chargingData.walletAddress }, JWTauth, { expiresIn: tokenJWTtime });

      return res.json({ chargedUser: true, token, msg: result.message });
    } else {
      return res.json({ chargedUser: false, msg: result.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== secureData ===================
router.get('/secureData', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted', wallet: req.user.wallet });
});
// ==============================================
router.post('/debtCalculate', (req, res) => {
  try {
    
    const { targetLevel } = req.body;
    console.log('172:targetLevel=',targetLevel);
    const userInfo = userStore.getUserInfo();
    console.log('173:userInfo=',userInfo);
    const levels = ["Tester", "Starter", "Bronze", "Silver", "Gold"];
    const currentIndex = levels.indexOf(userInfo.userLevel);
    const targetIndex = levels.indexOf(targetLevel);

    // if (targetIndex < currentIndex) {
    //   return res.json({ success: false, msg: "You cannot downgrade your level." });
    // }
    
    const chargeExpired = (Date.now() - userInfo.lastTimeCharge) >= chargeTime;
      
    // اگر شارژ منقضی شده یا کاربر سطح بالاتری درخواست داده
    if (chargeExpired || targetIndex > currentIndex) {
      const requiredDebt = UserChargeService.chargingDebtCalculation(
        userInfo.maxBalance,
        userInfo.lastTimeCharge,
        targetLevel,
        userInfo.chargingDebt,
        chargeTime
      );
      return res.json({
        success: true,
        targetLevel,
        requiredDebt,
        availableBalance: userInfo.maxBalance,
        msg: `Debt for maintaining or upgrading to ${targetLevel} calculated successfully.`
      });
    } else if ((chargeExpired == false) && (targetIndex < currentIndex)){
        return res.json({ success: false, msg: "You  only can downgrade your level when your charge is expired." });
    } else if ((chargeExpired == false) && (targetIndex == currentIndex)){
      return res.json({ success: false, msg: "You  only can your perevius level when your charge is expired. " });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// =================== Functions ===================
async function verifyUSDTTransaction(txHash, userWallet, MIN_AMOUNT, userInfo) {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx) return { valid: false, message: "Transaction not found." };
    if (!receipt || receipt.status !== 1) return { valid: false, message: "Transaction failed or not mined." };

    // const dupCheck = await isDuplicateOrOldTransaction(txHash, userInfo, provider);
    // if (!dupCheck.valid) return { valid: false, txHash, message: dupCheck.message };

    const iface = new ethers.Interface(USDT_ABI);
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDT_CONTRACT_ADDRESS.toLowerCase()) continue;
      try {
        const parsedLog = iface.parseLog(log);
        if (parsedLog.name === "Transfer") {
          const from = parsedLog.args[0].toLowerCase();
          const to = parsedLog.args[1].toLowerCase();
          const value = parsedLog.args[2];

          if (from === userWallet.toLowerCase() && to === YOUR_WALLET && value === MIN_AMOUNT) {
            return { valid: true, txHash, amount: ethers.formatUnits(value, 18), message: "USDT transaction is valid." };
          } else if (value !== MIN_AMOUNT) {
            return {
              valid: false,
              txHash,
              amount: ethers.formatUnits(value, 18),
              message: `Invalid USDT transaction amount. Expected: ${ethers.formatUnits(MIN_AMOUNT, 18)} USDT, Received: ${ethers.formatUnits(value, 18)} USDT.`
            };
          }
        }
      } catch (err) {
        console.log("Log parsing error:", err);
        continue;
      }
    }
    return { valid: false, message: "No matching USDT transfer found in transaction." };
  } catch (err) {
    console.error("Verification error:", err);
    return { valid: false, message: "Error occurred while verifying transaction." };
  }
}

async function isDuplicateOrOldTransaction(txHash, userInfo, provider) {
  if (userInfo.lastTxHash === txHash) {
    return { valid: false, reason: "duplicate", message: "This transaction has already been processed." };
  }
  const tx = await provider.getTransaction(txHash);
  if (!tx || !tx.blockNumber) {
    return { valid: false, reason: "not_found", message: "Transaction not found or not confirmed." };
  }
  const block = await provider.getBlock(tx.blockNumber);
  const txTime = block.timestamp * 1000;
  const now = Date.now();

  const maxAge = 24 * 60 * 60 * 1000; // 24 ساعت
  if (now - txTime > maxAge) {
    return { valid: false, reason: "too_old", message: "The transaction time is older than 24h and is not acceptable." };
  }
  return { valid: true, reason: "ok", message: "This transaction is new" };
}

module.exports = router;
