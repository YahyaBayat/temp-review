const express = require('express');
const router = express.Router();
const userKeys = require('../Models/userKeys');
// const fs = require('fs').promises;
const fs = require("fs");
const util = require('util');
const readFile = util.promisify(fs.readFile);
let chargeTime=4* 60 * 1000; // 10 minutes in milliseconds for charghing period

// async function readAuthFile() {
//   try {
//     const authData = await readFile('./StorageData/auth.json', 'utf8');
//     const auth = JSON.parse(authData);
//     console.log(auth);
//     return auth
//   } catch (error) {
//     console.error('Error reading file:', error);
//   }
// }
// let auth=readAuthFile();
// let auth = JSON.parse(await fs.readFile('./StorageData/auth.json', 'utf8'));
let auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
console.log('189:auth=',auth)
// await fs.writeFile('./StorageData/auth.json', JSON.stringify(auth));
const execTerminalCommand = require("../Models/execTerminalCommand");
const path=require('path');
// -----------------------------------------
const userInfo=auth.find( user => user.key2 == userKeys.key2);
console.log('379:userInfo=',userInfo);
// -----------
router.get('/',  async (req, res) => {
    auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
    res.json(userInfo);
});
router.get('/userList',  (req, res) => {
    res.send(auth);
}); 
// buttom Status:
router.post('/StateBtmUser', async (req, res) => {
  try {
    const port = parseInt(req.body.inputData.port, 10);
    const clickedButton = req.body.inputData.clickedButtom;
    console.log('291:clickedButton=',clickedButton)
    if (isNaN(port)) {
      return res.status(400).json({ msg: 'Invalid port number' });
    }
    const user = auth.find(user => user.port === port);
    console.log('292:user=',user)
    if (!user) {
      return res.status(404).json({ msg: `No member found with port ${port}` });
    }
    const userIndex = auth.indexOf(user);
    console.log('293:user=',user)
    console.log('294:clickedButton=',clickedButton)
    if (clickedButton === 'delete') {
      const pm2Command = `pm2 delete pm2App${port}.json`;
      try{
        await execTerminalCommand(port, pm2Command);
        await folderRemove('StorageData', port);
        await pm2_remove_user(port);
        await folderRemove('log_files', port);
        auth[userIndex]['active']=false;
        auth[userIndex]['delete_buttom'] = true;
        auth[userIndex]['stop_buttom'] = false;
      }catch(e){
        console.log('589:eror=',e)
      }
    } else if (clickedButton === 'stop') {
      const pm2Command = `pm2 stop pm2App${port}.json`;
      try{
        await execTerminalCommand(port, pm2Command);
        auth[userIndex]['stop_buttom'] = true;
      }catch(e){
        console.log('589:eror=',e)
      }
    }else if (clickedButton === 'start'){
      const pm2Command = `pm2 start pm2App${port}.json`;
      try{
        await execTerminalCommand(port, pm2Command);
        console.log('140:auth[userIndex]=',auth[userIndex])
        auth[userIndex]['stop_buttom'] = false;
        auth[userIndex]['active']=true;
        auth[userIndex]['lastTimeCharge']=Date.now()-chargeTime;
        console.log('141:auth[userIndex]=',auth[userIndex])
      }catch(e){
        console.log('589:eror=',e)
      }
    }else if (clickedButton === 'restart'){
      let pm2Command = `pm2 restart pm2App${port}.json`;
      console.log('182:pm2Command=',pm2Command)
      try{
        await execTerminalCommand(port, pm2Command);
      }catch(e){
        console.log('589:eror=',e)
      }
    }
    console.log('143:user=',user)
    await fs.promises.writeFile("./StorageData/auth.json", JSON.stringify(auth, null, 2));
    res.json(auth);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// ===================functions====================
// ----------------------
// async function folderRemove(folder, userPort) {
//   const folderName = `./${folder}/`+userPort.toString();
//   try {
//     fs.rm(folderName, { recursive: true, force: true });
//     console.log(`${folderName} is deleted!`);
//   } catch (err) {
//     console.error(`Failed to remove ${folderName}:`, err);
//   }
// }
async function folderRemove(folder, userPort) {
  const folderName = `./${folder}/${userPort}`;
  try {
    await fs.promises.rm(folderName, { recursive: true, force: true });
    console.log(`${folderName} is deleted!`);
  } catch (err) {
    console.error(`Failed to remove ${folderName}:`, err);
  }
}
// ---------------------------------
// async function execTerminalCommand(port, pm2Command) {
//   return new Promise((resolve, reject) => {
//     const directory = `C:\\Users\\Administrator\\aays01\\10\\StorageData\\${port}`;
//     const command = `cd ${directory} && ${pm2Command} && pm2 save`;
//     console.log('154:command=',command)
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         return reject(`Error: ${error.message}`);
//       }
//       if (stderr) {
//         return reject(`stderr: ${stderr}`);
//       }
//       console.log(`stdout: ${stdout}`);
//       resolve();
//     });
//   });
// }
// ----------------------------
async function pm2_remove_user(port){
  // console.log('pm2 enter-------')
  const pm2AppString = await fs.promises.readFile("./StorageData/pm2App.json", "utf8");
  const pm2App=JSON.parse(pm2AppString)
  // console.log('123:pm2App=',pm2App);
  // console.log('123:type=',typeof pm2App);
  // const pm2App=JSON.parse(fs.readFileSync("./StorageData/pm2App.json"));
  apps0=pm2App.apps
  // console.log('124: apps0 =', apps0);
  let foundUser=apps0.some(user => parseInt(user.name.substring(user.name.length-5)) == port);
  if(foundUser){
    let oldUser=apps0.find(user => parseInt(user.name.substring(user.name.length-5)) == port);
    let index_oldUser=apps0.indexOf(oldUser);
    apps0.splice(index_oldUser,1);
    pm2App.apps=apps0;
    await fs.promises.writeFile("./StorageData/pm2App.json", JSON.stringify(pm2App, null, 2));
    // fs.writeFileSync("./StorageData/pm2App.json", JSON.stringify(pm2App));
  }else{
    console.log('169:!founduser')
  }
}
// ------------------------------

module.exports = router;
 