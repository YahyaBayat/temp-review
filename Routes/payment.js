const path = require('path');
const fs = require("fs");
require('dotenv').config({ path: path.join(__dirname, 'pay.env') }); // بارگذاری pay.env
const { ethers } = require('ethers');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const SSS = require('shamirs-secret-sharing'); // الگوریتم تقسیم کلید
const app = express();
const crypto=require('crypto');
const router=express.Router();
const auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
const userPort = require('../Models/userPort');
const axios = require('axios');
const { info } = require('console');
// ---------------------------------------------------
// اطلاعات اتصال
// const INFURA_API_URL = process.env.INFURA_API_URL;

// اطلاعات اتصال به شبکه تست
const INFURA_API_URL = process.env.INFURA_API_URL_TEST;

// آدرس قرارداد USDT روی شبکه BSC
// const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;

// تست آدرس قرارداد USDT روی شبکه BSC
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS_TEST;

// ABI استاندارد برای توکن‌های ERC20/BEP20 (فقط تابع balanceOf)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

// اتصال به شبکه BSC از طریق RPC
const provider = new ethers.JsonRpcProvider(INFURA_API_URL);


// اتصالات به سه پایگاه داده مجزا
// let db1Promise
// let db2Promise
// let db3Promise
// async() =>{
//   try {
//     db1Promise = await mongoose.createConnection(process.env.MONGO_URI_1);
//   } catch (err) {
//     console.error('Failed to connect to DB1:', err.message);
//   }
//   try {
//     db1Promise = await mongoose.createConnection(process.env.MONGO_URI_1);
//   } catch (err) {
//     console.error('Failed to connect to DB1:', err.message);
//   }
//   try {
//     db1Promise = await mongoose.createConnection(process.env.MONGO_URI_1);
//   } catch (err) {
//     console.error('Failed to connect to DB1:', err.message);
//   }
// }

const db1Promise = mongoose.createConnection(process.env.MONGO_URI_1);
const db2Promise = mongoose.createConnection(process.env.MONGO_URI_2);
const db3Promise = mongoose.createConnection(process.env.MONGO_URI_3);
// // فعال کردن حالت دیباگ
mongoose.set('debug', true);

let PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3;
const fileName = './StorageData/'+userPort.port+'/walletAddress.json';
console.log('185:fileName=',fileName);
// منتظر اتصال به همه پایگاه داده‌ها
Promise.all([db1Promise, db2Promise, db3Promise])
  .then(([db1, db2, db3]) => {
    console.log('Connected to all three databases');

    // مدل برای ذخیره بخش‌های کلید خصوصی به همراه شناسه کاربر و shareIndex
    const shareSchema = new mongoose.Schema({
      userId: { type: Number, required: true },
      shareIndex: { type: Number, required: true },
      privateKeyShare: { type: String, required: true },
    });

    // مدل‌ها برای هر پایگاه داده
    PrivateKeyShare1 = db1.model('PrivateKeyShare', shareSchema);
    PrivateKeyShare2 = db2.model('PrivateKeyShare', shareSchema);
    PrivateKeyShare3 = db3.model('PrivateKeyShare', shareSchema);

    if (!fs.existsSync(fileName)){
      console.log('147:fileName');
      //  mainnetایجاد یک کیف پول جدید
      // const account = ethers.Wallet.createRandom();
      // ایجاد کیف پول جدید روی Testnet
      const account = ethers.Wallet.createRandom().connect(provider);

      console.log("123:Address:", account.address);
      console.log("124:Mnemonic:", account.mnemonic.phrase);
      console.log("125:Private Key:", account.privateKey);
      fs.writeFileSync(fileName, JSON.stringify(account.address));
      // await fs.promises.writeFile('./StorageData/'+userPort.port+'/walletAddress.json', JSON.stringify(account.address, null, 2));
      // بازیابی پسورد خصوصی کاربر
      const userPassword = findUserPassword(userPort.port);
      console.log('145:userPassword=',userPassword)
      updateAuth(userPassword);
      fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
      // اجرای عملیات بعد از اتصال موفق به همه پایگاه‌های داده
      return privateKeyFunction(account.privateKey, PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword);
    }
    
  })
  .catch((err) => {
    console.error('Failed to connect to databases:', err.message);
  });
// -----------------Routers-----------------------
router.get('/deposite',  async (req, res) => {
    const walletAddress = JSON.parse(fs.readFileSync(fileName));
    console.log('185:walletAddress=',walletAddress)
    res.send({walletAddress:walletAddress});
});

// checkBalance()

