const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const passport = require('passport');
const fs = require("fs");
const path=require('path');
//--
// const auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
const secretData=JSON.parse(fs.readFileSync('./StorageData/secretData.json'));
const execTerminalCommand = require("../Models/execTerminalCommand");
const UserChargeService = require("../Models/UserChargeService");
const { exec } = require("child_process");
const crypto=require('crypto');
const urlAddress='http://5.75.173.197:'
// const userPort = require('../Models/userInfoStore');
const userStore = require('../Models/userInfoStore');
let adminPort=60000;
const jwt = require('jsonwebtoken');
const { userInfo } = require('os');
let token=''
//global varyables
let trialTestTime=5* 60 * 1000; // 50 minutes in milliseconds for trial testing
let chargeTime=4* 60 * 1000; // 10 minutes in milliseconds for charghing period
let deActivePeriodTime=20000*60* 60 * 1000; // 50 minutes in milliseconds for deactive period
let tokenJWTtime='5m'//trial test time
// =========================start internal coding===========================
let userInfoGlobal= userStore.getUserInfo();
let userPort=userInfoGlobal.port
if(userPort !== adminPort){
  // RemainActiveTimeChecking(userInfoGlobal.id);
}
// ==============================================
//***************Register Post*********
router.post("/register",async (req,res)=>{
  const {name, email, password,password2,key1,key2,question1,question2,question3,googleAuthBackup}=req.body.userInfo;
  console.log('149:user=',name)
  let errors=[];

  // check required fields:
  if(!name || !email || !password || !password2 || !key1 || !key2 ){
    return res.json({registerAuthentication: false, msg:'All Fields Required'}); 
  };
  // check Perimission Match:
  if((name !=='YahyaBayat') && (name !=='YahyaBayat0') && (name !=='YahyaBayat1') && (name !=='YahyaBayatSub1') && (name !=='YahyaBayatSub2') && (name !=='YahyaBayatSub3') && (name !=='AbbasBayat') && (name !=='AbbasBayatSub1') && (name !=='AbbasBayatSub2') && (name !=='AbbasBayatSub3') && (name !=='SaeedBayat') && (name !=='SaeedBayatSub1') && (name !=='SaeedBayatSub2') && (name !=='SaeedBayatSub3') && (name !=='AmmarBayat')  && (name !=='AmmarBayatSub1')  && (name !=='AmmarBayatSub2')  && (name !=='AmmarBayatSub3')) errors.push({msg: 'Name Error-permission'});
  if((email !=='YahyaBayat@site') && (email !=='YahyaBayat@site0')  && (email !=='YahyaBayat@site1') && (email !=='YahyaBayat@siteSub1') && (email !=='YahyaBayat@siteSub2') && (email !=='YahyaBayat@siteSub3') && (email !=='AbbasBayat@site')  && (email !=='AbbasBayat@siteSub1')  && (email !=='AbbasBayat@siteSub2')  && (email !=='AbbasBayat@siteSub3') && (email !=='SaeedBayat@site') && (email !=='SaeedBayat@siteSub1') && (email !=='SaeedBayat@siteSub2') && (email !=='SaeedBayat@siteSub3') && (email !=='AmmarBayat@site') && (email !=='AmmarBayat@siteSub1') && (email !=='AmmarBayat@siteSub2') && (email !=='AmmarBayat@siteSub3')) return res.json({registerAuthentication: false, msg:'Email Error-permission'});
  // console.log('412:error=',errors)
  // check Passwords Match:
  if(password !== password2){
    return res.json({registerAuthentication: false, msg:'Passwords not Match'}); 
    
  }

  // check Passwords> 6 character:
  if(password.length<6){
    return res.json({registerAuthentication: false, msg:'Passwords should be at least 6 characters'}); 
  }else{
    // ================method1======================
    const auth=userStore.getAllUsers();
    let foundEmail=auth.some(user => user.email === email)
    if(foundEmail){
      return res.json({registerAuthentication: false, msg:'This Email Already Exist'});
    }else{
      try {
        const hashedPassword=await bcrypt.hash(password,10);
        // تولید پسورد تصادفی
        const userPassword = generateRandomPassword();
        console.log('145:userPassword=',userPassword);
        const encrypted_googleAuthBackup=encryptShare(googleAuthBackup, userPassword);  // رمزنگاری
        const encrypted_question1 = encryptShare(question1, userPassword);  // رمزنگاری
        const encrypted_question2 = encryptShare(question2, userPassword);  // رمزنگاری
        const encrypted_question3 = encryptShare(question3, userPassword);  // رمزنگاری
        let newUser={
          name:name, 
          email:email,
          password:hashedPassword,
          key1:key1,
          key2:key2,
          userPassword:userPassword,
          active:true,
          maxBalance:0,
          id:Date.now().toString(),
          lastTimeCharge:Date.now().toString(),
          chargingDebt:1,
          chargeActiveStatus:"",
          userLevel:'Tester',
          delete_buttom:false,
          stop_buttom:false,
          lastTxHash:"",
          port:null
        };
        // افزودن کاربر جدید:
        userStore.addOrUpdateUser(newUser);
        userStore.initUser(newUser.id);
        let userInfo = userStore.getUserInfo();
        let userPort=userInfo.port
        setTimeout(function () { RemainActiveTimeChecking(userInfo.id) }, trialTestTime);
        // let userPort=authModifiy(newUser)
        // fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
        let newUserSecretData={
          port:userPort,
          question1:encrypted_question1,
          question2:encrypted_question2,
          question3:encrypted_question3,
          googleAuthBackup:encrypted_googleAuthBackup
        }
        secretDataModify(newUserSecretData)
        fs.writeFileSync('./StorageData/secretData.json', JSON.stringify(secretData));
        StorageData_folderCreate(userPort);
        // log_files_folderCreate(userPort);
        pm2AppModify(userPort);
        execTerminalCommand(userPort,`pm2 start pm2App${userPort}.json`)
        // req.flash('successMsg','You are now Registered');
        return res.json({registerAuthentication: true, msg:urlAddress+userPort+'/#/users/login', userPort:userPort} )
      } catch (error) {
        console.log('498:e=',error)
        // res.redirect('register')
      }
    }
    // ==========================================
    
  }
  
});
// *****************************************

