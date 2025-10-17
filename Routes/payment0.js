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
// ---------------------------------------------------
// اطلاعات اتصال
const INFURA_API_URL = process.env.INFURA_API_URL;

// آدرس قرارداد USDT روی شبکه BSC
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;

// ABI استاندارد برای توکن‌های ERC20/BEP20 (فقط تابع balanceOf)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

// اتصال به شبکه BSC از طریق RPC
const provider = new ethers.JsonRpcProvider(INFURA_API_URL);

// اتصال به قرارداد USDT
const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, provider);


// اتصالات به سه پایگاه داده مجزا
const db1Promise = mongoose.createConnection(process.env.MONGO_URI_1, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db2Promise = mongoose.createConnection(process.env.MONGO_URI_2, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db3Promise = mongoose.createConnection(process.env.MONGO_URI_3, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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
      // ایجاد یک کیف پول جدید
      const account = ethers.Wallet.createRandom();
      console.log("123:Address:", account.address);
      console.log("124:Mnemonic:", account.mnemonic.phrase);
      console.log("125:Private Key:", account.privateKey);
      fs.writeFileSync(fileName, JSON.stringify(account.address));
      // await fs.promises.writeFile('./StorageData/'+userPort.port+'/walletAddress.json', JSON.stringify(account.address, null, 2));
      // تولید پسورد تصادفی
      const userPassword = generateRandomPassword();
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

// بررسی موجودی کیف پول برای توکن USDT
router.get('/balance', async (req, res) => {
  try {
      const balance = await checkBalance();
      res.send({ WBalance: balance})
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
// تولید پسورد تصادفی
function generateRandomPassword() {
    return crypto.randomBytes(16).toString('hex'); // 16 بایت پسورد تصادفی
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
  console.log('125:')
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
      const publicKey=JSON.parse(fs.readFileSync(fileName));
      const balance = await usdtContract.balanceOf(publicKey);
      // console.log("USDT Balance:", ethers.formatUnits(balance, 18));  // نمایش موجودی به صورت خوانا
      return ethers.formatUnits(balance, 18)
      
  } catch (error) {
      console.error("Error fetching balance:", error);
  }
}
// --------------------------------------------------
module.exports = router;