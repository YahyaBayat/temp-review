const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'pay.env') }); // بارگذاری pay.env
const { ethers } = require('ethers');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Web3 = require('web3');
const SSS = require('shamirs-secret-sharing'); // الگوریتم تقسیم کلید
const app = express();
const crypto=require('crypto');
const router=express.Router();

// تولید پسورد تصادفی
const userPassword = generateRandomPassword();
console.log('User password:', userPassword);

// اطلاعات اتصال
const INFURA_API_URL = process.env.INFURA_API_URL;

// اتصال به شبکه بلاکچین
const web3 = new Web3(INFURA_API_URL);

// ایجاد یک کیف پول جدید
const account = web3.eth.accounts.create();
console.log('Address:', account.address);
console.log('159:Private Key:', account.privateKey);


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
    const PrivateKeyShare1 = db1.model('PrivateKeyShare', shareSchema);
    const PrivateKeyShare2 = db2.model('PrivateKeyShare', shareSchema);
    const PrivateKeyShare3 = db3.model('PrivateKeyShare', shareSchema);

    // اجرای عملیات بعد از اتصال موفق به همه پایگاه‌های داده
    return privateKeyFunction(account.privateKey, PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3);
  })
  .catch((err) => {
    console.error('Failed to connect to databases:', err.message);
  });

// اتصال به MongoDB01
// mongoose.connect('mongodb+srv://YahyaBayat3:hAx9SmyyMGrUJ8lw@cluster0.8dtop.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

// // // اتصال به MongoDB02
// mongoose.connect('mongodb+srv://yahyabayatnosrat:gSBahePt7KGNNZcn@cluster02.2gwg1.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