//*******************login******* */
router.post("/login", (req, res, next) => {
  console.log('186:authKey=');
  // Check that the form data is being received correctly
  const {email, password,authKey}=req.body.userInfo;
  req.body.email = req.body.userInfo.email;
  req.body.password = req.body.userInfo.password;
  console.log('186:authKey=',authKey);
  if(!email || !password || !authKey){ // check required fields:
    return res.json({LoginAuthentication: false, msg:'All Fields Required'}); 
  }else if(authKey !=='yahya'){ // check Perimission Recharge:
    console.log('186:authKey=',authKey);
    return res.json({LoginAuthentication: false, msg:'authentication key Error-permission. Please Recharge'});
  }else{
    const auth=userStore.getAllUsers();
    let userInfo=auth.find(user => user.email == email)
    console.log('143:userInfo=',userInfo)
    if(userInfo.email === email){
      let RemainChargTime=null;
      let chargStatus="";
      let JWT_SECRET=userInfo.userPassword
      
      let chargingDebt=0;
      if((userInfo.key1 != "YAHYABAYAT1364")){
        console.log('160:userInfo=',userInfo);
        let ChargTimeStatus=RemainChargTimeChecking(userInfo);
        RemainChargTime=ChargTimeStatus.RemainChargTime;
        chargStatus=ChargTimeStatus.chargStatus;
        console.log('184:chargingDebt=',chargingDebt);
        chargingDebt=UserChargeService.chargingDebtCalculation(userInfo.maxBalance,userInfo.lastTimeCharge,userInfo.userLevel,userInfo.chargingDebt,chargeTime);

        console.log('185:chargingDebt=',chargingDebt);
        console.log("162:chargStatus=",chargStatus);
        if(((userInfo.userLevel == 'Tester')&& (RemainChargTime>0))){
          token = jwt.sign({ wallet: userInfo. id }, JWT_SECRET, { expiresIn: tokenJWTtime });
        }
        // تغییر یک فیلد:
        userStore.updateField("chargingDebt", chargingDebt);
      }else if(userInfo.key1 == "YAHYABAYAT1364"){
        RemainChargTime=10000;
        chargStatus="adminLogin"
        chargingDebt=0;
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.error("Error in Passport authenticate:", err);
          return next(err);
        }
        if (!user) {
          console.log('189:user=',user)
          // Authentication failed, provide a failure message
          console.log("Authentication failed:", info);
          // req.flash("error_msg", info.message);
          // return res.redirect("/users/login"); // Redirect to login page
          return res.json({LoginAuthentication: false, msg:'Invalid email or password'}); // Redirect to login page
        }
        // console.log('190:user=',user)
        // If authentication is successful, log in the user
        req.logIn(user, (err) => {
          if (err) {
            console.error("Error logging in the user:", err);
            return next(err);
          }
          console.log('459:user=',user)
          console.log("Login successful! Redirecting to home page.");
          
          console.log("userInfo.key1=",userInfo.key1);
          console.log("163:chargStatus=",chargStatus);
          return res.json({LoginAuthentication: true,userKey1:userInfo.key1,msg:userInfo.port,RemainChargTime:RemainChargTime,chargStatus:chargStatus,userLevel:userInfo.userLevel, token:token,chargingDebt:chargingDebt,chargeActiveStatus:userInfo.chargeActiveStatus}); // Redirect to dashboard page or any other secure page
        });
      })(req, res, next)
    }else{
      return res.json({LoginAuthentication: false, msg:'Your Email is not Registered. Please register first'});
    }
    
}
});
//*************************** */
// ---------------------
//*********** */ Logout post**********

