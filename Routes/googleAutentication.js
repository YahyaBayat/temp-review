
const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const router=express.Router();
const fs = require("fs");
const path=require('path');
const auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
const secretData=JSON.parse(fs.readFileSync('./StorageData/secretData.json'));
const crypto=require('crypto');
// مسیر برای تولید QR Code و Secret
router.get('/generate', (req, res) => {
    let userPort = req.query.userPort;
    console.log('189:userPort=',userPort);
    const userInfo=auth.find( user => user.port == userPort);
    const secret = speakeasy.generateSecret({ name: `02YourAppName (${userInfo.name})` });
    console.log('175:secret=',secret)
    const encryptedSecret = encryptShare(secret.base32, userInfo.userPassword);  // رمزنگاری
    updateAuth(encryptedSecret,userInfo);
    fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
    // Store userPort in session
    req.session.userPort = userPort;

    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
            return res.status(500).json({ message: 'خطا در تولید QR Code' });
        }
        res.json({
            secret: secret.base32,
            qrCode: dataUrl
        });
    });
});
router.post('/verify', (req, res) => {
    
    const verificationCodeInfo= req.body.verificationCodeInfo;
    console.log('189:verificationCodeInfo=',verificationCodeInfo);
    const email= verificationCodeInfo.email;
    const token= verificationCodeInfo.code;
    console.log('token=',token);
    if (!token) {
        return res.status(400).json({ message: 'verification code is required' });
    }
    const found=auth.some( user => user.email == email);
    if(found){
        const userInfo=auth.find( user => user.email == email);
        const userSecretData=secretData.find( user => user.port == userInfo.port);
        const secret= decryptShare(userSecretData.googleAuthBackup, userInfo.userPassword)
        console.log('187:secret=',secret)
        const isVerified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1
        });
        console.log('456:isVerified=',isVerified)
        if(isVerified){
            res.json({ verified: isVerified, msg:""});
        }else{
            res.json({ verified: isVerified, msg:"Please enter correct code!"});
        }
        // res.json({ verified: true, msg:""});
    }else{
        console.log('145=found=',found)
        res.json({ verified: false, msg:'email is not found'});
    }
    
});
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
function updateAuth(encryptedSecret,userInfo){
  console.log('152:encryptedSecret:', encryptedSecret);
  userInfo.encryptedAutenticator=encryptedSecret;
  let userIndex=auth.indexOf(userInfo);
  auth.splice(userIndex,1,userInfo);
}
// --------------------------------------------------
module.exports = router;