// // اتصال به MongoDB03
// mongoose.connect('mongodb+srv://yahyabayatnosrat03:6GAXPLUoavfP3ETs@cluster03.xcw2k.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })


  // .then(() => {
  //   console.log('MongoDB is connected');
  //   privateKeyFunction(account.privateKey);
  // })
  // .catch(err => console.log('MongoDB connection error:', err));

  async function privateKeyFunction(privateKey, PrivateKeyShare1, PrivateKeyShare2, PrivateKeyShare3) {
    // پیاده‌سازی crypto برای برطرف کردن مشکل getRandomValues
    if (!globalThis.crypto) {
      globalThis.crypto = {
        getRandomValues: (array) => {
          const buffer = crypto.randomBytes(array.length);
          for (let i = 0; i < buffer.length; i++) {
            array[i] = buffer[i];
          }
          return array;
        },
      };
    }
    // تقسیم کلید خصوصی به بخش‌ها و ذخیره در پایگاه داده
    async function splitAndStorePrivateKey(privateKey) {
      // تقسیم کلید خصوصی به 3 بخش (2 بخش برای بازسازی کافی است)
      const privateKeyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
      try {
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
            userId: 60001,
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
    async function reconstructPrivateKey() {
      // const shares = await PrivateKeyShare.find({ userId: 60001 }); // استفاده از userId برای شناسایی بخش‌ها
      const sharesDB1 = await PrivateKeyShare1.find({ userId: 60001 });// استفاده از userId برای شناسایی بخش‌ها
      const sharesDB2 = await PrivateKeyShare2.find({ userId: 60001 });// استفاده از userId برای شناسایی بخش‌ها
      const sharesDB3 = await PrivateKeyShare3.find({ userId: 60001 });// استفاده از userId برای شناسایی بخش‌ها
      const shares = [...sharesDB1, ...sharesDB2, ...sharesDB3];
      
      // چاپ مقادیر خوانده‌شده از پایگاه داده
      console.log('Shares read from DB1, DB2, and DB3:', shares.map(share => share.privateKeyShare));
      // console.log('Shares read from DB:', shares.map(share => share.privateKeyShare));

      // فیلتر کردن بخش‌ها بر اساس userId
      const filteredShares = shares.filter(share => share.userId === 60001);

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
    try {
      // تقسیم و ذخیره کلید خصوصی
      await splitAndStorePrivateKey(privateKey);

      // بازسازی کلید خصوصی
      const restoredPrivateKey = await reconstructPrivateKey();
      console.log('Restored Private Key matches original:', restoredPrivateKey === privateKey);
    } catch (error) {
      console.error('Error:', error.message);
    }
}







// // رمزنگاری کلید خصوصی با پسورد تصادفی
// const encryptedPrivateKeyData = encryptKey(privateKey, userPassword);
// console.log('149:',encryptedPrivateKeyData);

router.get('/deposite',  async (req, res) => {
    const fileName = './StorageData/'+userPort.port+'/walletAddress.json'
    // const account={};
    console.log('185:fileName=',fileName)
    if (!fs.existsSync(fileName)){
        console.log('147:fileName');
        // ایجاد یک کیف پول جدید
        const account = web3.eth.accounts.create();
        console.log('123:Address:', account.address);
        console.log('125:Private Key:', account.privateKey);

        
        // fs.writeFileSync(fileName, JSON.stringify(account.address));
        // await fs.promises.writeFile('./StorageData/'+userPort.port+'/walletAddress.json', JSON.stringify(account.address, null, 2));
        // تولید پسورد تصادفی
        const userPassword = generateRandomPassword();
        console.log('User password:', userPassword);
        // رمزنگاری کلید خصوصی با پسورد تصادفی
        const encryptedPrivateKeyData = encryptKey(account.privateKey, password);
        console.log('149:',encryptedPrivateKeyData);        
        const encryptedUserPass = encryptKey(account.privateKey, password);
        console.log('149:',encryptedPrivateKeyData);
        
        res.send({address:account.address,privateKey:account.privateKey});
    }
    // const encryptedFile = JSON.parse(fs.readFileSync('./StorageData/'+userPort.port+'/wallet.json'));
    // console.log('143:encryptedFile=',encryptedFile);
    // console.log('143:length=',Object.keys(encryptedFile).length);
    
    // if(Object.keys(encryptedFile).length>0){
    //     // رمزگشایی
    //     console.log('144:length=',Object.keys(encryptedFile).length);
    //     const password = 'secure-password';
    //     const account = decryptWallet(encryptedFile.encryptedData, password, encryptedFile.iv);
    //     console.log('174:Decrypted Wallet:', account);
    // }else{
    //     // ایجاد یک کیف پول جدید
    //     account = web3.eth.accounts.create();
    //     console.log('Address:', account.address);
    //     console.log('Private Key:', account.privateKey);
    //     const walletData = JSON.stringify({ privateKey: account.privateKey });
    //     const password = account.address;
    //     // رمزنگاری
    //     const encrypted = encryptWallet(walletData, password);
    //     console.log('Encrypted Wallet:', encrypted);
    //     // ذخیره در فایل
    //     fs.writeFileSync('./StorageData/'+userPort.port+'/wallet.json', JSON.stringify(encrypted));
    // }
    
});

// راه‌اندازی Provider و Wallet
// const provider = new ethers.JsonRpcProvider(INFURA_API_URL);
// const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// // ABI قرارداد تتر (ERC20/BEP20)
// const USDT_ABI = [
//     "function balanceOf(address account) external view returns (uint256)",
//     "function transfer(address recipient, uint256 amount) external returns (bool)",
// ];

// // اتصال به قرارداد
// const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, wallet);

// // تنظیم Express
// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // بررسی موجودی
// app.get('/balance', async (req, res) => {
//     try {
//         const balance = await usdtContract.balanceOf(wallet.address);
//         res.json({ balance: ethers.formatUnits(balance, 18) }); // نمایش موجودی با دقت 18
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // ارسال USDT
// app.post('/send', async (req, res) => {
//     const { to, amount } = req.body;

//     if (!to || !amount) {
//         return res.status(400).json({ error: 'آدرس گیرنده و مقدار الزامی است.' });
//     }

//     try {
//         const tx = await usdtContract.transfer(to, ethers.parseUnits(amount.toString(), 18));
//         await tx.wait(); // منتظر تایید تراکنش
//         res.json({ transactionHash: tx.hash });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // راه‌اندازی سرور
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
// -----------------------------------------
// ---------------------functions--------------
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
// --------------------------------------------------
module.exports = router;