router.post('/logout', async (req, res, next) => {
  try {
      // Ensure passport logout is completed
      console.log('logout enter')
      await req.logout((err) => {
          if (err) {
              return next(err); // Handle any errors
          }
          // Clear session cookie from the client side
          res.clearCookie('connect.sid'); // Replace 'connect.sid' with your session cookie name if it's different

          // Optionally destroy the session on the server-side
          req.session.destroy((err) => {
              if (err) {
                  return next(err);
              }

              // Send a success message or redirect
              return res.json({ LogoutAuthentication: true, msg: 'Successfully logged out' });
          });
      });
  } catch (err) {
      console.error('Error during logout:', err);
      return next(err);
  }
});
//******************************
//*********** getUrlInfo ***********
router.get("/urlInfo",(req,res)=>{
  console.log('165:urlInfo');
  const auth=userStore.getAllUsers();
  let userInfo=auth.find(user => user.port == userPort)
  console.log('143:userInfo=',userInfo)

  res.json({userPort:userInfo.port, msg:urlAddress+adminPort+'/#/users/register'} )
});
// *****************************
//*********** AnswersQuestions ***********
router.post("/AnswersQuestions",(req,res)=>{
  const {answer1,answer2,answer3}=req.body.answers;
  console.log('answer1:',answer1);
  console.log('answer2:',answer2);
  console.log('answer3:',answer3);
  let forgetAuthentication=false;
  const auth=userStore.getAllUsers();
  let userInfo=auth.find(user => user.port == userPort)
  const userAnswers=secretData.find(user =>user.port == userPort);
  const decryptUserAnswers1= decryptShare(userAnswers.question1, userInfo.userPassword)// رمزگشایی
  const decryptUserAnswers2= decryptShare(userAnswers.question2, userInfo.userPassword)// رمزگشایی
  const decryptUserAnswers3= decryptShare(userAnswers.question3, userInfo.userPassword)// رمزگشایی
  console.log('154:decryptUserAnswers1=',decryptUserAnswers1)
  console.log('155:decryptUserAnswers2=',decryptUserAnswers2)
  console.log('156:decryptUserAnswers3=',decryptUserAnswers3)
  if((answer1 === decryptUserAnswers1) && (answer2 === decryptUserAnswers2) && (answer3 === decryptUserAnswers3)){
    console.log('157:forgetAuthentication=',forgetAuthentication)
    forgetAuthentication=true
  }
  res.json({forgetAuthentication:forgetAuthentication, userPort:userPort} )
});
// *****************************
// *************passwordChange*************
router.post("/passwordChange",async (req,res)=>{
  console.log('189:passwordChange')
  const {pass1,pass2,userPort}=req.body.newPassData;
  console.log('190:password1=',pass1)
  console.log('191:password2=',pass2)
  // ================method1======================
  const hashedPassword=await bcrypt.hash(pass1,10);
  // تغییر یک فیلد:
  userStore.updateField("password", hashedPassword);
  return res.json({passwordChange: true} )
  // ---------------------------------
  // let founduser=auth.some(user => user.port === userPort)
  // if(founduser){
  //   try {
  //     const hashedPassword=await bcrypt.hash(pass1,10);
  //     let userModify=auth.find(user => user.port === userPort);
  //     userModify.password=hashedPassword;
  //     userStore.addOrUpdateUser(userModify);
  //     // let index_userModify=auth.indexOf(userModify);
  //     // auth.splice(index_userModify,1,userModify);
  //     // fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
  //     return res.json({passwordChange: true} )
  //   } catch (error) {
  //     console.log('498:e=',error)
  //     // res.redirect('register')
  //   }
  // }
});
// ****************************************