// بررسی موجودی کیف پول برای توکن USDT
router.get('/balance', async (req, res) => {
  try {
      const balance = await checkBalance();
      res.send({ WBalance: balance})
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
// ارسال bnb
router.post('/withdraw', async (req, res) => {
  try {
      const withdrawInfo=req.body.withdrawInfo
      console.log('withdrawInfo=',withdrawInfo);
      const transaction=await sendUSDT(withdrawInfo.withdrawAddress, withdrawInfo.USDTamount);
      // const transaction=await sendBNB(withdrawInfo.withdrawAddress, withdrawInfo.USDTamount);
      res.send(transaction)
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});
// -----------------------------------------
// ---------------------functions--------------
// تابع کلید خصوصی
async function privateKeyFunction(privateKey, PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword) {
  try {
    // تقسیم و ذخیره کلید خصوصی
    await splitAndStorePrivateKey(privateKey,PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword);

    // بازسازی کلید خصوصی
    const restoredPrivateKey = await reconstructPrivateKey(PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword);
    console.log('Restored Private Key matches original:', restoredPrivateKey === privateKey);
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// رمزنگاری کلید خصوصی با پسورد
function encryptShare(data, password) {
  const iv = crypto.randomBytes(16);  // تولید بردار اولیه (IV) تصادفی
  const key = crypto.scryptSync(password, 'salt', 32);  // تولید کلید 256 بیتی
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // ذخیره IV به همراه داده رمزنگاری شده
  return `${iv.toString('hex')}:${encrypted}`;
}

// رمزگشایی داده‌ها
function decryptShare(encryptedData, password) {
  const [ivHex, dataHex] = encryptedData.split(':');  // جدا کردن IV از داده
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(password, 'salt', 32);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
// updateAuth
function updateAuth(userPassword){
  console.log('152:User password:', userPassword);
  let userInfo=auth.find(user => user.port == userPort.port);
  userInfo.userPassword=userPassword;
  let userIndex=auth.indexOf(userInfo);
  auth.splice(userIndex,1,userInfo);
}
// findUserPassword();
function findUserPassword(port){
  const secretData=JSON.parse(fs.readFileSync('./StorageData/secretData.json'));
  let found=secretData.some(user =>user.port == port);
  if(found){
    let userInfo=secretData.find(user =>user.port == port);
    return userInfo.userPassword
  }else{
    console.log(`153:No member found with port ${port}`)
  }
}
// تقسیم کلید خصوصی به بخش‌ها و ذخیره در پایگاه داده
async function splitAndStorePrivateKey(privateKey,PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword) {
  // تقسیم کلید خصوصی به 3 بخش (2 بخش برای بازسازی کافی است)
  const privateKeyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  try {
    // پیاده‌سازی crypto برای برطرف کردن مشکل getRandomValues
    if (!globalThis.crypto) {
      globalThis.crypto = {
        getRandomValues: (array) => {
          const buffer = require('crypto').randomBytes(array.length);
          for (let i = 0; i < buffer.length; i++) {
            array[i] = buffer[i];
          }
          return array;
        },
      };
    }
    const shares = SSS.split(Buffer.from(privateKeyHex, 'hex'), { shares: 3, threshold: 2 });

    // چاپ بخش‌ها پیش از ذخیره‌سازی
    console.log('Shares to store:', shares.map(share => share.toString('hex')));

    // ذخیره هر بخش به صورت چرخشی در سه پایگاه داده
    for (let i = 0; i < shares.length; i++) {
      const encryptedShare = encryptShare(shares[i].toString('hex'), userPassword);  // رمزنگاری
      const shareData = {
        userId: userPort.port,
        shareIndex: i + 1,
        privateKeyShare: encryptedShare, // ذخیره نسخه رمزنگاری‌شده
      };
      // console.log(`Storing share ${shareData.shareIndex}:`, shareData.privateKeyShare);
      // await PrivateKeyShare.create(shareData);
      if (i % 3 === 0) {
        await PrivateKeyShare1.create(shareData);
        console.log(`Stored in DB1 - Share ${shareData.shareIndex}:`, shareData.privateKeyShare);
      } else if (i % 3 === 1) {
        await PrivateKeyShare2.create(shareData);
        console.log(`Stored in DB2 - Share ${shareData.shareIndex}:`, shareData.privateKeyShare);
      } else {
        await PrivateKeyShare3.create(shareData);
        console.log(`Stored in DB3 - Share ${shareData.shareIndex}:`, shareData.privateKeyShare);
      }
    }
    console.log('Private key shares stored successfully!');
  } catch (error) {
    console.error('Error during split:', error.message);
  }
}

// بازسازی کلید خصوصی از بخش‌های ذخیره‌شده
async function reconstructPrivateKey(PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword) {
  console.log('125:');
  console.log('126:userPort.port=',userPort.port);
  // const shares = await PrivateKeyShare.find({ userId: userPort.port }); // استفاده از userId برای شناسایی بخش‌ها
  const sharesDB1 = await PrivateKeyShare1.find({ userId: userPort.port });// استفاده از userId برای شناسایی بخش‌ها
  const sharesDB2 = await PrivateKeyShare2.find({ userId: userPort.port });// استفاده از userId برای شناسایی بخش‌ها
  const sharesDB3 = await PrivateKeyShare3.find({ userId: userPort.port });// استفاده از userId برای شناسایی بخش‌ها
  const shares = [...sharesDB1, ...sharesDB2, ...sharesDB3];
  
  // چاپ مقادیر خوانده‌شده از پایگاه داده
  console.log('Shares read from DB1, DB2, and DB3:', shares.map(share => share.privateKeyShare));
  // console.log('Shares read from DB:', shares.map(share => share.privateKeyShare));

  // فیلتر کردن بخش‌ها بر اساس userId
  const filteredShares = shares.filter(share => share.userId === userPort.port);

  if (filteredShares.length < 2) {
    throw new Error('Not enough shares to reconstruct the private key!');
  }

  // مرتب‌سازی بخش‌ها بر اساس shareIndex
  filteredShares.sort((a, b) => a.shareIndex - b.shareIndex);

  // تبدیل داده‌های ذخیره‌شده به Buffer
  const sharesForCombine = filteredShares.slice(0, 2).map(share =>
    Buffer.from(decryptShare(share.privateKeyShare, userPassword), 'hex')
  );

  // // تبدیل داده‌های ذخیره‌شده به Buffer
  // const sharesForCombine = filteredShares.slice(0, 2).map(share => Buffer.from(share.privateKeyShare, 'hex'));

  // بازسازی کلید خصوصی
  const reconstructedKeyBuffer = SSS.combine(sharesForCombine);
  const reconstructedKey = `0x${reconstructedKeyBuffer.toString('hex')}`;

  console.log('Reconstructed Private Key:', reconstructedKey);
  return reconstructedKey;
}
// بررسی موجودی
async function checkBalance() {
  try {
    // اتصال به قرارداد USDT
      const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);

      // console.log('159:usdtContract=',usdtContract)
      const publicKey=JSON.parse(fs.readFileSync(fileName));
      console.log("publicKey:", publicKey);
      const balance = await usdtContract.balanceOf(publicKey);
      // const balance = await provider.getBalance(publicKey);
      console.log("USDT Balance:", ethers.formatUnits(balance, 18));  // نمایش موجودی به صورت خوانا
      return ethers.formatUnits(balance, 18)
      
  } catch (error) {
      console.error("Error fetching balance:", error);
  }
}
// ارسال bnb
async function sendBNB(to, amount) {
  try {
    // بازسازی کلید خصوصی
    const userInfo=auth.find(user => user.port == userPort.port);
    const userPassword=userInfo.userPassword
    const restoredPrivateKey = await reconstructPrivateKey(PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword);
    const wallet = new ethers.Wallet(restoredPrivateKey, provider);  // کلید خصوصی کیف پول
    const tx = {
      to: to,
      value: ethers.parseUnits(amount, 'ether')  // مقدار BNB به واحد Wei
    };
    const transaction = await wallet.sendTransaction(tx);
    console.log('Transaction Hash:', transaction.hash);
    return transaction.hash
    
  } catch (error) {
    console.log('159:eror=',error)
  }
  
}
// ارسال usdt
async function sendUSDT(to, amount) {
  try {
    const decimals = 18;  // تعداد اعشار USDT در شبکه BEP-20
    const value = ethers.parseUnits(amount, decimals);  
    const usdtAbi = [
      'function transfer(address to, uint amount) public returns (bool)'
    ];
    // بازسازی کلید خصوصی
    const userInfo=auth.find(user => user.port == userPort.port);
    const userPassword=userInfo.userPassword
    const restoredPrivateKey = await reconstructPrivateKey(PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3,userPassword);
    const wallet = new ethers.Wallet(restoredPrivateKey, provider);  // کلید خصوصی کیف پول

    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, usdtAbi, wallet);
    const tx = await usdtContract.transfer(to, value);
    console.log('Transaction Hash:', tx);
    return tx
  } catch (error) {
      console.log('159:eror=',error);
      return error
  }
  
}
// --------------------------------------------------
module.exports = router;