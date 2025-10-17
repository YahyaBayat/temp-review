const path = require('path');
const fs = require("fs");
require('dotenv').config({ path: path.join(__dirname, 'pay.env') });
const { ethers } = require('ethers');
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
// const auth = JSON.parse(fs.readFileSync('./StorageData/auth.json'));
// const userPort = require('../Models/userPort');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/JWTauth');
const userStore = require('../Models/userInfoStore');
const tokenJWTtime='4m'
let chargeTime=4* 60 * 1000; // 10 minutes in milliseconds for charghing period
// const userInfo = userStore.getUserInfo();
// console.log('143:userInfo.chargingDebt=',userInfo.chargingDebt)
// global variable

// userInfo
// const userInfo=auth.find(user => user.port ==userPort.port);
// console.log('143:userInfo.chargingDebt=',userInfo.chargingDebt)

// اطلاعات اتصال
const INFURA_API_URL = process.env.INFURA_API_URL;
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const YOUR_WALLET = process.env.YOUR_WALLET.toLowerCase();

const USDT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const provider = new ethers.JsonRpcProvider(INFURA_API_URL);
// ----------------

// ----------------------------------------
router.post('/verify', async (req, res) => {
    try {
        const chargingData = req.body.chargingData;
        const userInfo = userStore.getUserInfo();
        const MIN_AMOUNT = BigInt(ethers.parseUnits(userInfo.chargingDebt.toString(), 18)); // 18 رقم اعشار برای USDT
        console.log('165:MIN_AMOUNT=',MIN_AMOUNT)
        const result = await verifyUSDTTransaction(chargingData.txHash, chargingData.walletAddress,MIN_AMOUNT,userInfo);
        if (result.valid) {
            increaseAuthLevel(userInfo,chargingData.txHash)
            // updateAuth('lastTimeCharge',Date.now())
            // ساخت توکن با اعتبار 24 ساعت
            let JWTauth=userInfo.userPassword
            const token = jwt.sign({ wallet: chargingData.walletAddress }, JWTauth, { expiresIn: tokenJWTtime });
            return res.json({ chargedUser: true, token:token, msg: result.message });
        } else {
          console.log('152:msg=',result.message)
            return res.json({ chargedUser: false, msg: result.message });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// // ------------------------------
// router.get('/secureData', authenticateToken, (req, res) => {
//     res.json({ message: 'Access granted', wallet: req.user.wallet });
// });
// ------------------------------
router.get('/secureData',authenticateToken, (req, res) => {
    res.json({ message: 'Access granted', wallet: req.user.wallet });
});
// ===========functions================
// تابع بررسی تراکنش
async function verifyUSDTTransaction(txHash, userWallet,MIN_AMOUNT,userInfo) {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log('tx=', tx);
    console.log('receipt=', receipt);
    if (!tx) return { valid: false, message: "Transaction not found." };
    if (!receipt || receipt.status !== 1) return { valid: false, message: "Transaction failed or not mined." };
    
    // بررسی تکراری یا قدیمی بودن تراکنش
    const dupCheck = await isDuplicateOrOldTransaction(txHash, userInfo, provider);
    if (!dupCheck.valid) {
      return {
        valid: false,
        txHash,
        message: dupCheck.message
      };
    }
    // ------بررسی مقدار و خود تراکنش که آیا اصلا در بلاکچین وجود دارد چنینی تراکنشی؟
    const iface = new ethers.Interface(USDT_ABI);
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDT_CONTRACT_ADDRESS.toLowerCase()) continue;

      try {
        const parsedLog = iface.parseLog(log);
        if (parsedLog.name === "Transfer") {
          const from = parsedLog.args[0].toLowerCase();
          const to = parsedLog.args[1].toLowerCase();
          const value = parsedLog.args[2]; // bigint
          console.log(`Transfer: from=${from}, to=${to}, value=${value}`);
          console.log('123:MIN_AMOUNT=',MIN_AMOUNT);
          console.log('124:value=',value)
          if (from === userWallet.toLowerCase() && to === YOUR_WALLET && value == MIN_AMOUNT) {
            return {
              valid: true,
              txHash,
              amount: ethers.formatUnits(value, 18),
              message: "USDT transaction is valid."
            };
          }else if(value != MIN_AMOUNT){
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

    return {
      valid: false,
      message: "No matching USDT transfer found in transaction."
    };
  } catch (err) {
    console.error("Verification error:", err);
    return {
      valid: false,
      message: "Error occurred while verifying transaction."
    };
  }
}
// -----------------------
//=====================================
// ---------------------------------
// updateAuth
function updateAuth(parameterName,newValue){
  userInfo[parameterName]=newValue;
  let userIndex=auth.indexOf(userInfo);
  auth.splice(userIndex,1,userInfo);
  fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
}
// ------------------------------------------------
// ---------------------------------
// updateAuth
function increaseAuthLevel(userInfo,txHash){
  let chargePeriodTime=Date.now() - userInfo.lastTimeCharge;
  console.log('132:chargePeriodTime=',chargePeriodTime)
  let starterUserCharge=1;
  let bronzeUserCharge=2;
  let silverUserCharge=3;
  let goldUserCharge=4;
  if(userInfo.userLevel == "Tester"){
    if(userInfo.chargingDebt == (starterUserCharge)){
      userInfo.userLevel="Starter"
    }else if(userInfo.chargingDebt == (bronzeUserCharge)){
      userInfo.userLevel="Bronze"
    }else if(userInfo.chargingDebt == (silverUserCharge)){
      userInfo.userLevel="Silver"
    }else if(userInfo.chargingDebt == (goldUserCharge)){
      userInfo.userLevel="Gold"
    }
  }
  if(chargePeriodTime<chargeTime){
    if(userInfo.userLevel == "Starter"){
      if(userInfo.chargingDebt == (bronzeUserCharge-starterUserCharge)){
        userInfo.userLevel="Bronze"
      }else if(userInfo.chargingDebt == (silverUserCharge-starterUserCharge)){
        userInfo.userLevel="Silver"
      }else if(userInfo.chargingDebt == (goldUserCharge-starterUserCharge)){
        userInfo.userLevel="Gold"
      }
    }else if(userInfo.userLevel == "Bronze"){
      if(userInfo.chargingDebt == (silverUserCharge-bronzeUserCharge)){
        userInfo.userLevel="Silver"
      }else if(userInfo.chargingDebt == (goldUserCharge-bronzeUserCharge)){
        userInfo.userLevel="Gold"
      }
    }else if(userInfo.userLevel == "Silver"){
      if(userInfo.chargingDebt == (goldUserCharge-silverUserCharge)){
        userInfo.userLevel="Gold"
      }
    }
  }
  userInfo.lastTimeCharge=Date.now() 
  userInfo.chargingDebt=0;
  userInfo.lastTxHash=txHash;
  console.log('183:userInfo=',userInfo)
  userStore.addOrUpdateUser(userInfo);
  // let userIndex=auth.indexOf(userInfo);
  // auth.splice(userIndex,1,userInfo);
  // fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
}
// ------------------------------------------------
// isDuplicateOrOldTransaction
async function isDuplicateOrOldTransaction(txHash, userInfo, provider) {
  try {
    // بررسی تکراری بودن هش
    if (userInfo.lastTxHash === txHash) {
      return {
        valid: false,
        reason: "duplicate",
        message: "This transaction has already been processed.",
      };
    }

    // گرفتن تراکنش و زمان بلاک
    const tx = await provider.getTransaction(txHash);
    if (!tx || !tx.blockNumber) {
      return {
        valid: false,
        reason: "not_found",
        message: "This transaction has not been find or still not confirmed.",
      };
    }

    const block = await provider.getBlock(tx.blockNumber);
    const txTime = block.timestamp * 1000; // تبدیل به میلی‌ثانیه
    const now = Date.now();

    // بررسی قدیمی بودن تراکنش (بیش از 24 ساعت پیش)
    const maxAge = 300*24 * 60 * 60 * 1000; // 24 ساعت
    if (now - txTime > maxAge) {
      return {
        valid: false,
        reason: "too_old",
        message: "The transaction time is older than 24h and is not acceptable.",
      };
    }

    // اگر همه چیز خوب بود
    return {
      valid: true,
      reason: "ok",
      message: "This transaction is new",
    };

  } catch (err) {
    console.error("Error in isDuplicateOrOldTransaction:", err);
    return {
      valid: false,
      reason: "error",
      message: "error in checking of Duplicate transaction",
    };
  }
}

// -------------------------------------------------
// اجرای تست
// (async () => {
//   const result = await verifyUSDTTransaction(
//     "0x79acbe5cf5e2b56cb003e45614b349fcaf5a011b3203d8805462c66d52efd408",
//     "0x3B8d3FA7cF2D550E9b0B231e74843e31232D3CfF"
//   );
//   console.log(result);
// })();

module.exports = router;