// -------------functions--------
function authModifiy(newUser){
  let foundUser=auth.some(user => user.active == false);
  if(foundUser){
    let oldUser=auth.find(user => user.active == false);
    let index_oldUser=auth.indexOf(oldUser);
    newUser.port=oldUser.port;
    auth.splice(index_oldUser,1,newUser);
  }else{
    newUser.port=60000+auth.length;
    auth.push(newUser);
  }
  return newUser.port;
}
// --------------------------
function secretDataModify(newUser){
  let foundUser=secretData.some(user => user.port == newUser.port);
  if(foundUser){
    let oldUser=secretData.find(user => user.port == newUser.port);
    let index_oldUser=secretData.indexOf(oldUser);
    secretData.splice(index_oldUser,1,newUser);
  }else{
    secretData.push(newUser);
  }
}
// ----------------------
function StorageData_folderCreate(userPort){
  const folderName = './StorageData/'+userPort.toString();
  let arrayStorage=new Array();
  let objStorage={};
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    fs.writeFileSync(folderName+'/botList.json', JSON.stringify(arrayStorage));
    fs.writeFileSync(folderName+'/Daily_Balance_BTCUSDT.json', JSON.stringify(arrayStorage));
    fs.writeFileSync(folderName+'/outPutData.json', JSON.stringify(arrayStorage));
    fs.writeFileSync(folderName+'/outPutFilledData.json', JSON.stringify(arrayStorage));
    fs.writeFileSync(folderName+'/outPutManualData.json', JSON.stringify(arrayStorage));
    fs.writeFileSync(folderName+'/pm2App'+userPort+'.json', JSON.stringify(objStorage));
  } catch (err) {
    console.error(err);
  }
  
}
// ----------------------
function log_files_folderCreate(userPort){
  const folderName = path.join(__dirname, 'log_files', userPort.toString());
  // const folderName = './log_files/'+userPort.toString();
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  const logFilePath = path.join(folderName, userPort.toString()+'.log');
  // Define the log message
  const logMessage = 'This is a new log entry.\n';

  // Use fs.appendFile to add the log message to the file
  fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
          console.error('Error writing to log file:', err);
      } else {
          console.log('Log entry added!');
      }
  });
  
}
// ---------------------------------
function pm2AppModify(userPort){
    const auth=userStore.getAllUsers();
    let userAuthInfo=auth.find(user => user.port == userPort);
    const folderName = './StorageData/'+userPort.toString();
    const pm2App=JSON.parse(fs.readFileSync("./StorageData/pm2App.json"));
    let newUser={};
    newUser.name=userAuthInfo.name+userPort;
    newUser.script="app.js";
    newUser.cwd="/Users/Administrator/aays01/10";
    // newUser.log_file="/Users/Administrator/aays01/10/log_files/"+userPort+"/"+userPort+".log"
    // newUser.log_file=path.join(logDir, `${userPort}.log`), // Constructed log file path
    newUser.out_file = "C:\\Users\\Administrator\\aays01\\10\\log_files\\" + userPort + "\\" + userPort + ".log";  // Output log path
    newUser.error_file="/Users/Administrator/aays01/10/log_files/"+userPort+"/"+userPort+"_error.log"
    newUser.args=userAuthInfo.id;
    newUser.time=true;
    newUser.exec_mode="fork";
    let apps0=pm2App.apps;
    // let foundUser=apps0.some(user => parseInt(user.name.substring(user.name.length-5)) == userPort);
    // if(foundUser){
    //   let oldUser=apps0.find(user => parseInt(user.name.substring(user.name.length-5)) == userPort);
    //   let index_oldUser=apps0.indexOf(oldUser);
    //   apps0.splice(index_oldUser,1,newUser);
    // }else{
    //   apps0.push(newUser)
    // }
    apps0.push(newUser)
    pm2App.apps=apps0;
    fs.writeFileSync("./StorageData/pm2App.json", JSON.stringify(pm2App));
    let apps=new Array();
    apps.push(newUser);
    let pm2App0={};
    pm2App0.apps=apps;
    console.log('173:pm2App0=',pm2App0)
    fs.writeFileSync(folderName+'/pm2App'+userPort+'.json', JSON.stringify(pm2App0));
}
//pm2 start pm2App${userPort}.json`
//const pm2Command = `pm2 start pm2App${port}.json`;
// ---------------------------
// function execTerminalCommand(userPort){
//   let directory = `C:\\Users\\Administrator\\aays01\\10\\StorageData\\${userPort}`;
//   let command = `cd ${directory} && pm2 start pm2App${userPort}.json`;
//   console.log('154:command=',command)
//   exec(command, { stdio: 'ignore' },(error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing command: ${error.message}`);
//       return;
//     }

//     if (stderr) {
//       console.error(`Standard Error Output: ${stderr}`);
//       return;
//     }

//     console.log(`Standard Output: ${stdout}`);
//   });
// }
// ----------------------------
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
// ----------------------------------------
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
// -----------------------------------------
// تولید پسورد تصادفی
function generateRandomPassword() {
  return crypto.randomBytes(16).toString('hex'); // 16 بایت پسورد تصادفی
}
//--------------------------------------
//بررسی دوره اتمام دوره آزمایشی کاربر
// function freeUsingCheck(createUserTime){
//     const freePeriodTime=100* 60 * 1000; // 50 minutes in milliseconds
    
//     let ResFreePeriodTime=freePeriodTime-((Date.now() - createUserTime));
//     console.log('501:ResFreePeriodTime=',ResFreePeriodTime)
//     if(ResFreePeriodTime>0){
//       ResFreePeriodTime=msToTime(ResFreePeriodTime);
//       console.log('198:ResFreePeriodTimeMS=',ResFreePeriodTime)
//       return ResFreePeriodTime
//     }else{

//       return  ResFreePeriodTime=0
//     }
// }
// --------------------------------
//--------------------------------------
//checking remain time to charging
function RemainChargTimeChecking(userInfo){
  console.log('189:userInfo=',userInfo);
  let chargePeriodTime=null;
  if(userInfo.userLevel === 'Tester'){
    chargePeriodTime=trialTestTime;
  }else{
    chargePeriodTime=chargeTime;
  }
  console.log('147:',Date.now() - parseInt(userInfo.lastTimeCharge))
  let RemainChargTime=chargePeriodTime-((Date.now() - parseInt(userInfo.lastTimeCharge)));
  console.log('501:RemainChargTime=',RemainChargTime)
  if(RemainChargTime>0){
    chargStatus=msToTime(RemainChargTime);
    return {RemainChargTime:RemainChargTime, chargStatus:chargStatus}
  }else{ 
    chargStatus="0";
    userInfo.chargeActiveStatus=msToTime(RemainChargTime+deActivePeriodTime);
    console.log('140:userInfo=',userInfo);
    userStore.addOrUpdateUser(userInfo);
    return  {RemainChargTime:0, chargStatus:"0"}
  }
}
// --------------------------------
function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000), 10);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  // Pad with zeros if needed
  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');
  milliseconds = String(milliseconds).padStart(3, '0');

  return `${hours}:${minutes}:${seconds}`;
}
// --------------------------------
// updateAuth
function updateAuth(parameterName,newValue){
  let userInfo=auth.find(user => user.port === userInfo.port);
  userInfo[parameterName]=newValue;
  console.log('152:userInfo=',userInfo)
  let userIndex=auth.indexOf(userInfo);
  auth.splice(userIndex,1,userInfo);
  fs.writeFileSync('./StorageData/auth.json', JSON.stringify(auth));
}
// --------------------------------------------------
//deActivationCheck
function RemainActiveTimeChecking(userId){
  console.log('190:userId=',userId);
  userStore.initUser(userId);
  let userInfo = userStore.getUserInfo();
  console.log('314:userInfo=',userInfo);
  if(userInfo.port !== adminPort){
    console.log('147:',Date.now() - parseInt(userInfo.lastTimeCharge));
    let remainActiveTime
    if(userInfo.userLevel == 'Tester'){
      remainActiveTime=(trialTestTime+deActivePeriodTime)-(Date.now()-parseInt(userInfo.lastTimeCharge))
      console.log('183:remainActiveTime=',remainActiveTime);
    }else{
      remainActiveTime=(chargeTime+deActivePeriodTime)-(Date.now()-parseInt(userInfo.lastTimeCharge));
      console.log('184:remainActiveTime=',remainActiveTime);
    }
    console.log('501:remainActiveTime=',remainActiveTime);
    if(remainActiveTime>0 && userInfo.active == true){
      userInfo.chargeActiveStatus=msToTime(remainActiveTime);
      console.log('139:userInfo=',userInfo);
      userStore.addOrUpdateUser(userInfo);
      // setTimeout(function () { RemainActiveTimeChecking(userId) }, chargeTime);
    }else{ 
      console.log('149:------------userInfo=');
      console.log(`⚠️ 153:user ${userInfo.email} deactivated at ${new Date().toISOString()} remainActiveTime=${remainActiveTime}`);
      userInfo.active=false;
      userInfo.stop_buttom=true;
      userStore.addOrUpdateUser(userInfo);
      console.log('503:userInfo=',userInfo);
      // execTerminalCommand(userInfo.port,`pm2 stop pm2App${userInfo.port}.json`);
    }
  }
}

// -----------------------------------------
module.exports=router;


