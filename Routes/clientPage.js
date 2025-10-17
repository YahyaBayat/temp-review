const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ensureAuth } = require('../config/auth');
// const { json } = require('express');
// const os = require('os');
const WebSocket = require('ws');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const uuid=require('uuid');
const path=require('path');
const json = require('big-json');
const fs = require("fs");
const userKeys = require('../Models/userKeys');
const { Console } = require('console');
let corres_order_info=new Array();
const userStore = require('../Models/userInfoStore');
let chargeTime=4* 60 * 1000; // 10 minutes in milliseconds for charghing period
// const auth=JSON.parse(fs.readFileSync('./StorageData/auth.json'));
let disconnect_net=true;
let delayTime_trading=1000;
let delayTime_public=1000;
let spotSbscripe=false;
let manualClientOrderIdBS= new Array();
let spot_cancel_order_client_order_id=new Array();
let BTCUSDT_public_WS=false;
let BTCUSDT_SP=0;
// const outPutData=new Array();
// const outPutFilledData=new Array();
// ---------------memory--------
// const v8=require('v8');
// const console = require('console');
// console.log(v8.getHeapStatistics())
// const TotalHeapSize=v8.getHeapStatistics().total_available_size;
// let totalHeapSizeInGB=(TotalHeapSize/1024/1024/1024).toFixed(2);
// console.log('TotalHeapSize='+TotalHeapSize +'=~'+totalHeapSizeInGB+'(GB)')
// --------------------------
//Global Variabls
// ----------------------
// const localBotlist=new Array()
// const symInfo={};
// const balanceData={};
// const alertErrorBot = new Array();
// let Old_Order_Info = {};
// const outPutManualData = new Array();
// const chartData = new Array();
// ----------------------
// CommonJS require:
// const os = require('os');
// -----------------free memory info ----------------
// // Get the number of total memory in Byte
// const totalRAM = os.totalmem();
// // Print the result in MB
// console.log(totalRAM / (1024 * 1024));

// // Get the number of available memory in Byte
// const freeRAM = os.freemem();
// // Print the result in MB
// console.log(freeRAM / (1024 * 1024));
// ----------------------
const symInfo=JSON.parse(fs.readFileSync("./StorageData/symInfo.json"));
const balanceData={};
// const balanceData=JSON.parse(fs.readFileSync("./StorageData/balanceData.json"));
// const botList = JSON.parse(fs.readFileSync("./StorageData/botList.json"));
// const alertErrorBot = JSON.parse(fs.readFileSync("./StorageData/alertErrorBot.json"));
// let Old_Order_Info = JSON.parse(fs.readFileSync("./StorageData/Old_Order_Info.json"));
let Old_Order_Info ={}; 
// const outPutManualData = JSON.parse(fs.readFileSync("./StorageData/outPutManualData.json"));
// const chartData = JSON.parse(fs.readFileSync("./StorageData/chartData.json"));
// // -----------1-----------
// const readStream = fs.createReadStream('./StorageData/botList.json');
// const parseStream = json.createParseStream();
// parseStream.on('data', function(pojo) {
    
//     botList.push(pojo[0]);
//     console.log('pojo=',pojo);
//     console.log('botList=',botList);
// });

// readStream.pipe(parseStream);
// console.log('botList=',botList)
// -----------------------------------
// -------------2------------------
// const StreamArray = require('stream-json/streamers/StreamArray');
// const {Writable} = require('stream');
// const path = require('path');
// const fs = require('fs');

// const fileStream = fs.createReadStream(path.join(__dirname, 'sample.json'));
// const jsonStream = StreamArray.withParser();

// const processingStream = new Writable({
//     write({key, value}, encoding, callback) {
//         //Save to mongo or do any other async actions

//         setTimeout(() => {
//             console.log(value);
//             //Next record will be read only current one is fully processed
//             callback();
//         }, 1000);
//     },
//     //Don't skip this, as we need to operate with objects, not buffers
//     objectMode: true
// });

// //Pipe the streams as follows
// fileStream.pipe(jsonStream.input);
// jsonStream.pipe(processingStream);

// //So we're waiting for the 'finish' event when everything is done.
// processingStream.on('finish', () => console.log('All done'));


// -----------------3---------------------

// // --------------------------------------
// stream=fs.createReadStream('./StorageData/botList.json',"UTF-8");
// var data=new Array();

// stream.once("data",function (){
//     console.log("\n\n");
//     console.log("started Reading file...");
//     console.log("\n\n");
// })

// stream.on("data",function (chunk){
//     process.stdout.write('  chunk: ',chunk);
//     data+=chunk;
// });

// stream.on("end",function (){
//     console.log("\n\n");
//     console.log("finished Reading file...");
//     console.log("\n\n");
// })
// console.log('data=',data)
// // --------------------------------
// // =============================
// // -----------------------
//     User.findOne({email:'YahyaBayat@site'})
//                 .then(user=>{
//                     userKeys.key1=user.key1
//                     userKeys.key2=user.key2;
//                     console.log('userKeys=',userKeys)});
// // =============================

excutionBot();
async function excutionBot(){
    let start=Date.now()
    // ----------------botlis Reading---
    const botList = new Array();
    const alertErrorBot = new Array();
    // let pathFile_alertErrorBot='./StorageData/alertErrorBot.json';
    // await stramReadFunc(pathFile_alertErrorBot,alertErrorBot);
    const auth=userStore.getAllUsers();
    const userInfo=auth.find( user => user.key2 == userKeys.key2);
    console.log('379:userInfo=',userInfo);
    let pathFile_botList='./StorageData/'+userInfo.port+'/botList.json';
    await stramReadFunc(pathFile_botList,botList);
    rewrittingFiles(pathFile_botList,botList,JSON.stringify(new Array()));
    // ----------------outPutFilledData Reading---
    const outPutFilledData = new Array();
    let pathFile_outPutFilledData='./StorageData/'+userInfo.port+'/outPutFilledData.json';
    await stramReadFunc(pathFile_outPutFilledData,outPutFilledData);
    rewrittingFiles(pathFile_outPutFilledData,outPutFilledData,JSON.stringify(new Array()));
    // ------------------------------------
    // ----------------outPutData Reading---
    const outPutData = new Array();
    let pathFile_outPutData='./StorageData/'+userInfo.port+'/outPutData.json';
    await stramReadFunc(pathFile_outPutData,outPutData);
    rewrittingFiles(pathFile_outPutData,outPutData,JSON.stringify(new Array()));
    // ------------------------------------
    // ----------------Daily_Balance_BTCUSDT Reading---
    const Daily_Balance_BTCUSDT = new Array();
    let pathFile_Daily_Balance_BTCUSDT='./StorageData/'+userInfo.port+'/Daily_Balance_BTCUSDT.json';
    await stramReadFunc(pathFile_Daily_Balance_BTCUSDT,Daily_Balance_BTCUSDT);
    rewrittingFiles(pathFile_Daily_Balance_BTCUSDT,Daily_Balance_BTCUSDT,JSON.stringify(new Array()));
    // ------------------------------------
    // --------------------------------------------
    // outPutData.forEach(orderInfo => {
    //     if(orderInfo.buyStatus === 'new'){
    //         orderInfo.buyStatus='deadOrder'
    //     }else if(orderInfo.sellStatus === 'new' || orderInfo.sellStatus === 'partiallyFilled'){
    //         orderInfo.sellStatus='deadOrder'
    //     }else if(orderInfo.sellStatus === 'suspend'){
    //         orderInfo.sellStatus='deadOrder_suspend'
    //     }
    // });
    // ------------------------------------
    // // ------------------------------------
    // // ----------------outPutManualData Reading---
    const outPutManualData = new Array();
    let pathFile_outPutManualData='./StorageData/'+userInfo.port+'/outPutManualData.json';
    await stramReadFunc(pathFile_outPutManualData,outPutManualData);
    rewrittingFiles(pathFile_outPutManualData,outPutManualData,JSON.stringify(new Array()));
    // ----------------------------------------
    // // ----------------outPutManualData Reading---
    const chartData = new Array();
    // let pathFile_chartData='./StorageData/chartData.json';
    // await stramReadFunc(pathFile_chartData,chartData);
    // ----------------------------------------
    // ----------------------
    // -------------------printLocalTime of------
    // console.log('diffTime=',diffTime);
    // -----------stramReadFunc---------------
    async function stramReadFunc(pathFile,readedArray){
        const readStream = fs.createReadStream(pathFile);
        const parseStream = json.createParseStream();
        let PrimeryStorageData={};
        parseStream.on('data', function(pojo) {
            // console.log(pojo);
            PrimeryStorageData=pojo;
        });
        readStream.pipe(parseStream);
        let readStreamFile = new Promise(function(resolve, reject) {
            parseStream.on('end', () => resolve(PrimeryStorageData));
            parseStream.on('error',e => reject(e)); // or something like that. might need to close 
        })
        // await readStreamFunction(readStreamFile);
        let StorageData= await readStreamFile;
        // console.log('StorageData=',StorageData);
        for (const numberObj in StorageData){
            readedArray.push(StorageData[numberObj]);
        }
        
    }
    // ---------------------stramWriteFunc
    async function stramWriteFunc(pathFile,readedArray){
        return new Promise(function(resolve, reject) {
            let writeStream = fs.createWriteStream(pathFile);
            const stringifyStream = json.createStringifyStream({
                body: readedArray
            });
            stringifyStream.on('data', function(strChunk) {
                // console.log('strChunk=',strChunk);
                writeStream.write(strChunk)
            });
            stringifyStream.on('end', ()=>{
                resolve(writeStream)
            });
            stringifyStream.on('error', (e)=>{
                reject(e)
            });

        })
    }
    // ----------------------------
    // ----------------rewrittingFiles---
    function rewrittingFiles (pathFile,newArry,oldArry){
        let start=Date.now()
        let str_newArry=JSON.stringify(newArry);
        let diffTime=Date.now() - start;
        // console.log('diffTime1=',diffTime);
        // console.log('str_newArry=',str_newArry)
        if(str_newArry === oldArry){
            // console.log('845:no change');
        }else{
            // console.log('846:changed');
            start=Date.now()
            fs.writeFileSync(pathFile, str_newArry);
            oldArry=str_newArry;
            diffTime=Date.now() - start;
            // console.log('diffTime2=',diffTime);
        }
        length_array_restriction()
        setTimeout(() =>{
            // console.log("227:internal_OldArray[0]=",internal_OldArray[0])
            rewrittingFiles(pathFile,newArry,oldArry)
        },20000);
    }
    // ----------------------
    // ==============start of ws_socket_structure===================
    // ---------------------------------------trading Method2---------------
    async function createSocket_trading(method0,params0,delayTime_trading,errCode){
        return new Promise(function(resolve,reject){
            try{
            ws_trading = new WebSocket('wss://api.hitbtc.com/api/3/ws/trading');
            console.log('760:ws_trading open=',params0);
            ws_trading.onopen = async () => {
                console.log('761:ws_trading open=');
                console.log('300');
                let IranDate = new Date(Date.now()+12600000);
                console.log('001T:ws/trading open at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() )
                alertErrorBot.unshift({id: uuid.v4(), msg:':001T:ws/trading open at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+method0+':(delayT='+delayTime_trading/1000+'sec)'});

                delayTime_trading=500;
                let server_response=await request_trading(method0,params0,delayTime_trading,errCode);
                console.log('301:server_response=',server_response);
                resolve(server_response)
            }; 
            ws_trading.onclose = (err) => {
                console.log('841:ws/trading close')
                let sym
                if(method0 === 'spot_new_order'){
                    sym=params0.symbol;
                }else if (method0 === 'login'){
                    sym='';
                }
                let IranDate = new Date(Date.now()+12600000);
                console.log('002T:ws/trading closed at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+method0+':'+sym+':(delayT='+delayTime_trading/1000+'sec)' )
                alertErrorBot.unshift({id: uuid.v4(), msg:':002T:ws/trading closed at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+method0+':'+sym+':(delayT='+delayTime_trading/1000+'sec)'});

                delayTime_trading=2*delayTime_trading;
                setTimeout(async() =>{
                spotSbscripe=false;
                await createSocket_trading("login", {"type": "Basic","api_key": userKeys.key1, "secret_key": userKeys.key2},delayTime_trading,errCode);
                // await createSocket_trading('spot_subscribe', {},delayTime_trading);
                console.log('99:delayTime_trading=',delayTime_trading);
                await request_trading('spot_subscribe',{},delayTime_trading,0);
                },delayTime_trading);
            };
            ws_trading.onerror = (err) => {
                let IranDate = new Date(Date.now()+12600000);
                console.log('003T:ws/trading died at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() )
                alertErrorBot.unshift({id: uuid.v4(), msg:':003T:ws/trading died at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+method0+':(delayT='+delayTime_trading/1000+'sec)'});
                ws_trading.close();
                // setTimeout(() => this._createSocket_public(), 1500);
            };
            }catch(e){
                console.log('763:ws_trading=',e);
            reject(e)
            }
        })
    }
    let trading_id=1
    const resCheck_id = new Set();
    async function request_trading(method0,params0,delayTime_trading,errCode) {
        if ((ws_trading.readyState === WebSocket.OPEN) && ((spotSbscripe === true) || (method0 === 'login') || (method0 === 'spot_subscribe'))) {
            return new Promise((resolve, reject) => {
                if(trading_id>999){
                    trading_id=1;
                }
                const msg = JSON.stringify({ method:method0, params:params0, id:trading_id });
                let IranDate = new Date(Date.now()+12600000);
                console.log(IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() + '--348:msg=',msg);
                // console.log(msg);
                ws_trading.send(msg);
                // if(method0 === 'spot_replace_order'){
                //     resCheck_id.add(params0.new_client_order_id);
                //     resCheck_fun(method0,params0,delayTime_trading,params0.new_client_order_id)
                    
                // }else{
                //     resCheck_id.add(trading_id)
                //     resCheck_fun(method0,params0,delayTime_trading,trading_id)
                // }
                resCheck_id.add(trading_id)
                resCheck_fun(method0,params0,delayTime_trading,trading_id)
                trading_id=trading_id+1
                ws_trading.onmessage = async (msg) => {
                    // console.log(msg)
                    try {
                        const message = JSON.parse(msg.data);
                        // console.log('258:',message);
                        if (message.id) {
                            resCheck_id.delete(message.id)
                            if(message.result){
                                // console.log('242=',message.result);
                                if(message.result == true){
                                    // console.log('id=',message.id);
                                    resolve(message.id)
                                }else{
                                    // console.log('245=',message.result);
                                    let trading_websocket_result=message.result;
                                    resolve(trading_websocket_result)
                                }
                            }else if(message.error){
                                console.log('351:error=',message.error);
                                alertErrorBot.unshift({id: uuid.v4(), msg:'421:WT/error code:'+message.error.code});
                                if(message.error.code === 1002){
                                    await request_trading("login", {"type": "Basic","api_key": Logged_User.key1, "secret_key": Logged_User.key2},500,0);
                                    console.log('100')
                                    await request_trading("spot_subscribe",{},500,0);
                                    resolve(message.error)
                                }
                                // ======================
                                // if (message.error.code === 20001){
                                //     console.log('352:params0=',params0)
                                //     if(method0 === "spot_new_order"){
                                //         eror20001Handling(message.error.code,params0.price,params0.symbol,params0.client_order_id_buy_sell,params0.quantity,errCode)
                                //     }else if(method0 === "spot_replace_order"){
                                //         let old_order_data=outPutData.find(order => order.buyOrderId === params0.client_order_id)
                                //         let sym=old_order_data.sym;
                                //         console.log('298:sym=',sym)
                                //         let index_old_order_data=outPutData.indexOf(old_order_data);
                                //         outPutData.splice(index_old_order_data, 1);
                                //         eror20001Handling(message.error.code,params0.price,sym,params0.new_client_order_id,params0.quantity,errCode)
                                //     }
                                //     reject(message.error)
                                // }
                                // =================================
                                else{
                                    reject(message.error)
                                }
                            }
                        }else if (message.method && message.params) {
                            if(message.method == 'spot_order'){
                                let orderInfo=message.params;
                                console.log('id='+orderInfo.id+':('+orderInfo.symbol+'):'+orderInfo.status)
                            }
                            if(message.method == 'spot_orders'){
                                spotSbscripe=true
                            }
                            let data = message.params;
                            if (data.length != 0) {
                                console.log('57:message=',message);
                                execution_update_order_sell(message);
                            }
                            resolve(message)
                        }else{
                            console.log('Unprocessed response2', message);
                            resolve(message)
                        }
                    } catch (e) {
                    console.log('Fail parse message', e);
                    }
                }
                
            }).catch((err) =>{
                console.log('581:err=',err);
                console.log('582:params0.client_order_id=',params0.client_order_id);
                if((err.code == 20002) && (errCode !=200011)){
                    let foundOrder=outPutData.some(order => ((order.buyOrderId == params0.client_order_id) ||  (order.sellOrderId == params0.client_order_id)))
                    let orderInfo
                    if(foundOrder){
                        orderInfo=outPutData.find(order => ((order.buyOrderId == params0.client_order_id) ||  (order.sellOrderId == params0.client_order_id)))
                        console.log('813:orderInfo=',orderInfo)
                    }else{
                        orderInfo=outPutManualData.find(order => (order.orderId == params0.client_order_id));
                        console.log('814:orderInfo=',orderInfo)
                        console.log('814:outPutManualData=',outPutManualData)
                    }
                    let sym=orderInfo.sym;
                    alertErrorBot.unshift({id: uuid.v4(), msg: 'cancel_order Eror: '+err.code+':'+' '+sym+'&&'+'old_claient_order_id='+params0.client_order_id });
                    console.log('46:old_claient_order_id='+params0.client_order_id);
                    cancelErrorHandling(params0.client_order_id,sym)

                }else if ((err.code == 20001 || err.code == 2010) && (errCode !=200011)){
                    if((method0 === "spot_new_order") && (params0.client_order_id.substring(0,4) != 'sell')){
                        eror20001Handling(err.code,params0.price,params0.symbol,params0.client_order_id_buy_sell,params0.quantity,errCode)
                    }else if((method0 === "spot_replace_order") && (params0.client_order_id.substring(0,5) != 'rSell')){
                        let foundOrder=outPutData.some(order => order.buyOrderId === params0.client_order_id);
                        if(foundOrder){
                            let old_order_data=outPutData.find(order => order.buyOrderId === params0.client_order_id);
                            let sym=old_order_data.sym;
                            console.log('298:sym=',sym)
                            let index_old_order_data=outPutData.indexOf(old_order_data);
                            outPutData.splice(index_old_order_data, 1);
                            eror20001Handling(err.code,params0.price,sym,params0.new_client_order_id,params0.quantity,errCode)
                        }else{
                            console.log('299:params0.client_order_id=',params0.client_order_id)
                        }
                    }else if((method0 === "spot_new_order") && (params0.client_order_id.substring(0,4) == 'sell')){
                        eror20001Handling_Sell(err.code,params0.price,params0.symbol,params0.quantity)
                    }
                }else if((err.code == 20009) && (errCode !=200011)){
                    alertErrorBot.unshift({id: uuid.v4(), msg:+err+':'+params0.symbol});
                    console.log('777:err=',err);
                }else if(errCode == 200011){
                    alertErrorBot.unshift({id: uuid.v4(), msg: 'Mnaual_Order_Eror: '+err.code+':'+' '+'sym='+params0.symbol });
                    console.log('778:err=',err);
                }
            })
            
        } else {
            delayTime_trading=2*delayTime_trading;
            let sym
            if(method0 === 'spot_new_order'){
                sym=params0.symbol;
            }else{
                sym='undefined';
            }
            alertErrorBot.unshift({id: uuid.v4(), msg: '004:W/T connection not established--'+method0+':'+sym+':(delayT='+delayTime_trading/1000+'sec)'});
            console.log('004:W/T connection not established--'+method0+':'+sym+':(delayT='+delayTime_trading/1000+'sec)')
            if(delayTime_trading/1000<16){
                setTimeout(async () => {
                    await request_trading(method0,params0,delayTime_trading,0)
                    }, delayTime_trading);
            }else{
                console.log('005:W/T connection not established--ws_trading close--'+method0+':'+sym+':(delayT='+delayTime_trading/1000+'sec>16sec)')
                ws_trading.close();
            }
            
        }
    }
    function resCheck_fun(method0,params0,delayTime_trading,id){
        setTimeout(async () => {
            try{
                if(resCheck_id.has(id)){
                    resCheck_id.delete(id);
                    ws_trading.close();
                    // if(method0 === 'spot_cancel_order' || method0 === 'spot_replace_order'){
                    //     console.log('386:id=',id+':'+method0+':'+params0.client_order_id);
                    //     request_trading(method0,params0,delayTime_trading,0)
                    // }else if(method0 === 'login'){
                    //     console.log('386:id=',id+':'+method0+':params0='+params0);
                    //     let IranDate = new Date(Date.now()+12600000);
                    //     console.log(':001T:ws/trading :'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+method0+' is not response:' )
                    //     if(params0.type == 'BASIC'){
                    //         // request_trading(method0,{"type": "HS256","api_key": userKeys.key1,"timestamp":Date.now(), "signature": userKeys.key2},delayTime_trading,0);
                    //         request_trading(method0,{"type": "BASIC","api_key": userKeys.key1, "secret_key": userKeys.key2},delayTime_trading,0);
                    //     }else{
                    //         request_trading(method0,{"type": "BASIC","api_key": userKeys.key1, "secret_key": userKeys.key2},delayTime_trading,0);
                    //     } 
                    // }else{
                    //     console.log('386:id=',id+':'+method0+':params0='+params0);
                    //     request_trading(method0,params0,delayTime_trading,0)
                    // }
                
                }

            }catch(e){
                console.log('581:',e);
                if(e.code === 20008){
                    console.log('582:',params0.client_order_id)
                }
            }
            
        }, 10000);
    }
    // ---------------------------------------------------------------------
    // ---------------------------------------public Method 4---------------
    async function createSocket_public(method0, ch0, params0,sym,delayTime_public){
        return new Promise(function(resolve,reject){
          try{
            ws_public = new WebSocket('wss://api.hitbtc.com/api/3/ws/public');
            console.log('760:ws_public open=',params0);
            ws_public.onopen = async () => {
              console.log('761:ws_public open=',sym);
              delayTime_public=500;
              let IranDate = new Date(Date.now()+12600000);
              alertErrorBot.unshift({id: uuid.v4(), msg:'006P:ws/public open at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() + 'ws/public connected'});
              let server_response=await request_public(method0, ch0, params0,sym,delayTime_public);
              // console.log('301:server_response=',server_response)
              resolve(server_response)
            }; 
            ws_public.onmessage = async (msg) => {
                // console.log(msg)
                try {
                const message = JSON.parse(msg.data);
                // console.log('msg=',message)
                if (message.id) {
                    if(message.result){
                        request_public_botList(message.result.subscriptions)
                        let public_websocket_result=message.result;
                        resolve(public_websocket_result)
                    }else if(message.error){
                    console.log('351:error=',message.error);
                    resolve(message.error)
                    }
                }else{
                    let sym;
                    if (message.snapshot != null){
                        if(message.snapshot['BTCUSDT'] !=null){
                            sym='BTCUSDT';
                            tick_snapshot = message.snapshot[sym];
                            BTCUSDT_SP = parseFloat(tick_snapshot[tick_snapshot.length-1].c);
                        }else{
                            botList.forEach(bot =>{
                                if(message.snapshot[bot.sym] !=null){
                                    sym=bot.sym;
                                }
                            });  
                        } 
                    }else if (message.update['BTCUSDT'] !=null){
                        sym='BTCUSDT';
                        let tick_update = message.update[sym];
                        BTCUSDT_SP = parseFloat(tick_update[0].c);
                    }else{
                        botList.forEach(bot =>{
                            if(message.update[bot.sym] !=null){
                                sym=bot.sym;
                            }
                        });
                    }                       
                    if(sym != undefined){
                        if(sym == 'BTCUSDT'){
                            BTCUSDT_public_WS=true
                            
                            // console.log('419:BTCUSDT_public_WS=',BTCUSDT_public_WS)
                            let found_BtcUsdt_Bot=botList.some(bot => bot.sym === 'BTCUSDT');
                            if(found_BtcUsdt_Bot){
                                let BtcUsdt_Bot=botList.find(bot => bot.sym === 'BTCUSDT');
                                if(BtcUsdt_Bot.delete_buttom == false){
                                    price_depended_funcs(sym,message);
                                    
                                }else{
                                    console.log('483:'+sym+'='+BTCUSDT_SP)
                                }
                            }else{
                                console.log('484:'+sym+'='+BTCUSDT_SP)
                            }
                        }else{
                            price_depended_funcs(sym,message)
                        }
                    }else{
                        disconnect_net=false;
                        ws_public.close();
                    }
    
                }
                // ----------
                } catch (e) {
                console.log('Fail parse message', e);
                reject(e)
                }
            }
            ws_public.onclose = (err) => {
                if(disconnect_net){
                    let IranDate = new Date(Date.now()+12600000);
                    console.log('007P:concetion is closed: (ws-Public socket is closed )'+sym+':(delayP='+delayTime_public/1000+'sec)')
                    alertErrorBot.unshift({id: uuid.v4(), msg: '007P:concetion is closed: (ws-Public socket is closed ) at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +'--'+sym+'--(delayP='+delayTime_public/1000+'sec)'});
                    setTimeout(async() =>{
                        delayTime_public=2*delayTime_public;
                        await createSocket_public(method0, ch0, params0,sym,delayTime_public);
                    },delayTime_public);
                }else{
                    console.log('541:(delete a bot causes ws-Public socket is been closed  )');
                    disconnect_net=true;
                    
                }
            };
            ws_public.onerror = (err) => {
                let IranDate = new Date(Date.now()+12600000);
                console.log('008P:concetion is died: (ws-Public socket is died ) --'+sym+':(delayP='+delayTime_public/1000+'sec)')
                alertErrorBot.unshift({id: uuid.v4(), msg: '008P:concetion is died: (ws-Public socket is died ) at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +'--'+sym+'--(delayP='+delayTime_public/1000+'sec)'});
                ws_public.close();
            };
          }catch(e){
            console.log('763:ws_public=',e);
            reject(e)
          }
        })
      
    }
    let public_id=1
    async function request_public(method0, ch0, params0,sym,delayTime_public) {
        if (ws_public.readyState === WebSocket.OPEN) {
            return new Promise((resolve, reject) => {
            if(public_id>999){
                public_id=1;
            }
            const msg = JSON.stringify({ method:method0, ch:ch0, params:params0, id:public_id++ });
            let IranDate = new Date(Date.now()+12600000);
            console.log(IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() + '348:msg=',msg);
            ws_public.send(msg);
            });
        } else {
            delayTime_public=2*delayTime_public;
            alertErrorBot.unshift({id: uuid.v4(), msg: '009P:WebSocket_public connection not established:--'+sym+':(delayT='+delayTime_public/1000+'sec)'});
            if((delayTime_public/1000)<16){
                console.log('009P:WebSocket_public connection not established:--'+sym+':(delayT='+delayTime_public/1000+'sec)')
                setTimeout(async () => {
                    await request_public(method0, ch0, params0,sym,delayTime_public);
                    }, delayTime_public);
            }else{
                console.log('010P:WebSocket_public connection not established:--ws_public.close--'+sym+':(delayT='+delayTime_public/1000+'sec)>16sec')
                ws_public.close();
            }
            
        }
    }
      
    // ==============end of ws_socket_structure===================
    // **************************************************
    // =========strat of Trading_Socket===============
    // -------------------------------------------------
    console.log('465:socketApi_trading start');
    let IranDate = new Date(Date.now()+12600000);
    alertErrorBot.unshift({id: uuid.v4(), msg:+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() + 'ws/trading start'});
    // ------------------
    // var crypto = require('crypto');
    // var hmac = crypto.createHmac('sha256', userKeys.key2);
    // data = hmac.update(toString(Date.now()));
    // gen_hmac= data.digest('hex');
    // console.log("hmac : " + gen_hmac);
    // await createSocket_trading("login", {"type": "HS256","api_key": userKeys.key1,"timestamp":Date.now(), "window": 10000, "signature": gen_hmac},500,0);
    // ---------------
    await createSocket_trading("login", {"type": "BASIC","api_key": userKeys.key1, "secret_key": userKeys.key2},500,0);
    await request_trading('spot_subscribe',{},500,0);
    // if (botList.length>0) await rebootFunction();
    // ----------------------------------------------
    BTCUSDT_public_ws_checking()
    // -------------------------------------------------
    let diffTime=Date.now() - start;
    console.log('diffTime1=',diffTime);
    // -------------------------
    // spot_subscribe_Request()
    // ------------------balance_BTCUSDT_DayNumber()----
    balance_BTCUSDT_DayNumber();
    // -----------
    router.get('/',  (req, res) => {
        res.send(userInfo);
    }); 
    router.post('/sym', async (req, res) => {
        let sym = req.body.sym;
        let quantity_increment;
        let correctSym=true
        if (symInfo[sym] === undefined){
            let currencies= await getSymProb(sym);
            quantity_increment=parseFloat(currencies.quantity_increment);
            let sym2=currencies.base_currency+currencies.quote_currency;
            if(sym2 === sym){
                symInfo[sym]=currencies;
                fs.writeFileSync('./StorageData/symInfo.json', JSON.stringify(symInfo));
            }else{
                alertErrorBot.unshift({id: uuid.v4(), msg: '010:Your sym is not valid'});
                correctSym=false;
                res.send(alertErrorBot);
            }
            
        }else{
            quantity_increment=parseFloat(symInfo[sym].quantity_increment)
        }
        if(correctSym){
            let foundBot=botList.some(bot => bot.sym === sym);
            let symPrice
            let minSymQuantity
            let symPriceQuantity
            if(foundBot){
                let bot=botList.find(bot => bot.sym === sym);
                let indexBot=botList.indexOf(bot);
                if(botList[indexBot].delete_buttom){
                    const response = await getPriceSym(sym);
                    symPrice = response.data;
                    minSymQuantity=symPrice.price*quantity_increment*1.1;
                    symPriceQuantity={symPrice:symPrice.price,minSymQuantity:minSymQuantity}
                    // console.log('741:symPriceQuantity=',symPriceQuantity)
                }else{
                    symPrice = bot.price;
                    minSymQuantity=symPrice*quantity_increment*1.1;
                    symPriceQuantity={symPrice:symPrice,minSymQuantity:minSymQuantity}
                    // console.log('742:symPriceQuantity=',symPriceQuantity)
                }
            }else{
                const response = await getPriceSym(sym);
                symPrice = response.data;
                minSymQuantity=symPrice.price*quantity_increment*1.1;
                symPriceQuantity={symPrice:symPrice.price,minSymQuantity:minSymQuantity}
                // console.log('743:symPriceQuantity=',symPriceQuantity)
            }
            res.json(symPriceQuantity);
        }
    });
    router.post('/balance', async (req, res) => {
        try{
            console.log('123:balanceData=')
            await addBalance();
            console.log('125:balanceData=',balanceData)
            chckingMinBalance(balanceData);
            res.json(balanceData);
        }catch(e){
            console.log('159:e=',e);
            res.json(e);
        }
        
    });
    router.get('/balance',  async (req, res) => {
        res.send(balanceData);
    });   
    router.delete('/alertErrorBot/:id', async (req,res)=>{
        let eraseErordBot=alertErrorBot.filter(msg => msg.id === req.params.id)[0];
        let index=alertErrorBot.indexOf(eraseErordBot);
        alertErrorBot.splice(index,1);
        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        res.json(alertErrorBot);
    });
    router.delete('/eraseAlertErrorBox', async (req,res)=>{
        alertErrorBot.splice(0,alertErrorBot.length);
        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        res.json(alertErrorBot);
    });
    router.post('/inputData', async (req, res) => {
        let inputData = {
            sym: req.body.inputData.sym.toUpperCase(),
            symR:'',
            symL:'',
            price:parseFloat(req.body.inputData.price),
            quantity: parseFloat(req.body.inputData.quantity),
            IQ:parseFloat(req.body.inputData.IQ),
            MO: parseInt(req.body.inputData.MO),
            nCC: parseInt(req.body.inputData.nCC),
            DPB: parseFloat(req.body.inputData.DPB),
            IDPB: parseFloat(req.body.inputData.IDPB),
            NBO: parseFloat(req.body.inputData.NBO),
            NDDB: parseFloat(req.body.inputData.NDDB),
            SDPB:parseFloat(req.body.inputData.SDPB),
            TBF: parseFloat(req.body.inputData.TBF),
            SBF: parseFloat(req.body.inputData.SBF),
            UPS0: parseFloat(req.body.inputData.UPS0),
            TSF0: parseFloat(req.body.inputData.TSF0),
            SSF0: parseFloat(req.body.inputData.SSF0),
            UPS1: parseFloat(req.body.inputData.UPS1),
            TSF1: parseFloat(req.body.inputData.TSF1),
            SSF1: parseFloat(req.body.inputData.SSF1),
            IUPS: parseFloat(req.body.inputData.IUPS),
            SSFU0: parseFloat(req.body.inputData.SSFU0),
            SSFU: parseFloat(req.body.inputData.SSFU),
            SSFU_Price: parseFloat(req.body.inputData.SSFU_Price),
            NSO: parseFloat(req.body.inputData.NSO),
            TPSFU: parseFloat(req.body.inputData.TPSFU),
            IntBot: parseInt(req.body.inputData.IntBot),
            Deep_dowun_buy:req.body.inputData.Deep_dowun_buy,
            buy_follow_up:req.body.inputData.buy_follow_up,
            sell_follow_up_Price:req.body.inputData.sell_follow_up_Price,
            sell_follow_up_Percent:req.body.inputData.sell_follow_up_Percent,
            sell_follow_up_buy_id:'',
            suspend_inner_cancel_status:false,
            tCC: 'M1',
            roundPricePow:Math.pow(10, (parseFloat(req.body.inputData.RP))),
            minSymQuantity:parseFloat(req.body.inputData.minSymQuantity),
            add_buttom: true,
            edit_buttom: false,
            delete_buttom: false,
            stop_buttom: false,
            filled_buy_order:0,
            diff_buy_spot:null,
            buy_order_is_done:false,
            FirstQuantity:'',
            dead:false,
            Temporary_SSFU:null,
            quantity_low:false,
            price:req.body.inputData.price,
            minCheckCandlePrice:req.body.inputData.price,
            closeUpCheckCandle:req.body.inputData.price,
            lowPrice:new Array(),
            closePrice:new Array(),
            openPrice:new Array(),
            timeStep:null,
            nCandle_change:false,
            // tick_snapshot:new Array(),   
            softBuy: true, 
        };
        // console.log('452:inputData.IUPS:',inputData.IUPS)    
        let mathIDPB=Math.pow((1+inputData.IDPB/100),inputData.filled_buy_order);
        let DPB_coeff=(inputData.DPB+inputData.SDPB)*mathIDPB;
        let RDPB=1-(DPB_coeff)/100;
        // console.log('122:RDPB=',RDPB);
        inputData.FirstQuantity=String((inputData.quantity)/(RDPB*(inputData.price)));
        // //console.log('123:inputData.FirstQuantity=',inputData.FirstQuantity);
        // //console.log('123:inputData=',inputData);
        
        if(!inputData.IUPS){
            inputData.IUPS=0;
        }
        if(!inputData.IQ){
            inputData.IQ=0;
        }
        if(!inputData.nCC){
            inputData.nCC=0;
        }
        if(!inputData.SDPB){
            inputData.SDPB=0;
        }
        if(!inputData.SBF){
            inputData.SBF=0;
        }
        if(!inputData.IDPB){
            inputData.IDPB=0;
        }
        if(!inputData.NBO){
            inputData.NBO=1;
        }
        if(!inputData.NDDB){
            inputData.NDDB=3;
        }
        if(!inputData.UPS0){
            inputData.UPS0=0;
        }
        if(!inputData.SSF0){
            inputData.SSF0=0;
        }
        if(!inputData.UPS1){
            inputData.UPS1=0;
        }
        if(!inputData.SSF1){
            inputData.SSF1=0;
        }
        if(!inputData.IntBot){
            inputData.IntBot=0;
        }
        if(!inputData.TPSFU){
            inputData.TPSFU=1.5*inputData.UPS1;
        }
        if(!inputData.SSFU0){
            inputData.SSFU0=0.1*inputData.TPSFU;
        }
        if(!inputData.SSFU){
            inputData.SSFU=inputData.TPSFU;
        }
        if(!inputData.SSFU_Price){
            inputData.SSFU_Price=Math.floor(0.5*(inputData.price));
        }
        if(!inputData.NSO){
            inputData.NSO=1;
        }
        if (!inputData.sym || !inputData.price || !inputData.quantity || !inputData.MO || !inputData.DPB || !inputData.TBF || !inputData.TSF0 || !inputData.TSF1){
            alertErrorBot.unshift({id: uuid.v4(), msg: '001:Please Fill all elements of BOT!'});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            console.log('344:',inputData)
            res.send(alertErrorBot);
            
        }else if((inputData.TBF<30) || (inputData.TSF0<30) || (inputData.TSF1<30)){

            alertErrorBot.unshift({id: uuid.v4(), msg: '002: TBF and TSF0 and TSF1 should be bigger than 30sec:(Check:TBF>=30,TSF0>=30,TSF1>=30) '});
            console.log('345:',inputData)
            res.send(alertErrorBot);
        }else if (inputData.quantity<inputData.minSymQuantity){
            alertErrorBot.unshift({id: uuid.v4(), msg: '003:Yure input Quantity should be higher than MinQuantity'});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        //console.log(alertErrorBot)
            res.send(alertErrorBot);
        }else if(inputData.SSFU<inputData.SSFU0){
            alertErrorBot.unshift({id: uuid.v4(), msg: '004:SSFU should be bigger than SSFU0: SSFU>SSFU0'});
            
            res.send(alertErrorBot);
        }else if(inputData.NSO<1){
            alertErrorBot.unshift({id: uuid.v4(), msg: 'NSO is Number of Sell Orders whish should be bigger than 0: NSO>0 '});
            
            res.send(alertErrorBot);
        }else if (inputData.SSFU_Price<=0){
            alertErrorBot.unshift({id: uuid.v4(), msg: 'SSFU_Price should be bigger than 0: SSFU_Price>0 '});
            res.send(alertErrorBot);
        }else{
            let foundbot=botList.some(bot => bot.sym === inputData.sym)
            if(foundbot){
                alertErrorBot.unshift({id: uuid.v4(), msg: '005:You have now a '+ inputData.sym+ ' bot. You can edit it.'});
            }else{
                botList.push(inputData);
                // localBotlist.push(localInputData);
                //await stramWriteFunc(pathFile_botList,botList);

                res.send(botList);
                // console.log(typeof(inputData.price))
                // return;
                //  console.log('451:botList=',botList)
                await B1DownEs(inputData.sym);
            }
            
        }
        
    });
    router.get('/botList', async (req, res) => {
        res.json(botList);
    });
    router.post('/:sym/:clickedButtom', async (req,res)=>{
        let sym = req.params.sym;
        let clickedButtom = req.params.clickedButtom;
        // console.log('clickedButtom=',clickedButtom);
        // console.log('sym=',sym);
        let found= botList.some(bot => bot.sym === req.params.sym );
        if (found){
            let deletedBot=botList.filter(bot => bot.sym === req.params.sym)[0];
            let index=botList.indexOf(deletedBot);
            if (clickedButtom=='delete'){
                botList[index]['delete_buttom']=true;
                botList[index]['stop_buttom']=false;
                // console.log('512:',botList[index]['delete_buttom'])
                //await stramWriteFunc(pathFile_botList,botList);;
                alertErrorBot.unshift({id: uuid.v4(), msg: 'deleted sym='+' '+req.params.sym});
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                await B1DownEs(sym);
            }else if(clickedButtom=='stop'){
                botList[index]['stop_buttom']=true;
                //await stramWriteFunc(pathFile_botList,botList);;
                alertErrorBot.unshift({id: uuid.v4(), msg: 'stopped sym='+' '+req.params.sym});
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                await B1DownEs(sym);
            }
            res.json(botList);
        } else {
            alertErrorBot.unshift({id: uuid.v4(), msg: 'No member with sym of '+' '+req.params.sym});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)

            res.send(alertErrorBot);
        }
            
    });
    router.delete('/:symBot', async (req,res)=>{
        let eraesed_symBot=req.params.symBot
        let found= botList.some(bot => bot.sym == eraesed_symBot);
        if (found){
            eraesed_outputDate(eraesed_symBot);
            //await stramWriteFunc(pathFile_outputDate,outputDate)
            eraesed_newOutputFilledDate(eraesed_symBot);
            eraesed_chartData(eraesed_symBot);
            eraesed_botList(eraesed_symBot);
            //await stramWriteFunc(pathFile_botList,botList);
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            res.json(botList);
        } else {
            alertErrorBot.unshift({id: uuid.v4(), msg: 'No member with sym of '+' '+eraesed_symBot});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            res.send(alertErrorBot)
        }
    });
    router.put('/editData', async (req,res)=>{
        let editData = {
            sym: req.body.editData.sym,
            quantity: parseFloat(req.body.editData.quantity),
            IQ:parseFloat(req.body.editData.IQ),
            MO: parseInt(req.body.editData.MO),
            nCC: parseInt(req.body.editData.nCC),
            DPB: parseFloat(req.body.editData.DPB),
            NBO: parseFloat(req.body.editData.NBO),
            NDDB: parseFloat(req.body.editData.NDDB),
            IDPB: parseFloat(req.body.editData.IDPB),
            SDPB:parseFloat(req.body.editData.SDPB),
            TBF: parseFloat(req.body.editData.TBF),
            SBF: parseFloat(req.body.editData.SBF),
            UPS0: parseFloat(req.body.editData.UPS0),
            TSF0: parseFloat(req.body.editData.TSF0),
            SSF0: parseFloat(req.body.editData.SSF0),
            UPS1: parseFloat(req.body.editData.UPS1),
            TSF1: parseFloat(req.body.editData.TSF1),
            SSF1: parseFloat(req.body.editData.SSF1),
            IUPS: parseFloat(req.body.editData.IUPS),
            IntBot: parseInt(req.body.editData.IntBot),
            Deep_dowun_buy:req.body.editData.Deep_dowun_buy,
            buy_follow_up:req.body.editData.buy_follow_up,
            sell_follow_up_Price:req.body.editData.sell_follow_up_Price,
            sell_follow_up_Percent:req.body.editData.sell_follow_up_Percent,
            SSFU0: parseFloat(req.body.editData.SSFU0),
            SSFU: parseFloat(req.body.editData.SSFU),
            SSFU_Price: parseFloat(req.body.editData.SSFU_Price),
            NSO: parseFloat(req.body.editData.NSO),
            TPSFU: parseFloat(req.body.editData.TPSFU),
            edit_buttom: true,
            FirstQuantity:'',
        };
        if(!editData.IUPS){
            editData.IUPS=0;
        }
        if(!editData.IQ){
            editData.IQ=0;
        }
        if(!editData.nCC){
            editData.nCC=0;
        }
        if(!editData.SDPB){
            editData.SDPB=0;
        }
        if(!editData.SBF){
            editData.SBF=0;
        }
        if(!editData.IDPB){
            editData.IDPB=0;
        }
        if(!editData.NBO){
            editData.NBO=1;
        }
        if(!editData.NDDB){
            editData.NDDB=3;
        }
        if(!editData.UPS0){
            editData.UPS0=0;
        }
        if(!editData.SSF0){
            editData.SSF0=0;
        }
        if(!editData.UPS1){
            editData.UPS1=0;
        }
        if(!editData.SSF1){
            editData.SSF1=0;
        }
        if(!editData.IntBot){
            editData.IntBot=0;
        }
        if(!editData.TPSFU){
            editData.TPSFU=1.2*editData.UPS1;
        }
        if(!editData.SSFU0){
            editData.SSFU0=0.1*editData.TPSFU;
        }
        if(!editData.SSFU){
            editData.SSFU=editData.TPSFU;
        }
        if(!editData.NSO){
            editData.NSO=1;
        }
        if (!editData.quantity || !editData.MO || !editData.DPB || !editData.TBF || !editData.DPB  || !editData.TSF0  || !editData.TSF1){
            alertErrorBot.unshift({id: uuid.v4(), msg: '001:Please Fill all elements of BOT!'});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            //console.log(alertErrorBot)
            console.log('346:',editData)
            res.send(alertErrorBot);
        }else if((editData.TBF<30) || (editData.TSF0<30) || (editData.TSF1<30)){
            alertErrorBot.unshift({id: uuid.v4(), msg: '002: TBF and TSF0 and TSF1 should be bigger than 30:(Check:TBF>=30,TSF0>=30,TSF1>=30) '});
            console.log('345:',editData)
            res.send(alertErrorBot);
        }else if(editData.SSFU<editData.SSFU0){
            alertErrorBot.unshift({id: uuid.v4(), msg: '004:SSFU should be bigger than SSFU0: SSFU>SSFU0'});
            res.send(alertErrorBot);
        }else if(editData.NSO<1){
            alertErrorBot.unshift({id: uuid.v4(), msg: 'NSO is Number of Sell Orders whish should be bigger than 0: NSO>0 '});
            
            res.send(alertErrorBot);
        }else{
            let found= botList.some(bot => bot.sym === editData.sym );
            if (found){
                let foundBot=botList.find(bot => bot.sym === editData.sym);
                let indexBot=botList.indexOf(foundBot);
                if (foundBot.delete_buttom==true){
                    botList[indexBot]['price']=parseFloat(req.body.editData.price),
                    editData.delete_buttom=false;
                    editData.dead=true;
                    editData.filled_buy_order=0;
                    editData.quantity_low=false;
                    editData.price=req.body.editData.price;
                    editData.minCheckCandlePrice=req.body.editData.price;
                    editData.closeUpCheckCandle=req.body.editData.price;
                    editData.softBuy=true;
                    if(!editData.SSFU_Price){
                        editData.SSFU_Price=Math.floor(0.5*(botList[indexBot].price)*botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                    }
                    console.log('52:editData=',editData);
                    // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    // res.json(alertErrorBot)
                    
                }else if(foundBot.stop_buttom==true){
                    botList[indexBot]['stop_buttom']=false;
                    if (foundBot.buy_order_is_done==true){
                        botList[indexBot]['buy_order_is_done']=false;
                    }
                }
                // console.log('109:foundBot.nCC=',foundBot.nCC);
                // console.log('110:foundBot.nCC=',editData.nCC);
                // console.log('111:foundBot.nCandle_change=',foundBot.nCandle_change);
                if(editData.nCC != foundBot.nCC){
                    editData.nCandle_change=true;
                    if(editData.nCC < foundBot.nCC){
                        let closePrice=botList[indexBot]['closePrice'];
                        let openPrice=botList[indexBot]['openPrice'];
                        let lowPrice=botList[indexBot]['lowPrice'];
                        botList[indexBot]['closePrice']=closePrice.slice(-editData.nCC-1);
                        botList[indexBot]['lowPrice']=lowPrice.slice(-editData.nCC-1);
                        botList[indexBot]['openPrice']=openPrice.slice(-editData.nCC-1);
                        console.log('botList[indexBot]["closePrice"]=',botList[indexBot]['closePrice'])
                    }
                    console.log('112:foundBot.nCC=',foundBot.nCC);
                    console.log('113:foundBot.nCC=',editData.nCC);
                    console.log('114:editData.nCandle_change=',editData.nCandle_change);
                }
                if((editData.sell_follow_up_Percent == false) && (editData.sell_follow_up_Price == false)){
                    editData.sell_follow_up_buy_id='';
                }
                let mathIDPB=Math.pow((1+editData.IDPB/100),botList[indexBot]['filled_buy_order']);
                let DPB_coeff=(editData.DPB+editData.SDPB)*mathIDPB;
                let RDPB=1-(DPB_coeff)/100;
                editData.FirstQuantity=String((editData.quantity)/(RDPB*(botList[indexBot]['price'])));
                console.log('51:editData=',editData);
                if(botList[indexBot].Temporary_SSFU == botList[indexBot].SSFU0){
                    console.log('Temporary_SSFU=',botList[indexBot].Temporary_SSFU)
                    botList[indexBot].Temporary_SSFU=editData.SSFU0
                }else{
                    botList[indexBot].Temporary_SSFU=editData.SSFU
                }
                alertErrorBot.unshift({id: uuid.v4(), msg: 'edited id='+' '+editData.sym});
                const editedBot = Object.assign({}, foundBot, editData);
                botList.splice(indexBot, 1, editedBot);
                try{

                    res.send(botList);
                    await B1DownEs(editData.sym);
                    

                }catch(e){
                    console.log(e)
                    res.json(botList);
                }
                
                
            } else {
                alertErrorBot.unshift({id: uuid.v4(), msg: 'No bot of '+' '+editData.sym});
                
            }

        }
        
        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        //await stramWriteFunc(pathFile_botList,botList);

    });
    router.get('/alertErrorBot',  (req, res) => {
        res.json(alertErrorBot);
    });
    router.post('/outPutData', (req, res) => {
        let sym=req.body.symBot;
        let selectedOutPutNewData=outPutData.filter(order => order.sym === sym);
        let selectedOutPutFilledData=outPutFilledData.filter(order => order.sym === sym);
        let outPutNFData={selectedOutPutNewData,selectedOutPutFilledData};
        // //console.log('outPutNFData=',outPutNFData);
        res.json(outPutNFData);
    });
    router.post('/postPriceBalance', async (req, res) => {
        try{
            let sym=req.body.symBot;
            let selectedbot=botList.find(bot => bot.sym === sym);
            let indexBot=botList.indexOf(selectedbot);
            let priceBlance={};
            priceBlance.price=botList[indexBot]['price'];
            priceBlance.quantity_increment=symInfo[sym].quantity_increment
            priceBlance.freeBalance=await balance_update_symR(indexBot,'symL');
            // console.log('priceBlance=',priceBlance);
            res.json(priceBlance);
        }catch(e){
            console.log('185:',e);
            console.log('186:botList=',botList)
        }
        
    });
    router.delete('/outPutData/:sym/:sellOrderId', async (req,res)=>{
        
        let orderData=outPutFilledData.find(order =>((order.sellOrderId === req.params.sellOrderId) && (order.sym === req.params.sym) ));
        // //console.log('orderData=',orderData);
        let oredrIndex=outPutFilledData.indexOf(orderData);
        outPutFilledData.splice(oredrIndex,1);
        
        let outPutNFData={outPutData,outPutFilledData}
        res.json(outPutNFData);
        
    });
    router.delete('/CancelOrder/:sym/:cancelOrderId',async (req,res) => {
        let sym=req.params.sym;
        let cancelOrderId=req.params.cancelOrderId;
        await cancel_order(cancelOrderId)
        res.json('kk');
    });
    router.put('/EditOrder',async (req,res) => {
        let editOrderData = {
            sym: req.body.editOrderData.sym,
            orderId: req.body.editOrderData.orderId,
            price:parseFloat(req.body.editOrderData.price),
            quantity: parseFloat(req.body.editOrderData.quantity),
            side: req.body.editOrderData.side,
            status:req.body.editOrderData.status,
        };
        console.log('415:editOrderData=',editOrderData)
       await editOrderFun(editOrderData)
        res.json('kk');
    });
    router.post('/orderBookPost',async (req,res) => {
        let sym = req.body.sym;
        let orderBookInfo=await orderBook(sym)
        console.log('916:sym=',orderBookInfo.data); 
        res.json(orderBookInfo.data);
    });
    router.post('/manualOrdering',async (req,res) => {
        let inputData = {
            sym: req.body.inputData.sym.toUpperCase(),
            price:parseFloat(req.body.inputData.price),
            quantity: parseFloat(req.body.inputData.quantity),
            side: req.body.inputData.side,
        };
        // inputData.quantity=parseFloat((inputData.quantity)/(inputData.price));
        // //console.log('inputData=',inputData);
        await manualOrdering(inputData); 
        let outPutManualData_botFilter=outPutManualData.filter(order=>((order.sym === inputData.sym) && (order.status === 'filled')) );
        if (outPutManualData_botFilter.length>2){
            //console.log('outPutManualData.length=',outPutManualData_botFilter.length)
            outPutManualData_botFilter.pop();
        }
        //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);
        // //console.log('outPutManualData2=',outPutManualData)
        res.json(outPutManualData);
    });
    router.get('/manualOrdering', async (req, res) => {
        // //console.log('outPutManualData3=',outPutManualData)
        res.send(outPutManualData);
    });
    router.post('/profitBots', async (req,res)=>{
        let profitTimeInfo={
            profitTime:req.body.profitTimeInfo.profitTime,
            DayHours:req.body.profitTimeInfo.DayHours,
        };
        profitBot(profitTimeInfo);
        //await stramWriteFunc(pathFile_botList,botList);
        //console.log('333:profitTime=',profitTimeInfo);
        res.json(botList);
    });
    router.post('/chartDepict',async (req,res) => {
        let inputData = req.body.inputData;
        inputData.nCandel=1000;
        // --------------------method1---------
        // let chrtInfo=await chartDepict_webSocket(inputData);
        // let ohlcv=chrtInfo.map(data =>{
        //     return [data.t+12600000, parseFloat(data.o),parseFloat(data.h),parseFloat(data.l),parseFloat(data.c),parseFloat(data.q)]
        // });
        // --------------------------method2--------------
        let chrtInfo=await chartDepict_url(inputData)
        let ohlcv=chrtInfo.map(data =>{
            return [Date.parse(data.timestamp)+12600000, parseFloat(data.open),parseFloat(data.max),parseFloat(data.min),parseFloat(data.close),parseFloat(data.volume_quote)]
        });
        ohlcv.sort();
        // ------------------------------------------------
        let resaultChart={
            sym: inputData.sym,
            intervalValue: inputData.intervalValue
        };
        console.log('139:inputData.nCandel=',inputData.nCandel);
        resaultChart.ohlcv=ohlcv;
        let found=chartData.some(resaultChart =>resaultChart.sym === inputData.sym);
        if(found){
            let foundResaultChart=chartData.find(resaultChart =>resaultChart.sym === inputData.sym);
            let index=chartData.indexOf(foundResaultChart);
            chartData.splice(index, 1, resaultChart);
        }else{
            chartData.push(resaultChart);   
        }
        // //await stramWriteFunc(pathFile_chartData,chartData);
        res.send(resaultChart);
    });
    router.get('/chartDepict/:sym',  (req, res) => {
        let sym = req.params.sym;
        let found=chartData.some(resaultChart =>resaultChart.sym === sym);
        if(found){
            resaultChart=chartData.find(resaultChart =>resaultChart.sym === sym);
            res.send(resaultChart);
        }else{
            res.send(found);
        }
    });
    router.post('/postCheckingOrders',async (req,res) => {
        console.log('189:postCheckingOrders')
        await request_trading('spot_subscribe',{},500,0);
    });
    router.post('/dailyBalancePost',async (req,res) => {
        let DayNumber = req.body.DayNumber;
        let mm=Daily_Balance_BTCUSDT[DayNumber-1];
        res.json(mm);
    });
    router.get('/BTCusdtPrice',  (req, res) => {
        // console.log('498:',BTCUSDT_SP)
        res.json(BTCUSDT_SP);
        // res.sendStatus(BTCUSDT_SP)
    });   

    // ---------------End of router-----------------------
    // ===================================
    // ===================================
    // ------Start of Functions-------------
    // // ***************************************
    // async function currencyList(req, res) {
    //     request({
    //         method: 'GET',
    //         url: 'https://api.hitbtc.com/api/3/public/symbol',
    //         // url: 'https://api.binance.com/api/v3/ticker/price',
    //         resolveWithFullResponse: true
    //     }).then((r1) => {
    //         // ab=res.send(JSON.parse(r1.body)) ;
    //         // //console.log(r1);
    //         res.send(JSON.parse(r1.body));
    //     }).catch((err) => {
    //         //console.log(err);
    //         alertErrorBot.unshift({id: uuid.v4(), msg: '3:'+err});
    //     });

    // };
    // **************************************
    // *************************************
    // **************************************
    // =============================
    function price_depended_funcs(sym,message){
        let selectedBot=botList.find(bot => bot.sym === sym);
        let indexBot=botList.indexOf(selectedBot);
        // console.log('158:indexBot='+indexBot);
        // //console.log('72:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
        if (botList[indexBot]['delete_buttom']==false) {
            // //console.log('Unprocessed response2', message)
            // console.log('START- min_check_candle_bolinger');
            let old_price=botList[indexBot]['price'];
            min_check_candle_bolinger(message,indexBot);
            // //console.log('9:indexBot='+indexBot);
            // //console.log('73:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
            console.log('485:'+sym+'='+botList[indexBot]['price']);
            if(botList[indexBot]['buy_follow_up'] == false){
                let found=outPutData.some(order => ((order.sym == sym) && (order.buyStatus == 'filled')));
                if(!found){
                    console.log('194:found=',found)
                    buy_follow_check(indexBot,old_price)
                }else{
                    console.log('195:found=',found)
                }
            }else{
                console.log('196:found=')
                buy_follow_check(indexBot,old_price)
            }
            sell_follow_checkUp(indexBot,old_price)
        } else if (botList[indexBot]['buy_order_is_done'] == false && (botList[indexBot]['delete_buttom']==true)) {
            // disconnect_net=false;
            // ws_public.close();
            console.log('72:'+botList[indexBot]['sym']+':delete_buttom=' + botList[indexBot]['delete_buttom']);
            request_public('unsubscribe', 'candles/'+ (selectedBot.tCC),{symbols:[sym],limit: (selectedBot.nCC+1)},sym,500);
        };
    }
    // =============================
    // =========chartDepict_url========
    async function chartDepict_url(inputData){
        let burl="https://api.hitbtc.com";
        let query="/api/3/public/candles/"+inputData.sym+"?period="+inputData.intervalValue+"&limit="+inputData.nCandel;
        let url=burl+query;
        return new Promise((resolve,reject)=>{
            axios.get(url)
            .then(res=>{
                resolve(res.data)
                
            })
            .catch((err)=>reject(err));
        })
    }
    // ************************************
    async function getSymProb(sym){
        return new Promise((resolve,reject)=>{
            axios.get('https://api.hitbtc.com/api/3/public/symbol/'+ sym)
            .then(res=>{
                
                resolve(res.data)
                
            })
            .catch((err)=>{
                alertErrorBot.unshift({id: uuid.v4(), msg: '4:Your sym is not valid'});
                // console.log('584:err=',err)
                // reject(err)}
            })
        })
    }
    // *************************************

    async function getPriceSym(sym) {
        try {
            let url = 'https://api.hitbtc.com/api/3/public/price/ticker/' + sym
            let response = await axios.get(url);
            return (response)
        } catch (error) {
            console.log('245:eror')
            console.error(error);
        }
    }
    // **************************************
    // *************************************

    async function orderBook(sym) {
        try {
            console.log('421:sym='+sym)
            let url = 'https://api.hitbtc.com/api/3/public/orderbook/'+sym+'?depth=5'
            let response = await axios.get(url);
            return (response)
        } catch (error) {
            console.log('235:eror')
            console.error(error);
        }
    }
    // **************************************
    async function addBalance(){
        return new Promise(async function(resolve,reject){
            let FreeBalance={};
            let LockedBalance={};
            let Equvalent_USDT={};
            let balance = await request_trading('spot_balances',{},500,0);
            // console.log('481:balance=',balance);
            balance.forEach(symInfo =>{
                let symb = symInfo.currency;
                if (symInfo.available != '0') {
                    FreeBalance[symb]= symInfo.available;
                }
                if (symInfo.reserved != '0') {
                    LockedBalance[symb] = symInfo.reserved;
                } else{
                    LockedBalance[symb] = '0';
                }
                Equvalent_USDT[symb]=parseFloat(symInfo.available)+parseFloat(symInfo.reserved)

            });
            balanceData.FreeBalance=FreeBalance
            balanceData.LockedBalance=LockedBalance;
            await available_USDT_Cumputing(Equvalent_USDT);
            
            resolve(balanceData)
        })

    }
    // // =========profitBot========
    function profitBot(profitTimeInfo) {
        let profit_bot= {};
        let IranDate = Date.now() +12600000;
        let numTime
        if(profitTimeInfo.DayHours === 'Day'){
            numTime=84600000*(parseInt(profitTimeInfo.profitTime));
        }else if(profitTimeInfo.DayHours === 'Hr'){
            numTime=3600000*(parseInt(profitTimeInfo.profitTime));
        }
        let startTime=IranDate-numTime;
        console.log('startTime=',startTime);
        botList.forEach(bot => {
            filled_orders_bot=outPutFilledData.filter(filled_order => filled_order.sym == bot.sym)
            profit_bot={
                sym:bot.sym,
                profitValue: 0,
                profitPercent:0,
            };
            console.log('462:filled_orders_bot=',filled_orders_bot);
            let sum_buyQuantityBase=0;
            filled_orders_bot.forEach(filled_order => {
                let orderTime=Date.parse(filled_order.sellTime);
                console.log('orderTime=',orderTime);
                console.log('462:filled_order=',filled_order);
                if( startTime<=orderTime){
                    profit_bot.profitValue+=parseFloat(filled_order.profitValue);
                    profit_bot.profitPercent+=(parseFloat(filled_order.profitPercent))*(parseFloat(filled_order.buyQuantityBase));
                    sum_buyQuantityBase+=parseFloat(filled_order.buyQuantityBase);
                    console.log('463:buyQuantityBase=',parseFloat(filled_order.buyQuantityBase));
                }
                
            });
            console.log('463:sum_buyQuantityBase=',parseFloat(sum_buyQuantityBase));
            if(profit_bot.profitValue === 0 ){
                profit_bot.profitPercent=0
            }else{
                profit_bot.profitPercent=(profit_bot.profitPercent)/(sum_buyQuantityBase)*(filled_orders_bot.length);
            }
            let indexBot=botList.indexOf(bot);
            botList[indexBot].profitValue=profit_bot.profitValue;
            botList[indexBot].profitPercent=profit_bot.profitPercent;
        });
    }
    // ===========================
    // **************************************
    // -------------------------------
    async function rebootFunction(){
        // return;
        let found_BtcUsdt_Bot=botList.some(bot => bot.sym == 'BTCUSDT');
        console.log('245:found_BtcUsdt_Bot=',found_BtcUsdt_Bot)
        if (found_BtcUsdt_Bot){
            await B1DownEs('BTCUSDT');
            for (const botInfo of botList){
                let indexBot=botList.indexOf(botInfo);
                // if((botList[indexBot]['sym'] != 'BTCUSDT') && (botList[indexBot]['delete_buttom'] == false)){
                //     await B1DownEs(botList[indexBot]['sym']);
                // }
                checking_filled_buy_order(botList[indexBot].sym,indexBot)
            }
        }else{
            createSocket_public('subscribe', 'candles/'+ ('M1'),{symbols: ['BTCUSDT'],limit: 1},'BTCUSDT',delayTime_public);
            for (const botInfo of botList){
                let indexBot=botList.indexOf(botInfo);
                // if(botList[indexBot]['delete_buttom'] ==false){
                //     await B1DownEs(botList[indexBot]['sym']);
                // }
                checking_filled_buy_order(botList[indexBot].sym,indexBot)
                // //console.log('botList['+indexBot+']["dead"]='+botList[indexBot]["dead"]);
            } 
        }
        

    };
    // --------------------------------------
    async function request_public_botList(subscriptions_botList){
        console.log('412:subscriptions_botList=',subscriptions_botList);
        for (const bot of botList) {
            if(bot.delete_buttom == false){
                let foundBot=subscriptions_botList.some(botNum => botNum == bot.sym);
                console.log('412:foundBot='+foundBot+':sym='+bot.sym)
                if(!foundBot){
                    console.log('413:foundBot='+foundBot+':sym='+bot.sym)
                    request_public('subscribe', 'candles/'+ (bot.tCC),{symbols: [bot.sym],limit: (bot.nCC+1)},bot.sym,500);
                    return;
                }
            }
        }

    }
    // -------------------------------------------------
    // *************************************
    // // // =========manualOrdering========
    // async function manualOrdering(inputData) {
    //     // =====================ws/trading============================
    //     return new Promise(function(resolve,reject){
    //         let socket = new WebSocket("wss://api.hitbtc.com/api/3/ws/trading");
    //         socket.onopen = socketDataSend2
    //         function socketDataSend2() {
    //             var SocketSessionAuthenticationData =
    //             {
    //                 "method": "login",
    //                 "params": {"type": "Basic","api_key": userKeys.key1,"secret_key": userKeys.key2}
    //             };
    //             var Subscribe_to_spot_new_order =
    //             {
    //                 "method": "spot_new_order",
    //                 "params": {
    //                     "client_order_id": generateRandom(),
    //                     "symbol": inputData.sym,
    //                     "side": inputData.side,
    //                     "type": "limit",
    //                     "quantity": inputData.quantity,
    //                     "price": inputData.price
    //                 },
    //                 "id": 123
    //             }
                
    //             socket.send(JSON.stringify(SocketSessionAuthenticationData));
    //             socket.send(JSON.stringify(Subscribe_to_spot_new_order));
    //         };
    //         socket.onmessage = async (event) => {
    //             let res = JSON.parse(event.data);
    //             try {
                    
    //                 //console.log('res=',res);
    //                 if(res.result !==true){
    //                     let newOrder={
    //                         orderId:res.result.client_order_id,
    //                         sym:inputData.sym,
    //                         time:new Date(Date.parse(res.result.updated_at) +12600000),
    //                         price:res.result.price,
    //                         quantityBase:res.result.quantity,
    //                         quantity:res.result.quantity, 
    //                         status:res.result.status,
    //                         exchangeId:res.result.id,
    //                         side:res.result.side,
    //                     };
    //                     resolve(newOrder)
    //                 }
    //             } catch (err) {
    //                 //console.log(err.code);
    //                 alertErrorBot.unshift({id: uuid.v4(), msg: 'Mnaual_Order_Eror: '+err.code+':'+' '+'syms='+inputData.sym });
                    
    //             if (res.error ==='undefined'){
    //                 return;
    //             }else if(res.error.code === 20001){
    //                 alertErrorBot.unshift({id: uuid.v4(), msg: 'Mnaual_Order_Eror code: '+res.error.code+':'+' '+'syms='+inputData.sym });
                    
    
    //             }
    //             ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
    //             }
                
    //         };
    //         socket.onclose = function (event) {
    //             if (event.wasClean) {
    //                 //console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    //             } else {
    //                 //console.log('[close] Connection died');
    //             }
    //         };
    //         socket.onerror = function (error) {
    //             //console.log(`[error] ${error.message}`);
    //         };
    //     })
    // }
    // // **************************************
    // // =========manualOrdering========
    async function manualOrdering(inputData) {
        let client_order_id_buy_sell=generateRandom();
        await request_trading('spot_new_order',{ client_order_id: client_order_id_buy_sell, symbol: inputData.sym, side: inputData.side, price: parseFloat(inputData.price), quantity: parseFloat(inputData.quantity) },500,200011);
    }
    // **************************************
    // *************************************
    // ========Start of Generat client_order_id Function==================
    function generateRandom() {
        let d = Date.now();
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    // **************************************
    // *************************************
    // ---------------------------
    async function available_USDT_Cumputing(Equvalent_USDT){
        if (Object.keys(balanceData.FreeBalance).length !== 0){
            let availableBL=0;
            let sym_price={};
            for (let symb in balanceData.FreeBalance ){
                // //console.log('symb=',symb);
                // //console.log('FreeBalance[symb]=',FreeBalance[symb]);
                // //console.log('LockedBalance[symb]=',LockedBalance[symb]);
                if (symb =='USDT'){
                    availableBL+=parseFloat(balanceData.FreeBalance[symb]);
                    // //console.log('availableBL1='+availableBL);
                }else{
                    
                    let symbUSDT=symb+'USDT'
                    // //console.log('symbUSDT=',symbUSDT)
                    let found=botList.some(bot => ((bot.sym == symbUSDT) &&  (bot.delete_buttom == false)));
                    if(found){
                        let selectedBot=botList.find(bot => bot.sym == symbUSDT);
                        let indexBot=botList.indexOf(selectedBot);
                        sym_price[symb]=parseFloat(botList[indexBot].price);
                        availableBL+=sym_price[symb]*parseFloat(balanceData.FreeBalance[symb]);
                    }else{
                        const response = await getPriceSym(symbUSDT);
                        // console.log('response=',response)
                        // //console.log('data1=',data)
                        let symPriceDate = response.data;
                        sym_price[symb]=parseFloat(symPriceDate.price);
                        // console.log('symPrice=',symPrice);
                        availableBL+=(sym_price[symb]*parseFloat(balanceData.FreeBalance[symb]));
                        // //console.log('availableBL2='+availableBL);
                    }
                    
                }
                
            }
            for (let symb in balanceData.LockedBalance ){
                // //console.log('symb=',symb);
                // //console.log('FreeBalance[symb]=',FreeBalance[symb]);
                // //console.log('LockedBalance[symb]=',LockedBalance[symb]);
                if (symb =='USDT'){
                    availableBL+=parseFloat(balanceData.LockedBalance[symb]);
                    // //console.log('availableBL1='+availableBL);
                }else{
                    let symbUSDT=symb+'USDT'
                    let found=botList.some(bot => ((bot.sym == symbUSDT) &&  (bot.delete_buttom == false)));
                    if(found){
                        // console.log('142:symbUSDT=',symbUSDT)
                        let selectedBot=botList.find(bot => bot.sym == symbUSDT);
                        let indexBot=botList.indexOf(selectedBot);
                        sym_price[symb]=parseFloat(botList[indexBot].price);
                        availableBL+=sym_price[symb]*parseFloat(balanceData.LockedBalance[symb]);
                    }else{
                        const response = await getPriceSym(symbUSDT);
                        // console.log('response=',response)
                        // //console.log('data1=',data)
                        let symPriceDate = response.data;
                        sym_price[symb]=parseFloat(symPriceDate.price);
                        // console.log('symPrice=',symPrice);
                        availableBL+=(sym_price[symb]*parseFloat(balanceData.LockedBalance[symb]));
                        // //console.log('availableBL2='+availableBL);
                    }
                }
                
            }
            // console.log('142:sym_price=',sym_price)
            for (let symb in sym_price){
                Equvalent_USDT[symb]=(sym_price[symb]*parseFloat(Equvalent_USDT[symb]))
            }
            balanceData.availableUSDT=parseFloat(availableBL.toFixed(4));
            balanceData.Equvalent_USDT=Equvalent_USDT;
            
            // fs.writeFileSync('./StorageData/balanceData.json', JSON.stringify(balanceData));
        }
        // //console.log('balanceData.availableUSDT='+balanceData.availableUSDT);
    }
    // ----------------------------
    // ************************************
    // ************************************
    // ==============cancelErrorHanding()===========
    async function cancelErrorHandling(cancelOrderId,sym){
        let found=outPutManualData.some(order => order.orderId===cancelOrderId)
        if (found){
            let foundNewOrder=outPutManualData.some(order => ((order.orderId===cancelOrderId) && ((order.status === 'new') || (order.status === 'partiallyFilled'))));
            if(foundNewOrder){
                let orderInfo=outPutManualData.find(order => ((order.orderId===cancelOrderId) && ((order.status === 'new') || (order.status === 'partiallyFilled'))));
                orderInfo.status='Lost Order'
                let index=outPutManualData.indexOf(orderInfo);
                outPutManualData.splice(index,1,orderInfo);
                //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);

            }else{
                let foundLostOrder=outPutManualData.some(order => ((order.orderId === cancelOrderId) && (order.status === 'Lost Order')));
                if(foundLostOrder){
                    let orderInfo=outPutManualData.find(order => ((order.orderId === cancelOrderId) && (order.status === 'Lost Order')));
                    let index=outPutManualData.indexOf(orderInfo);
                    outPutManualData.splice(index,1);
                    //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);

                }
            }
            
        }else{
            let foundBot=outPutData.some(bot => bot.sym === sym);
            if(foundBot){
                let selectedBot=botList.filter(bot => bot.sym === sym)[0];
                let indexBot_botList=botList.indexOf(selectedBot);
                let foundOrder= outPutData.some(order => (((((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.buyOrderId === cancelOrderId)) || (((order.sellStatus === 'new') ||  (order.sellStatus === 'suspended') || (order.sellStatus === 'partiallyFilled')) && (order.sellOrderId === cancelOrderId)))) && (order.sym === sym));
                //console.log('471:foundOrder=',foundOrder)
                if(foundOrder){
                    let OldOrder=outPutData.find(order => (((((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.buyOrderId === cancelOrderId)) || (((order.sellStatus === 'new') || (order.sellStatus === 'suspended') || (order.sellStatus === 'partiallyFilled')) && (order.sellOrderId === cancelOrderId)))) && (order.sym === sym));
                    let indexOrder=outPutData.indexOf(OldOrder);
                    if((OldOrder.buyStatus === 'new') || (OldOrder.buyStatus === 'partiallyFilled')){
                        OldOrder.buyStatus='Lost Order';
                    }else if((OldOrder.sellStatus === 'new') || (OldOrder.sellStatus === 'suspended') || (OldOrder.sellStatus === 'partiallyFilled')){
                        OldOrder.sellStatus='Lost Order';
                    }
                    //console.log('471:OldOrder=',OldOrder)
                    outPutData.splice(indexOrder, 1,OldOrder);
                }else{
                    let foundOrder= outPutData.some(order => ((((order.buyStatus === 'Lost Order') && (order.buyOrderId === cancelOrderId)) || ((order.sellStatus === 'Lost Order') && (order.sellOrderId === cancelOrderId)))) && (order.sym === sym));
                    //console.log('475:foundOrder=',foundOrder)
                    if(foundOrder){
                        let OldOrder=outPutData.find(order => ((((order.buyStatus === 'Lost Order') && (order.buyOrderId === cancelOrderId)) || ((order.sellStatus === 'Lost Order') && (order.sellOrderId === cancelOrderId)))) && (order.sym === sym));;
                        //console.log('476:OldOrder=',OldOrder);
                        //console.log('477:OldOrder.sellStatus=',OldOrder.sellStatus)
                        let newBuyFound=outPutData.some(order =>((order.buyStatus === 'new') && (order.sym === sym)));
                        console.log('458:newBuyFound=',newBuyFound);
                        if((OldOrder.buyStatus === 'Lost Order') && (newBuyFound == false)){
                            botList[indexBot_botList]['buy_order_is_done']=false;
                        }
                        if((OldOrder.sellStatus === 'Lost Order') && (botList[indexBot_botList]['filled_buy_order'])>0){
                            //console.log('478:OldOrder.sellStatus=',OldOrder.sellStatus)
                            let filled_buy_order=botList[indexBot_botList]['filled_buy_order']
                            filled_buy_order--;
                            console.log('736:filled_buy_order=',filled_buy_order);
                            botList[indexBot_botList]['filled_buy_order']=filled_buy_order;
                            
                        }
                        let indexOrder=outPutData.indexOf(OldOrder);
                        outPutData.splice(indexOrder, 1);
                        checking_filled_buy_order(botList[indexBot_botList].sym,indexBot_botList)
                        // console.log('678:outPutData=',outPutData)
                        // ---------------------------------------------------
                        if(botList[indexBot_botList]["stop_buttom"]===false && botList[indexBot_botList]["delete_buttom"]===false && newBuyFound === false){
                            botList[indexBot_botList]["edit_buttom"]=true;
                            //await stramWriteFunc(pathFile_botList,botList);
                            await B1DownEs(sym);
                        }else if(botList[indexBot_botList]["stop_buttom"]===true && botList[indexBot_botList]["filled_buy_order"]==0){
                            botList[indexBot_botList]["delete_buttom"]=true;
                            botList[indexBot_botList]["stop_buttom"]=false;
                            //await stramWriteFunc(pathFile_botList,botList);;
                        }
                        // ------------------------------------------------------
                        
                    }

                }
                
            }
        }
    };
    // *****************************************
    // *****************************************
    // --------------------------------------
    // ==============ereas newOutputDate of selected bot()===========
    function eraesed_outputDate(sym){
        let selectedBot=outPutData.filter(bot => bot.sym != sym);
        outPutData.splice(0, outPutData.length);
        outPutData.push(...selectedBot);
        // console.log('679:outPutData=',outPutData)
        

    }
    // ***********************************************
    // ==============ereas newOutputFilledDate of selected Filled bot()===========
    function eraesed_newOutputFilledDate(sym){
        let selectedFilledBot=outPutFilledData.filter(bot => bot.sym != sym);
        outPutFilledData.splice(0, outPutFilledData.length);
        outPutFilledData.push(...selectedFilledBot);

        

    }
    // *****************************************
    
    // ****************************************
    // ==============ereas botList of selected bot===========
    function eraesed_botList(sym){
        let erasedBot=botList.find(bot => bot.sym === sym);
        let index=botList.indexOf(erasedBot);
        alertErrorBot.unshift({id: uuid.v4(), msg: 'earesed sym='+' '+sym});
        botList.splice(index,1);
        
    }
    // *************************************
    // *****************************************
    // --------------------------------------
    // ==============ereas chartData of selected bot()===========
    function eraesed_chartData(sym){
        let selectedBot=chartData.find(bot => bot.sym === sym);
        let botIndex=chartData.indexOf(selectedBot);
        chartData.splice(botIndex, 1);
        fs.writeFileSync('./StorageData/chartData.json', JSON.stringify(chartData));
    }
    // ***********************************************
    // ***************************************
    // =============start editOrderFun===========
    async function editOrderFun(editOrderData){
        // console.log('556:editOrderData=',editOrderData);
        let botInfo=botList.find(bot => bot.sym === editOrderData.sym);
        let indexBot= botList.indexOf(botInfo);
        let sym=botList[indexBot]['sym'];
        if(editOrderData.side === 'sell'){
            let symQuantity=editOrderData.quantity
            let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
            if(roundQuantity>0){
                symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
                let foundOrder=outPutData.some(order => ((order.sellOrderId === editOrderData.orderId)));
                if (foundOrder){
                    if(editOrderData.status === 'new'){
                        await ReplaceSellOrder(editOrderData.orderId, editOrderData.price, editOrderData.quantity,indexBot);
                    }else if(editOrderData.status === 'suspended'){
                        
                        if(botList[indexBot]['Temporary_SSFU']<botList[indexBot].SSFU0){
                            botList[indexBot]['Temporary_SSFU']=botList[indexBot].SSFU0;
                        }
                        let stopPrice =editOrderData.price;
                        let IranDate = new Date(Date.now()+12600000);
                        alertErrorBot.unshift({id: uuid.v4(), msg: +IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +':'+botList[indexBot]['sym']+':market-sell follow up:: start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')'});
                        console.log('413:'+botList[indexBot]['sym']+':market-sell follow up:'+'start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')');
                        // console.log("441:old_sellOrder_Id",new_sell_order_data_info.sellOrderId); 
                        // console.log("437:new_sell_price",new_sell_price);
                        botList[indexBot].suspend_inner_cancel_status='edit_status';
                        await cancel_order(editOrderData.orderId) 
                        console.log("719:cancel_order finished");
                        ReplaceSellOrder_Stop(editOrderData.orderId,editOrderData.price,editOrderData.quantity,indexBot);
                        console.log("445:suspend_inner_cancel_status=",botList[indexBot].suspend_inner_cancel_status);
                    }
                }else{
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(03:'+sym+':+The selected order ('+editOrderData.orderId+') can not be found from outPutData)'}); 
                }
            }else{
                alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(03:'+sym+':+Your input quantity is lower than minimum quantity)'}); 
            }
        }else if(editOrderData.side === 'buy'){
            let symQuantity=editOrderData.quantity
            let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
            if(roundQuantity>0){
                symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
                console.log('411:BuyOrder input Quantity=',symQuantity);
                let BSprice=editOrderData.price
                let diff_buy_spot = botList[indexBot]['price'] - BSprice;
                
                //console.log('diff_buy_spot=',diff_buy_spot)
                if (diff_buy_spot<=0){
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(01:Your first price is higher than Spot Price of)'+' '+ sym+'(we put the buy order price 0.1% lower than spot price)'}); 
                }else{
                    botList[indexBot]['diff_buy_spot']=diff_buy_spot;
                    let foundBot=outPutData.some(bot => ((bot.sym === sym) && (bot.buyStatus=='new')));
                    console.log('512:',foundBot)
                    if (foundBot){
                        if(botList[indexBot]['softBuy'] === false){
                            botList[indexBot]['softBuy']=true
                        }
                        await ReplaceBuyOrder(editOrderData.orderId, BSprice, symQuantity,indexBot)
                    }else{
                        alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(02:'+sym+':+The selected order ('+editOrderData.orderId+') can not be found from outPutData)'}); 
                    }
                } 
                
            }else{
                alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(03:'+sym+':+Your input quantity is lower than minimum quantity)'}); 
            }
        }
    }
    // =============end of editOrderFun==============
    // *****************************************
    // **********************************
    // =============start of length_array_restriction ============
    function length_array_restriction(){
        if (alertErrorBot.length>20){
            alertErrorBot.splice(20);
        }
        if (spot_cancel_order_client_order_id.length>5){
            spot_cancel_order_client_order_id.splice(5);
        };
        
    }
    // =============end oflength_array_restriction =============
    // =============start of balance_BTCUSDT_DayNumber ============
    function balance_BTCUSDT_DayNumber(){

        let now= Date.now();
        console.log(now)
        let time=new Date();
        console.log('275:time=',time);
        let time0=new Date(time.getFullYear(time),time.getMonth(time),time.getDate(time)+1,0);
        // let time0=new Date(time.getFullYear(time),time.getMonth(time),time.getDate(time),time.getHours(time),time.getMinutes(time)+2,0);
        console.log('123:time0=',time0)
        let diff=Date.parse(time0)-now;
        let h=Math.floor(diff/3600000);
        let minute=Math.floor((diff%3600000)/60000);
        console.log(new Date(diff));
        console.log('850:h=',h);
        console.log('851:m=',minute);
        let sec=Math.floor(((diff%3600000)%60000)/1000);
        console.log('852:sec=',sec);
        setTimeout(async function(){balance_BTCUSDT_Check()},diff);
    }
    
    
    // =============end of balance_BTCUSDT_DayNumber =============
    // =============start of balance_BTCUSDT_Check ============
    async function balance_BTCUSDT_Check(){
        await addBalance();
        let localTime=CountryTime("Iran")
        let obj={};
        obj.date=localTime;
        obj.Daily_Balance=parseFloat(balanceData.availableUSDT);
        obj.Daily_BTCUSDT=BTCUSDT_SP;
        if (Daily_Balance_BTCUSDT.length<32){
            Daily_Balance_BTCUSDT.unshift(obj);
        }else{
            Daily_Balance_BTCUSDT.pop();
            Daily_Balance_BTCUSDT.unshift(obj);
        }
        console.log('146:Daily_Balance_BTCUSDT=',Daily_Balance_BTCUSDT)
        setTimeout(async function(){balance_BTCUSDT_Check()},24*3600*1000);
        // setTimeout(async function(){balance_BTCUSDT_Check()},60*1000);
    }
    // =============end of balance_BTCUSDT_Check =============
    

    // =============start of CountryTime ============
    function CountryTime(country) {
        const countryToTimezone = {
            "Iran": "Asia/Tehran",
            "United States": "America/New_York",
            "Germany": "Europe/Berlin",
            "India": "Asia/Kolkata",
            "Japan": "Asia/Tokyo",
            "Australia": "Australia/Sydney",
            "Canada": "America/Toronto",
            "Brazil": "America/Sao_Paulo"
        };

        const tz = countryToTimezone[country];

        if (!tz) {
            console.log(`منطقه زمانی برای کشور "${country}" پیدا نشد.`);
            return;
        }

        return dayjs().tz(tz).format('YYYY-MM-DD HH:mm:ss');
    }
    // =============end of CountryTime =============

    // ====================B1DownEs()==============
    async function B1DownEs(sym) {
        // ++++++++++++++++++++++++++++++++++++++
        console.log('453:sym=',sym)
        let selectedBot=botList.filter(bot => bot.sym === sym)[0];
        // console.log('454:selectedBot=',selectedBot)
        let indexBot=botList.indexOf(selectedBot);
        let new_buy_order_info={};
        let new_all_sell_orders_info=new Array();
        new_buy_order_info.buyOrderId='NoId';
        let foundBuyOrder= outPutData.some(order => ((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.sym === selectedBot.sym));
        if (foundBuyOrder){
            new_buy_order_info= outPutData.find(order => ((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.sym === selectedBot.sym));
        }
        let foundSellOrder= outPutData.some(order => (order.sellStatus === 'new') && (order.sym === selectedBot.sym));
        //console.log('foundSellOrder=',foundSellOrder)
        if (foundSellOrder){
            new_all_sell_orders_info= outPutData.filter(order => (order.sellStatus === 'new') && (order.sym === selectedBot.sym));
            // console.log('new_all_sell_orders_info=',new_all_sell_orders_info)
        }
        // =====================BOLINGER PARAMETRES=========
        let BOLU
        let BOLD
        let m_BOL = 2;
        let squarData = new Array();
        // ==========================================
        
        // -------------------------------------------------------------
        if((botList[indexBot]['add_buttom']==true) || (botList[indexBot].dead==true)){
            if(selectedBot.sym == 'BTCUSDT'){
                if(selectedBot.nCC>0){
                    request_public('subscribe', 'candles/'+ (selectedBot.tCC),{symbols: [selectedBot.sym],limit: (selectedBot.nCC+1)},selectedBot.sym,500);
                }
            }else{
                request_public('subscribe', 'candles/'+ (selectedBot.tCC),{symbols: [selectedBot.sym],limit: (selectedBot.nCC+1)},selectedBot.sym,500);
            }
            if(botList[indexBot].dead){
                botList[indexBot].dead=false;
                // console.log('200:nCandle_change=',botList[indexBot]['nCandle_change'])
            };
            if(botList[indexBot]['nCandle_change']){
                botList[indexBot]['nCandle_change']=false;
                // console.log('200:nCandle_change=',botList[indexBot]['nCandle_change'])
            };

        }else if (((botList[indexBot]['edit_buttom']==true ) && (botList[indexBot]['nCandle_change']==true))){
            // console.log('195:dead_buttom:',botList[indexBot]['dead']);
            // console.log('197:edit_buttom:',botList[indexBot]['edit_buttom']);
            // console.log('197:edit_buttom:',botList[indexBot]['edit_buttom']);
            // console.log('198:nCandle_change:',botList[indexBot]['nCandle_change']);
            request_public('subscribe', 'candles/'+ (selectedBot.tCC),{symbols: [selectedBot.sym],limit: (selectedBot.nCC+1)},selectedBot.sym,500);
            // console.log('199:nCandle_change=',botList[indexBot]['nCandle_change'])
            if(botList[indexBot]['nCandle_change']){
                botList[indexBot]['nCandle_change']=false;
                // console.log('200:nCandle_change=',botList[indexBot]['nCandle_change'])
            };
        }else if ((botList[indexBot]['delete_buttom'])){
            if((selectedBot.sym == 'BTCUSDT') && (selectedBot.nCC>0)){
                request_public('subscribe', 'candles/' + (selectedBot.tCC), { symbols: [selectedBot.sym], limit: 1},selectedBot.sym,500);

            }else if(selectedBot.sym != 'BTCUSDT'){
                request_public('unsubscribe', 'candles/' + (selectedBot.tCC), { symbols: [selectedBot.sym], limit: (selectedBot.nCC+1)},selectedBot.sym,500);
            }
        }
        // -------------------------------------------------
        try {
            if(botList[indexBot]['add_buttom']==true){
                if ((botList[indexBot]['filled_buy_order']) <= botList[indexBot]['MO']) {
                    if (botList[indexBot]['buy_order_is_done']==false) {
                        await douwn_percent_order_buy(indexBot);
                        botList[indexBot]['add_buttom']=false;
                        //await stramWriteFunc(pathFile_botList,botList);;
                    }
                };
            }else if (botList[indexBot]['edit_buttom'] == true) {
                // console.log('815:',botList[indexBot]['edit_buttom'])
                if (botList[indexBot]['buy_order_is_done'] == false && botList[indexBot]['filled_buy_order']< botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false) {
                    await douwn_percent_order_buy(indexBot);
                };
                if (botList[indexBot]['buy_order_is_done'] == true && botList[indexBot]['filled_buy_order']>= botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false ){
                    //console.log('77:new_buy_order_info.buyOrderId=',new_buy_order_info.buyOrderId);
                    if (new_buy_order_info.buyOrderId !='NoId') await cancel_order(new_buy_order_info.buyOrderId);    
                }
                // await request_trading('spot_subscribe');
                
                botList[indexBot]['edit_buttom'] = false;
                //await stramWriteFunc(pathFile_botList,botList);;
                // //console.log('41:botList[indexBot]["edit_buttom"] = '+botList[indexBot]['edit_buttom']);
            } else if (botList[indexBot]['stop_buttom'] == true) {
                if (new_buy_order_info.buyOrderId !='NoId') {
                    await cancel_order(new_buy_order_info.buyOrderId);
                    // await request_trading('spot_subscribe');
                }
            }else if (botList[indexBot]['delete_buttom']){
                // console.log('812:',botList[indexBot]['delete_buttom'])
                // console.log('813:',new_buy_order_info.buyOrderId)
                if (new_buy_order_info.buyOrderId !='NoId') {
                    await cancel_order(new_buy_order_info.buyOrderId);
                    botList[indexBot]['buy_order_is_done'] = false;
                    //await stramWriteFunc(pathFile_botList,botList);;
                }
                new_all_sell_orders_info.forEach(sell_Order_info =>{
                    cancel_order(sell_Order_info.sellOrderId);
                })
                let sym=botList[indexBot]['sym'];
                eraesed_outputDate(sym);
                botList[indexBot]['filled_buy_order']=0;
                botList[indexBot]['quantity_low']=false;
                botList[indexBot]['buy_order_is_done']=false;
                // await request_trading('spot_subscribe');
                

            }
        } catch (e) {
            //console.log(e);
            alertErrorBot.unshift({id: uuid.v4(), msg: '542:SocketClient_trading erorr:'+e});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        }
    }
    // **********************************
    // =======================End of BOT=====================
        // ---------------------------
    //  ****************************************************************
    // =========================start of trading Functions==============
    // ---------------------------------------------------------
    // =====BuyOrder Function=============================
    async function BuyOrder(BSprice, symQuantity,indexBot_trading,errCode) {
        console.log('464:errCode=',errCode);
        let sym=botList[indexBot_trading]['sym']
        // console.log('41:'+sym+':BuyOrder input Price=',BSprice);
        let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
        console.log('414:symQuantity=',symQuantity);
        // //console.log('415:quantity_increment=',symInfo[sym].quantity_increment);
        console.log('22:roundQuantity='+roundQuantity);
        if(roundQuantity == 0){
            return alertErrorBot.unshift({id: uuid.v4(), msg: '2011: Your input quantity is lower than minQuantity. Please input your quantity bigger than minQuantity.'});
        }
        symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
        // console.log('41:'+sym+':BuyOrder input Quantity=',symQuantity);

        let diff_buy_spot = botList[indexBot_trading]['price'] - BSprice;
        if (diff_buy_spot<=0){
            botList[indexBot_trading]['price']=0.9*botList[indexBot_trading]['price'];
            //await stramWriteFunc(pathFile_botList,botList);;
            BSprice=botList[indexBot_trading]['price'];
            diff_buy_spot = botList[indexBot_trading]['price'] - BSprice;
            //console.log('NewBSprice=',BSprice)
            alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(01:Your first price is higher than Spot Price of)'+' '+ sym+'(we put the buy order price 0.1% lower than spot price)'}); 
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            
        }
        let client_order_id_buy_sell = generateRandom();
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(0, 4), 'buy', client_order_id_buy_sell)
        console.log('142:client_order_id_buy_sell=',client_order_id_buy_sell.length);
        console.log('143:client_order_id_buy_sell=',client_order_id_buy_sell);
        try {
            corres_order_info[indexBot_trading]='19:'+sym+'new buy:'+client_order_id_buy_sell;
            //console.log('174:corres_order_info[indexBot_trading]='+corres_order_info[indexBot_trading]);
            // botList[indexBot_trading]['corres_order_info']=corres_order_info;
            //   ---------------------------------------------------
            
            // -----------------------------------
            // console.log('42:'+sym+'client_order_id_buy='+client_order_id_buy_sell);
            botList[indexBot_trading]['buy_order_is_done'] = true; 
            botList[indexBot_trading]['diff_buy_spot']=diff_buy_spot;
            //await stramWriteFunc(pathFile_botList,botList);
            // console.log('515:symQuantity=',symQuantity);
            // await request_trading('spot_new_order', { client_order_id: client_order_id_buy_sell, symbol: sym, side: 'buy', price: BSprice, quantity: symQuantity });
            await request_trading('spot_new_order',{ client_order_id: client_order_id_buy_sell, symbol: sym, side: 'buy', price: parseFloat(BSprice), quantity: parseFloat(symQuantity) },500,errCode);
            if(errCode == 0){
                setTimeout(function () { 
                    console.log('912:buyOrder check: '+sym)
                    if((botList[indexBot_trading].filled_buy_order < botList[indexBot_trading].MO) && (botList[indexBot_trading].stop_buttom == false)){
                        let foundBotId=outPutData.some(order => ((order.sym === botList[indexBot_trading]['sym']) && (order.buyStatus==='new' || order.buyStatus==='partiallyFilled')));
                        if(!foundBotId){
                            if(botList[indexBot_trading].quantity_low == false){
                                alertErrorBot.unshift({id: uuid.v4(), msg: 'buyOrder Eror code: '+20001+' '+' '+sym});
                                console.log('913:buyOrder Eror code: '+20001+' '+' '+sym)
                                eror20001Handling(20001,BSprice,sym,client_order_id_buy_sell,symQuantity,errCode)
                            }else{
                                console.log('914:quantity_low: '+botList[indexBot_trading].quantity_low+' '+' '+sym);
                                
                            }
                        }
                    }
                    
                    
                }, 5000);

            }
        } 
        catch (err) {
            botList[indexBot_trading]['buy_order_is_done'] = false;
            //await stramWriteFunc(pathFile_botList,botList);;
            console.log('6:',err);
            //console.log(err.code);
            alertErrorBot.unshift({id: uuid.v4(), msg: 'buyOrder Eror code: '+err.code+' '+' '+sym});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            if (err.code == 20001 || err.code == 2011 || err.code == 2010){
                // await eror20001Handling(err.code,BSprice,sym,client_order_id_buy_sell,roundQuantity,errCode)
            }
            if (err.code == '2020'){
                //console.log('176:botList['+indexBot_trading+']=',botList[indexBot_trading]);
                return;
            }
            if (err.code == '20002'){
                //console.log('45:indexBot_trading='+indexBot_trading);
                //console.log('46:client_order_id_buy_sell='+client_order_id_buy_sell);

            }
        }
    }
    // ====================End of BuyOrder Function=======
    // ---------------------------------------------------------
    // =====SellOrder Function=============================
    async function SellOrder(BSprice, symQuantity,indexBot_trading) {
        try {
            let sym=botList[indexBot_trading]['sym']

            let client_order_id_buy_sell = generateRandom();
            client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(0, 5), 'sell', client_order_id_buy_sell)
           
            // //console.log('client_order_id_buy_sell=' + client_order_id_buy_sell);
            // -------------------------------------
            let foundBotId=outPutData.some(order => order.sym === botList[indexBot_trading]['sym'] && order.buyStatus==='filled' && order.sellStatus==='');
            if (foundBotId){
                let foundBotId=outPutData.find(order => order.sym === botList[indexBot_trading]['sym'] && order.buyStatus==='filled' && order.sellStatus==='');
                let indexOrder=outPutData.indexOf(foundBotId);
                let buyClient='buy'+foundBotId.buyOrderId.substring(foundBotId.buyOrderId.length-12);
                console.log('165:foundBotId.buyOrderId=',foundBotId.buyOrderId);
                console.log('166:buyClient=',buyClient)
                client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(client_order_id_buy_sell.length-15),buyClient, client_order_id_buy_sell)
                console.log('171:client_order_id_buy_sell=',client_order_id_buy_sell);
                console.log('172:client_order_id_buy_sell.length=',client_order_id_buy_sell.length)
                corres_order_info[indexBot_trading]='20:'+sym+'new sell:'+'old buy id:'+foundBotId.buyOrderId
                // botList[indexBot_trading]['corres_order_info']=corres_order_info;
                // //console.log('foundBotId0=',foundBotId)
                if((BSprice<outPutData[indexOrder]["buyPrice"]) && outPutData[indexOrder]["softBuy"]== true){
                    BSprice=1.01*outPutData[indexOrder]["buyPrice"];
                    console.log('412:alarm:significant drop in price of'+ botList[indexBot_trading]["sym"]+' for id:'+outPutData[indexOrder]["buyOrderId"]+'has been occured')
                    alertErrorBot.unshift({id: uuid.v4(), msg: 'alarm:significant drop in price of'+ botList[indexBot_trading]["sym"]+' for id:'+outPutData[indexOrder]["buyOrderId"]+'has been occured'});
                    outPutData[indexOrder]["softBuy"]=false;
                }
            }else{
                corres_order_info[indexBot_trading]='21:'+sym+'new sell:'+'old buy id:'+'con not found';
                // botList[indexBot_trading]['corres_order_info']=corres_order_info;
                alertErrorBot.unshift({id: uuid.v4(), msg:'can not found BotId of sell order'}); 
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            }
            // -----------------------------------
            // correspondingBuySellOrderId.add(client_order_id_buy_sell);
            request_trading('spot_new_order', { client_order_id: client_order_id_buy_sell, symbol: sym, side: 'sell', price: parseFloat(BSprice), quantity: parseFloat(symQuantity) },500);
            console.log('268:sym=',sym);
        } catch (err) {
            //console.log("SellOrder Eror");
            //console.log('7:',err);
            alertErrorBot.unshift({id: uuid.v4(), msg: 'SellOrder Eror code: '+err.code+' '+': '+botList[indexBot_trading]['sym']});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            if(err.code == '20001'){
                // console.log('680:outPutData=',outPutData)                  
                
                let Free_fund=await balance_update_symR(indexBot_trading,'symL');
                console.log('618:Free_fund=',Free_fund)
                if (parseFloat(Free_fund)<1){  
                    return
                }else{
                    await SellOrder(BSprice,Free_fund,indexBot_trading);
                }
            }
            if (err.code == '20002'){
                //console.log('45:indexBot_trading='+indexBot_trading);
                //console.log('46:client_order_id_buy_sell='+client_order_id_buy_sell);

            }
        } 
    }
    // ====================End of SellOrder Function=======
    // ---------------------------------------------------------
    // =====ReplaceSellOrder Function=============================
    async function ReplaceBuyOrder(old_claient_order_id, BSprice, symQuantity,indexBot) {
        let sym=botList[indexBot]['sym'];
        let client_order_id_buy_sell = generateRandom();
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(0, 5), 'rBuy', client_order_id_buy_sell);
        //console.log('22:client_order_id_buy_sell='+client_order_id_buy_sell)
        let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
        // --------------------
        try{ 
            corres_order_info[indexBot]='21:'+sym+'Replace buy:'+'old buy id:'+old_claient_order_id;
            // botList[indexBot]['corres_order_info']=corres_order_info;
            //console.log( '73:old_claient_order_id=', old_claient_order_id);
            //console.log('28:old_claient_order_id='+old_claient_order_id);
            if (botList[indexBot]['softBuy']){
                let diff_buy_spot=botList[indexBot]['price'] - BSprice;
                botList[indexBot]['diff_buy_spot']=diff_buy_spot;
            }
            await request_trading('spot_replace_order', { client_order_id: old_claient_order_id, new_client_order_id: client_order_id_buy_sell, price: parseFloat(BSprice), quantity: parseFloat(symQuantity) },500,0);
            setTimeout(function () { 
                console.log('915:replace buyOrder check: '+sym)
                if((botList[indexBot].filled_buy_order < botList[indexBot].MO) && (botList[indexBot].stop_buttom == false)  && (botList[indexBot].quantity_low == false)){
                    let foundBotId=outPutData.some(order => ((order.sym === botList[indexBot]['sym']) && (order.buyStatus==='new' || order.buyStatus==='partiallyFilled')));
                    // console.log('900:foundBotId: '+foundBotId)
                    if(foundBotId){
                        let old_order_data=outPutData.find(order => ((order.sym === botList[indexBot]['sym']) && (order.buyStatus==='new' || order.buyStatus==='partiallyFilled')));
                        let index_old_order_data=outPutData.indexOf(old_order_data);
                        // console.log('902:old_claient_order_id=',old_claient_order_id);
                        // console.log('903:old_order_data.buyOrderId=',old_order_data.buyOrderId)
                        if(old_order_data.buyOrderId == old_claient_order_id){
                            alertErrorBot.unshift({id: uuid.v4(), msg: '916:buyOrder Eror code: '+20001+' '+' '+sym});
                            console.log('916:replace buyOrder Eror code: '+20001+' '+' '+sym);
                            outPutData.splice(index_old_order_data, 1);
                            eror20001Handling(20001,BSprice,sym,client_order_id_buy_sell,symQuantity,0)
                        }
                        
                    }else{
                        alertErrorBot.unshift({id: uuid.v4(), msg: '917:buyOrder Eror code: '+20001+' '+' '+sym});
                        console.log('917:replace buyOrder Eror code: '+20001+' '+' '+sym)
                        eror20001Handling(20001,BSprice,sym,client_order_id_buy_sell,symQuantity,0)
                    }
                }
                
                
            }, 10000);
            // let info=await request_trading('spot_replace_order', { client_order_id: old_claient_order_id, new_client_order_id: client_order_id_buy_sell, price: parseFloat(BSprice), quantity: parseFloat(symQuantity) },500,0);
            // let ReplaceBuyOrderInfo=info.params
            // console.log('76:ReplaceBuyOrderInfo=',ReplaceBuyOrderInfo);
            // if (ReplaceBuyOrderInfo.report_type=='canceled'){
            //     console.log('77:ReplaceBuyOrderInfo=',ReplaceBuyOrderInfo);
            //     let Free_fund=await balance_update_symR(indexBot,'symR');
            //     let new_buyQuantity=Free_fund/(BSprice);
            //     let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
            //     //console.log('25: Replace Buy order-new_roundQuantity='+new_roundQuantity);
            //     let new_symQuantity=(roundQuantity-1)*(symInfo[sym].quantity_increment)
            //     //console.log('16:'+sym+':FirstQuantity='+botList[indexBot]['quantity'])
            //     //console.log('17:(in Replace Buy order) '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
            //     let symR=symRL_Func(indexBot,'symR');
            //     alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20001:Insufficient funds in Replace Buy order)'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund}); 
            //     ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            //     //console.log('88:old_claient_order_id=' + old_claient_order_id);
            //     // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
            //     neededQuantity=null;
            //     await BuyOrder(BSprice, new_symQuantity,indexBot,20001)
            //     // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
            // }

        }catch (err){
            console.log('817:',err);
            //console.log("ReplaceBuyOrder Eror");
            //console.log('old_claient_order_id=' + old_claient_order_id);
            //console.log('BSprice=' + BSprice);
            //console.log('symQuantity=' + symQuantity);
            alertErrorBot.unshift({id: uuid.v4(), msg: 'Replace buy Eror code: '+err.code+' '+' '+sym+'  '+'old_claient_order_id='+old_claient_order_id});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            // if (err.code == 20001 || err.code == 2010 || err.code == 2011 ){
            //     //console.log('59:client_order_id_buy_sell='+client_order_id_buy_sell);
            //    
            //     // -------------------
            //     let Free_fund=await balance_update_symR(indexBot,'symR');
            //     let new_buyQuantity=Free_fund/(BSprice);
            //     let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
            //     //console.log('24: Replace Buy order-new_roundQuantity='+new_roundQuantity);
            //     let new_symQuantity=(new_roundQuantity)*(symInfo[sym].quantity_increment)
            //     if (new_roundQuantity<2){
            //         let sym=botList[indexBot]['sym']
            //         await checking_funds(sym);
            //         return;
            //     }else{
            //         if (new_roundQuantity>=roundQuantity){
            //             new_symQuantity=(roundQuantity-1)*(symInfo[sym].quantity_increment)
            //         }
            //         //console.log('14:'+sym+':FirstQuantity='+botList[indexBot]['quantity'])
            //         //console.log('15:(in Replace Buy order) '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
            //         let symR=symRL_Func(indexBot,'symR')
            //         alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20001:Insufficient funds in Replace Buy order)'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund}); 
            //         ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            //         //console.log('84:old_claient_order_id=' + old_claient_order_id);
            //         // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
            //         await BuyOrder(BSprice, new_symQuantity,indexBot,20001)
            //         // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
            //     }
            //     return
            // }else if(err.code != 2011) {
            //     // ------------------
            //     // corre_client(old_claient_order_id,corressOldId,client_order_id_buy_sell);
            //     // -------------------
            // }

        }
    }
    // ====================End of ReplaceSellOrder Function=======
    // ---------------------------------------------------------
    // =====ReplaceSellOrder Function=============================
    async function ReplaceSellOrder(old_claient_order_id_sell, BSprice, symQuantity,indexBot_trading) {
        let sym=botList[indexBot_trading]['sym'];
        let client_order_id_buy_sell = generateRandom();
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(0, 6), 'rSell', client_order_id_buy_sell);
        let buyClient='buy'+old_claient_order_id_sell.substring(old_claient_order_id_sell.length-12);
        // console.log('173:old_claient_order_id_sell=',old_claient_order_id_sell);
        // console.log('174:buyClient=',buyClient)
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(client_order_id_buy_sell.length-15),buyClient, client_order_id_buy_sell)
        // console.log('175:client_order_id_buy_sell=',client_order_id_buy_sell);
        // console.log('176:client_order_id_buy_sell.length=',client_order_id_buy_sell.length)
        try {
            let orderInfo=outPutData.filter(order => order.sellOrderId === old_claient_order_id_sell)[0];
            if (orderInfo.sellStatus !='filled'){
                corres_order_info[indexBot_trading]='22:'+sym+'Replace sell:'+'old sell id:'+old_claient_order_id_sell;
                
                // -----------------------------------
                // //console.log('client_order_id_buy_sell=' + client_order_id_buy_sell);
                
                await request_trading('spot_replace_order', { client_order_id: old_claient_order_id_sell, new_client_order_id: client_order_id_buy_sell, price: parseFloat(BSprice), quantity: parseFloat(symQuantity) },500,0);
                //console.log('79:ReplaceSellOrderInfo=',ReplaceSellOrderInfo);
                // if (ReplaceSellOrderInfo.report_type=='canceled'){
                //     //console.log('80:ReplaceSellOrderInfo=',ReplaceSellOrderInfo.report_type);
                //     await SellOrder(BSprice, symQuantity,indexBot_trading)
                // }

            }else{
                console.log('226:Replace sell order is not done:sellStatus is' + '' + orderInfo.sellStatus);

            }
            
        } catch (err) {
            console.log("9:ReplaceSellOrder Eror:",err);
            alertErrorBot.unshift({id: uuid.v4(), msg: 'Replace sell Eror code: '+err.code+' '+' '+sym+'  '+'  '+'old_claient_order_id_sell='+old_claient_order_id_sell});
        }
    }
    // ====================End of ReplaceSellOrder Function=======
    // ---------------------------------------------------------
    // =====ReplaceSellOrder_Stop Function=============================
    async function ReplaceSellOrder_Stop(old_claient_order_id_sell,stopPrice, symQuantity,indexBot_trading) {
        
        console.log('301:ReplaceSellOrder_Stop start:');
        let sym=botList[indexBot_trading]['sym'];
        let client_order_id_buy_sell = generateRandom();
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(0, 7), 'SrSell', client_order_id_buy_sell);
        let buyClient='buy'+old_claient_order_id_sell.substring(old_claient_order_id_sell.length-12);
        console.log('177:old_claient_order_id_sell=',old_claient_order_id_sell);
        console.log('178:buyClient=',buyClient)
        client_order_id_buy_sell=replaceString(client_order_id_buy_sell.substring(client_order_id_buy_sell.length-15),buyClient, client_order_id_buy_sell)
        console.log('179:client_order_id_buy_sell=',client_order_id_buy_sell);
        console.log('180:client_order_id_buy_sell.length=',client_order_id_buy_sell.length)
        
        corres_order_info[indexBot_trading]='22:'+sym+'Replace sell:'+'old sell id:'+old_claient_order_id_sell;
        // -----------------------------------
        
        // console.log('442:BSprice=' + BSprice);
        console.log('442:stopPrice=' + stopPrice);
        request_trading('spot_new_order', { client_order_id: client_order_id_buy_sell, symbol: sym, side: 'sell',type: "stopMarket", quantity: symQuantity,stop_price:stopPrice},500,0);
    }
    // ====================End of ReplaceSellOrder_Stop Function=======
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // =====cancel_order Function=============================
    async function cancel_order(old_claient_order_id) {
        // console.log('78:old_claient_order_id='+old_claient_order_id);
        // console.log('79:indexBot='+indexBot);
        console.log('452:old_claient_order_id=',old_claient_order_id);
        spot_cancel_order_client_order_id.push(old_claient_order_id);
        // console.log('453:length=',spot_cancel_order_client_order_id.length)
        try {
            let res=await request_trading('spot_cancel_order', { client_order_id: old_claient_order_id },500,0);
            console.log('251:res=',res)
            let found=outPutManualData.some(order => order.orderId===old_claient_order_id)
            if (found){
                let cancel_Order_Id=outPutManualData.find(order => order.orderId===old_claient_order_id);
                let index=outPutManualData.indexOf(cancel_Order_Id);
                outPutManualData.splice(index,1);
                //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);
            }else{
                console.log('496:found=',found)
            }
        } catch (err) {
            console.log(err.code);
        }
    }
    // ====================End of cancel order =======
    // ---------------------------------------------------------
    // ========Start of Generat client_order_id Function==================
    // function generateRandom() {
    //     let d = Date.now();
    //     return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //         let r = (d + Math.random() * 16) % 16 | 0;
    //         d = Math.floor(d / 16);
    //         return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    //     });
    // }
    // ==============End of Generat client_order_id Function===========
    // -------------------------------------------------------
    // =====balance update Function=======================
    async function balance_update_symR(indexBot,symRL) {
        return new Promise(async function(resolve,reject){
            let Free_fund
            let symR_L=symRL_Func(indexBot,symRL);
            // console.log('218=start')
            let balance = await request_trading('spot_balance',{"currency": symR_L},500,0);
            // console.log('123:balance=',balance);
            if(balance.available == undefined){
                console.log('219');
                balance = await request_trading('spot_balance',{"currency": symR_L},500,0); 
                console.log('220:balance=',balance);
            }
            // console.log('124:balance=',balance);
            if(balance.length != 0){
                if (balance.currency == symR_L) {
                    Free_fund = parseFloat(balance.available);
                    //console.log('35:Free_fund00='+Free_fund);
                } 
            }
            else Free_fund = 0;
            resolve(Free_fund)
        })
        
    }
    // ======End of balance update Function========================
    // ------------------------------------------------------------
    // ======star of Bolinger/mincheckCandel/spotPric Function======
    function min_check_candle_bolinger(message,indexBot) {
        let tick_snapshot
        let SpotPrice=0;
        let sym=botList[indexBot]['sym'];
        let openPrice=botList[indexBot]['openPrice'];
        let closePrice=botList[indexBot]['closePrice'];
        let lowPrice=botList[indexBot]['lowPrice'];
        // let highPrice=botList[indexBot]['highPrice'];
        let timeStep=botList[indexBot]['timeStep'];
        // let closePrice=new Array();
        // let lowPrice=new Array();
        let highPrice=new Array();
        // let timeStep=null;
        let nCandel=botList[indexBot]['nCC']+1;
        if (message.snapshot != null) {
            tick_snapshot = message.snapshot[sym];
            // console.log('41:'+sym+'tick_snapshot=',tick_snapshot);
            // botList[indexBot]['tick_snapshot']=tick_snapshot
            timeStep = parseFloat(tick_snapshot[nCandel - 1].t);
            botList[indexBot]['timeStep']=timeStep;
            // console.log('453:tick_snapshot=',tick_snapshot)
            // //await stramWriteFunc(pathFile_botList,botList);;
            SpotPrice = parseFloat(tick_snapshot[nCandel - 1].c);
            // //console.log('145:SpotPrice=',SpotPrice);
            if (SpotPrice !=0){
                botList[indexBot]['price']=SpotPrice;
                // //await stramWriteFunc(pathFile_botList,botList);;
            }
            
            for (let index = 0; index < tick_snapshot.length; index++) {
                openPrice[index] = parseFloat(tick_snapshot[index].o);
                closePrice[index] = parseFloat(tick_snapshot[index].c);
                lowPrice[index] = parseFloat(tick_snapshot[index].l);
                highPrice[index] = parseFloat(tick_snapshot[index].h);
            }
            botList[indexBot]['openPrice']=openPrice;
            botList[indexBot]['closePrice']=closePrice;
            botList[indexBot]['lowPrice']=lowPrice;
            // botList[indexBot]['highPrice']=highPrice;
            // //await stramWriteFunc(pathFile_botList,botList);;

        } else {
            var tick_update = message.update[sym];
            // console.log('180:tick_update',tick_update);
            SpotPrice = parseFloat(tick_update[0].c);
            // console.log('146:SpotPrice=',SpotPrice);
            if (SpotPrice !=0){
                botList[indexBot]['price']=SpotPrice;
                // //await stramWriteFunc(pathFile_botList,botList);;
            }
            if (timeStep != tick_update[0].t) {
                for (let index = 0; index < nCandel - 1; index++) {
                    openPrice[index] = openPrice[index + 1];
                    closePrice[index] = closePrice[index + 1];
                    lowPrice[index] = lowPrice[index + 1];
                    highPrice[index] = highPrice[index + 1];
                }
                timeStep = parseFloat(tick_update[0].t);
                botList[indexBot]['timeStep']=timeStep;
                // //await stramWriteFunc(pathFile_botList,botList);;
            }
            openPrice[nCandel - 1] = parseFloat(tick_update[0].o);
            closePrice[nCandel - 1] = parseFloat(tick_update[0].c);
            lowPrice[nCandel - 1] = parseFloat(tick_update[0].l);
            highPrice[nCandel - 1] = parseFloat(tick_update[0].h);
            
            for(let index = 0; index < openPrice.length; index++){
                if(openPrice[index] == undefined){
                    openPrice[index]=openPrice[nCandel - 1];
                    closePrice[index]=closePrice[nCandel-1]
                    lowPrice[index]=lowPrice[nCandel-1]
                }

            }
            botList[indexBot]['openPrice']=openPrice;
            botList[indexBot]['closePrice']=closePrice;
            botList[indexBot]['lowPrice']=lowPrice;
            // botList[indexBot]['highPrice']=highPrice;
            // console.log('185:lowPrice',botList[indexBot]['lowPrice']);
            // console.log('186:closePrice',botList[indexBot]['closePrice']);
            // //await stramWriteFunc(pathFile_botList,botList);;
        }
        
        // console.log('185:lowPrice',botList[indexBot]['lowPrice']);
        // console.log('186:closePrice',botList[indexBot]['closePrice']);
        // =================bolinger coding==============
        min_check_candle(indexBot);
        
        close_up_check_candle(indexBot)
        if(nCandel== 21){
            bolinger(nCandel,closePrice,lowPrice,highPrice);
        }
        
    }
    // =========END of Bolinger/mincheckCandel/spotPric Function========
    // ---------------------------------------------------------------
    // ===========start douwn_percent_order_buy()====================
    async function douwn_percent_order_buy(indexBot_trading) {
        // console.log('3:'+":indexBot_trading="+':'+indexBot_trading);
        console.log('482:'+":botList[indexBot_trading]="+':'+botList[indexBot_trading]['sym']);

        if (botList[indexBot_trading]['buy_order_is_done'] == false){
            // console.log('5:'+":indexBot_trading="+':'+indexBot_trading);

            let BuyPriceQuantity=BP_calculation(indexBot_trading);
            console.log('449:BuyPriceQuantity=',BuyPriceQuantity)
            await BuyOrder(BuyPriceQuantity.price, BuyPriceQuantity.quantity,indexBot_trading,0);
        }
    }
    // ===========End douwn_percent_order_buy()======================
    // --------------------------------------------------------------
    // ------------------------------------------------------------------
    
    // ===========start up_percent_order_sell()====================
    async function up_percent_order_sell(data_UPS1,indexBot_trading) {
        // //console.log('data_UPS1.quantity='+data_UPS1.quantity);
        // //console.log('data_UPS1.quantity_cumulative='+data_UPS1.quantity_cumulative);
        // //console.log('data_UPS1.quantity_res='+data_UPS1.quantity_res);
        let symQuantitySell;
        let mathIUPS=Math.pow((1+botList[indexBot_trading]['IUPS']/100),botList[indexBot_trading]['filled_buy_order']-1);
        // console.log('766:mathIUPS=',mathIUPS)
        if(data_UPS1.status==='filled'){
            symQuantitySell=data_UPS1.quantity;
            //console.log("213:symQuantitySell for status filled=" + data_UPS1.quantity);
        }else if(data_UPS1.status==='canceled'){
            symQuantitySell=data_UPS1.quantity_res;
            //console.log("214:symQuantitySell for status cancelled=" + data_UPS1.quantity_res);
        }
        
        let Sellprice = Math.ceil((1 + (botList[indexBot_trading]['UPS0']+mathIUPS*botList[indexBot_trading]['UPS1']) / 100) *(botList[indexBot_trading]['price'])* botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
        console.log("745:Sellprice=" + Sellprice);
        //console.log("785:price=" + botList[indexBot_trading]['price']);
        //console.log("786:UPS0=" + botList[indexBot_trading]['UPS0']);
        //console.log("787:UPS1=" + botList[indexBot_trading]['UPS1']);
        //console.log("788:roundPricePow=" + botList[indexBot_trading]['roundPricePow']);
        await SellOrder(Sellprice, symQuantitySell,indexBot_trading);
        //console.log("up_percent_order_sell finished");
    }
    // ===========End up_percent_order_sell()======================
    // -----------------------------------------------------------------
    // ===========start execution_update_order_sell()====================
    // =======================================
    async function execution_update_order_sell(message) {
        console.log('685:execution_update_order_sell start=')
        // console.log('2680:',message);
        let orderInfo = {};
        if(message.method ==='spot_order'){
            orderInfo=orderInfoBuild(message.params,message.method);                            
        }else if (message.method ==='spot_orders'){
            orderInfo=orderInfoSpotOrders(message);
            checkingOrders(message.params);
        }else{
            //console.log("message.method is not 'spot_order' and neither 'spot_orders' ");
            alertErrorBot.unshift({id: uuid.v4(), msg:"message.method is not 'spot_order' and neither 'spot_orders' "});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        }
        // ------------------
       
        // --------------------
        // console.log('86:orderInfo=',orderInfo);
        if(orderInfo.method === 'spot_order'){
            await order_info_execute(orderInfo);
            // if (Object.keys(Old_Order_Info).length === 0){
            //     await order_info_execute(orderInfo);
            // }else{
            //     let diff_update_time=Date.parse(orderInfo.updated_at)-Date.parse(Old_Order_Info.updated_at);
            //     // console.log('55:diff_update_time=',diff_update_time)
            //     if(diff_update_time <=0 && Old_Order_Info.client_order_id===orderInfo.client_order_id && Old_Order_Info.status===orderInfo.status ){
            //         console.log('38:same orderInfo=',orderInfo.client_order_id);
            //     }else{
            //         await order_info_execute(orderInfo);
            //     }
            // }
        }
        
        
    }
    // ======================================
    // ===========End execution_update_order_sell()======================

    // ----------------------------------------------
    // ===========start of order_info_execute====================
    async function order_info_execute(orderInfo){
        Old_Order_Info=orderInfo;
        // fs.writeFileSync('./StorageData/Old_Order_Info.json', JSON.stringify(Old_Order_Info));
        //NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
        // -----------------------------------------------------------------
        // ===========start date_order()====================
        // =======================================   
        let date = new Date();
        // //console.log((new Date).toISOString());
        
        // ==================================================
        // ===========End date_order()======================
        
        // -----------------------------------------------------------------
        // console.log('88:orderInfo=',orderInfo)
        let indexBot_trading
        if(manualClientOrderIdBS.includes(orderInfo.client_order_id)){
            orderInfo.client_order_id=replaceString(orderInfo.client_order_id.substring(0, 6), 'LostOrd', orderInfo.client_order_id)
            console.log('87:orderInfo.client_order_id.length=',orderInfo.client_order_id.length)
            console.log('88:orderInfo=',orderInfo)
            let index=manualClientOrderIdBS.indexOf(orderInfo.client_order_id)
            manualClientOrderIdBS.splice(index,1)
        }
        // console.log('86:orderInfo.client_order_id.length=',orderInfo.client_order_id.length)
        if (orderInfo.client_order_id.length<32){
            // console.log('87:orderInfo=',orderInfo)
            indexBot_trading= finding_indexBot_trading(orderInfo.symbol);
            // console.log('88:outPutData=',outPutData)
            outPutData_update(orderInfo,indexBot_trading);
            //console.log('88:'+botList[indexBot_trading]["sym"]+':indexBot_trading='+indexBot_trading);
            // console.log('43:indexBot_trading=',indexBot_trading);
        }else{
            outPutManualData_update(orderInfo);
        }
        // ----------------------------------------------------------------
        
        //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);
        
        // -----------------------------print trade info------------------------------------
        if (orderInfo.client_order_id.length<32 && orderInfo.OldNew==='New'){
            
            let IranDate = new Date(Date.parse(orderInfo.updated_at) +12600000); 
            console.log('======================================start of  execution_update_order_sell============ ');
            console.log("--------------------------------------------------------------------");
            console.log(IranDate);
            console.log(orderInfo.symbol + " " + orderInfo.side + " " + orderInfo.type + ' ' + 'client_order_id:' + orderInfo.client_order_id + '(' + orderInfo.status + ')');
            console.log("...orderId: " + orderInfo.id);
            if (orderInfo.status !== 'filled' && orderInfo.status !=='canceled' ){
                console.log(corres_order_info[indexBot_trading])
            }
            console.log("...price: " + orderInfo.price + ", quantity: " + orderInfo.quantity);
            console.log("--------------------------------------------------------------------");

        }
        // //console.log('94:'+sym+'indexBot_='+indexBot);
        // -------------------------------------end of print trade info------------------------
        if(orderInfo.client_order_id.length<32 && botList[indexBot_trading]['delete_buttom'] == true){
            return;
        }else if (orderInfo.client_order_id.length<32 && orderInfo.OldNew==='New') {
            // console.log('151:orderInfo='+orderInfo)
            // //console.log('90:'+(botList[indexBot_trading]['sym'])+'indexBot_trading='+indexBot_trading)
            if (orderInfo.status == "REJECTED") {
                //console.log("Order Failed! Reason: " + message.r);
                return;
            }else if (orderInfo.status == 'canceled' && orderInfo.side == 'buy') {
                if(spot_cancel_order_client_order_id.includes(orderInfo.client_order_id)){
                    await buyCanceled(orderInfo,indexBot_trading);
                }else{
                    console.log("723:client_order_id=" + orderInfo.client_order_id);
                }
                return;
            }else if ((orderInfo.status == 'canceled') && (orderInfo.side == 'sell')) {
                if((orderInfo.report_type !='suspend_inner_cancel_status') && (orderInfo.report_type !='suspend_inner_edit_status')){
                    await sellCanceled(orderInfo,indexBot_trading);
                    return;
                }else if (orderInfo.report_type =='suspend_inner_cancel_status'){
                    await sell_follow_up_ReplaceSellOrder_Stop(orderInfo,indexBot_trading)
                    return;
                }
                
            }else if ((orderInfo.status === 'new' || orderInfo.status === 'partiallyFilled') && orderInfo.side == 'buy' && botList[indexBot_trading]['stop_buttom'] == false) {
                await buyNew(orderInfo,indexBot_trading);
                return;
            }else if (orderInfo.status == 'filled' && orderInfo.side == 'buy') {
                await buyFilled(orderInfo,indexBot_trading);
                return;
            }else if ((orderInfo.status === 'new' || orderInfo.status === 'partiallyFilled') && orderInfo.side == 'sell' && orderInfo.client_order_id) {
                await sellNew(orderInfo,indexBot_trading);
                return;
            }else if (orderInfo.status == 'filled' && orderInfo.side == 'sell') {
                console.log('183='+botList[indexBot_trading]['sym']+'=filled_buy_order:'+botList[indexBot_trading]['filled_buy_order']+'(sell filled-d)');
                let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                filled_buy_order--;
                botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                console.log('184='+botList[indexBot_trading]['sym']+'=filled_buy_order:'+botList[indexBot_trading]['filled_buy_order']+'(sell filled-d)');
                checking_filled_buy_order(botList[indexBot_trading].sym,indexBot_trading)
                await sellFilled(orderInfo,indexBot_trading,filled_buy_order);
                return;
            }
            //console.log('...filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']) + '   ' + 'max_order=' +botList[indexBot_trading]['MO']); 
        }
        //await stramWriteFunc(pathFile_botList,botList);;
    
    }
    // ===========end of order_info_execute====================
    // -----------------------------------------------
    // -----------------------------------------------------------------
    // ===========start buy_follow()====================
    // =======================================   
    async function buy_follow(indexBot,diff_buy_spot,new_buy_order_data_info) {
        let new_diff_buy_spot = Math.abs(botList[indexBot]['price'] - new_buy_order_data_info.buyPrice);
        console.log('78:'+botList[indexBot]['sym']+':'+botList[indexBot]['price']);
        console.log('79:diff_buy_spot='+diff_buy_spot);
        let diff_spot_buy_percent = Math.abs((new_diff_buy_spot - diff_buy_spot) / diff_buy_spot * 100);
        console.log('80:'+botList[indexBot]['sym']+':diff_spot_buy_percent=' + diff_spot_buy_percent);
        
        if(diff_spot_buy_percent > 0.1){
            let new_buy_price
            new_buy_price = Math.ceil((botList[indexBot]['price'] - diff_buy_spot) * botList[indexBot]['roundPricePow']) / botList[indexBot]['roundPricePow'];
            console.log('249:ReplaceBuyOrder====buy_follow');
            await ReplaceBuyOrder(new_buy_order_data_info.buyOrderId, new_buy_price, new_buy_order_data_info.buyQuantityBase,indexBot);
            //console.log('82:diff_spot_buy_percent>0.1:'+botList[indexBot]['sym']+"ReplaceBuyOrder was Done");
            return
        }else{
            console.log('351:diff_spot_buy_percent<0.1');
        }

    }
    // ======================================
    // ===========End buy_follow()======================
    // -----------------------------------------------------------------
    // -----------------------------------------------------------------
    // ===========start soft_buy_follow()====================
    // =======================================   
    async function soft_buy_follow(data_buy,sym) {
        let foundBot=botList.some(bot => bot.sym === sym);
        if(foundBot){
            let selectedBot=botList.filter(bot => bot.sym === sym )[0];
            let indexBot_trading=botList.indexOf(selectedBot);
            if (botList[indexBot_trading]['delete_buttom']==false) {
                let foundOrder=outPutData.some(order => ((order.buyOrderId === data_buy.client_order_id) &&  (order.buyStatus != 'filled')));
                //console.log('soft_buy_follow_is start');
                if (foundOrder) {
                    // -----------------------
                    let mathIDPB;
                    let NBO
                    NBO=botList[indexBot_trading]['NBO']
                    if(botList[indexBot_trading]['filled_buy_order']+1>=NBO && NBO>1){
                        NBO=botList[indexBot_trading]['filled_buy_order']+1
                    }else{
                        NBO=1
                    }
                    console.log('840:NBO=',NBO)
                    // console.log('842:filled_buy_order_coff=',filled_buy_order_coff)
                    if((botList[indexBot_trading]['Deep_dowun_buy'] === true) && (botList[indexBot_trading]['filled_buy_order']+1 == botList[indexBot_trading]['NDDB'])){
                        mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order'])*(botList[indexBot_trading]['filled_buy_order']);
                        console.log('844:mathIDPB=',mathIDPB)
                    }else{
                        mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order']);
                        console.log('845:mathIDPB=',mathIDPB)
                    }
                    let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
                    let newBuyPrice = (1-DPB_coeff/ 100) * botList[indexBot_trading]['price'];
                    let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                    // --------------------
                    NewUpPercentageBuy = (botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB'])+ botList[indexBot_trading]['SBF'];
                    // //console.log('UPS1=' + botList[indexBot_trading]['UPS1']);
                    let NewCoeff = (1 + NewUpPercentageBuy / 100) / (1 + (botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB']) / 100);
                    let new_soft_buy_price = Math.ceil(NewCoeff*data_buy.price * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                    //console.log("new_soft_buy_price=" + new_soft_buy_price);
                    let min_buy=getLowestBuyPrice(sym);
                    if(new_soft_buy_price<new_down_BuyPrice && new_soft_buy_price<min_buy){
                        // --------------------------------------------------
                        neededQuantity=data_buy.quantity;
                        // ---------------------
                        console.log('245:ReplaceBuyOrder====soft_buy_follow');
                        await ReplaceBuyOrder(data_buy.client_order_id, new_soft_buy_price, neededQuantity,indexBot_trading);
                    }else if(new_soft_buy_price<new_down_BuyPrice && ((botList[indexBot_trading].buy_follow_up == true) || (min_buy == 0))){
                        neededQuantity=data_buy.quantity;
                        console.log('246:ReplaceBuyOrder====Deep soft_buy_follow');
                        await ReplaceBuyOrder(data_buy.client_order_id, new_soft_buy_price, neededQuantity,indexBot_trading);
                    }else{
                        botList[indexBot_trading]['softBuy']=false;
                        //await stramWriteFunc(pathFile_botList,botList);;
                        let foundOrder=outPutData.some(order => order.buyOrderId === data_buy.client_order_id)
                        if(foundOrder){
                            let foundOrder=outPutData.find(order => order.buyOrderId === data_buy.client_order_id)
                            let indexOrder=outPutData.indexOf(foundOrder);
                            outPutData[indexOrder]['softBuy']=false;
                            console.log('347:'+botList[indexBot_trading]["sym"]+':softBuy=',botList[indexBot_trading]['softBuy']);
                        }else{
                            console.log('348:data_buy.client_order_id=',data_buy.client_order_id);
                        }
                        
                    }
                    
                    // //console.log('28:'+"ReplaceSellOrder was Done");

                }
            }
        }          

    }
    // ==================================================
    // ===========End soft_buy_follow()======================
    // -----------------------------------------------------------------
    // -----------------------------------------------------------------
    // ===========start sell_follow()====================
    // =======================================   
    async function sell_follow(data_sell,sym,Sellprice) {
        let foundBot=botList.some(bot => bot.sym === sym);
        if(foundBot){
            let selectedBot=botList.filter(bot => bot.sym === sym )[0];
            let indexBot_trading=botList.indexOf(selectedBot);
            if (botList[indexBot_trading]['delete_buttom']==false) {
                console.log('521:'+data_sell.client_order_id+':sell_follow_should start');
                let foundOrder=outPutData.some(order => ((order.sellOrderId === data_sell.client_order_id) && (order.sellStatus != 'filled')));
                if (foundOrder) {
                    await ReplaceSellOrder(data_sell.client_order_id, Sellprice, data_sell.quantity,indexBot_trading);     
                }else {
                    let found=outPutData.some(order => order.sellOrderId === data_sell.client_order_id);
                    if (found){
                        let orderInfo=outPutData.find(order => order.sellOrderId === data_sell.client_order_id);
                        let indexId=outPutData.indexOf(orderInfo);
                        let sellStatus=orderInfo.sellStatus;
                        if (sellStatus=='filled'){
                            // console.log('sell_follow is not Done:' + '' + data_sell.client_order_id + ' ' + 'is' + 'filled');
                            // alertErrorBot.unshift({id: uuid.v4(), msg: data_sell.symbol+':'+ data_sell.client_order_id + 'sellOrder is filled'});
                            outPutData.splice(indexId, 1); 
                            // console.log('681:outPutData=',outPutData)
                        }else{
                            console.log('483:sell_follow is not Done:' + '' + data_sell.client_order_id + ' ' + 'is' + statusSell);
                            // alertErrorBot.unshift({id: uuid.v4(), msg: '2:sell_follow is not Done:' + data_sell.symbol+':'+ data_sell.client_order_id + ' ' + 'is' + sellStatus});
                        }
                    }else{
                        console.log('484:sell_follow is not Done:'+data_sell.client_order_id);
                    }
                    
                }
            }
        }
    }
    // ==================================================
    // ===========End sell_follow()======================
    // -----------------------------------------------------------------
    // ===========start insufficient_funds()====================
    // // =======================================
    async function checking_funds(sym){
        let foundBot=botList.some(bot => bot.sym === sym);
        if(foundBot){
            let selectedBot=botList.filter(bot => bot.sym === sym )[0];
            let indexBot_trading=botList.indexOf(selectedBot);
            console.log('checking_funds:')+sym;
            if (botList[indexBot_trading]['delete_buttom']==false &&  botList[indexBot_trading]['stop_buttom']==false && botList[indexBot_trading]['filled_buy_order']< botList[indexBot_trading]['MO'] && botList[indexBot_trading]['buy_order_is_done']  === false){
                let Free_fund=await balance_update_symR(indexBot_trading,'symR');
                let new_buyQuantity=Free_fund/botList[indexBot_trading]['price'];
                let roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                //console.log('23:roundQuantity='+roundQuantity);
                if (roundQuantity<2){
                    //console.log('Warning:'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                    let symR=symRL_Func(indexBot_trading,'symR');
                    let IranDate = new Date(Date.now()+12600000);
                    console.log('659:Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund )
                    alertErrorBot.unshift({id: uuid.v4(), msg:+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds()+'--'+'Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    botList[indexBot_trading]['quantity_low']=true;
                    botList[indexBot_trading]['buy_order_is_done']=false;
                    setTimeout(function(){checking_funds(sym)},1800*1000);
                }else if (botList[indexBot_trading]['quantity_low']){
                    botList[indexBot_trading]['quantity_low']=false;
                    if(botList[indexBot_trading]['buy_order_is_done']  === false){
                        await douwn_percent_order_buy(indexBot_trading);
                    }
                    
                }else{
                    return;
                }
            }

        }
        
    }
    // ==================================================
    // ===========End insufficient_funds()======================
    // -----------------------------------------------------------------
    // ==============Start of importing botlist properties on active bot========
    // function importing_botlist_properties(){
    // }
    // ==============End of importing botlist properties on active bot========
    // -------------------------------------------------------------------------
    
    // ==============Start of outPutData_update on active bot========
    function outPutData_update(orderInfo,indexBot_trading){
        try { 
            // let IranDate = new Date(Date.now()+12600000);
            // let UTCdate=new Date(Date.parse(orderInfo.updated_at))
            let IranDate = new Date(Date.parse(orderInfo.updated_at) +12600000); 
            let outPutData_Order_Quantity=(orderInfo.quantity)*(orderInfo.price); 
            let old_order_data
            let index_old_order_data
            console.log('412:outPutData_update start')
            if(orderInfo.report_type === 'replaced'){
                let foundOrder=outPutData.some(order => ((order.buyOrderId === orderInfo.original_client_order_id) || (order.sellOrderId === orderInfo.original_client_order_id)));
                if(foundOrder){
                    old_order_data=outPutData.find(order => ((order.buyOrderId === orderInfo.original_client_order_id) || (order.sellOrderId === orderInfo.original_client_order_id)));
                    index_old_order_data=outPutData.indexOf(old_order_data);
                    if (orderInfo.side=='buy'){
                        if(orderInfo.status=='new'){
                            let newBuyOrder={
                                sym:orderInfo.symbol,
                                buyOrderId:orderInfo.client_order_id,
                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                buyTime:IranDate,
                                buyPrice:orderInfo.price,
                                buyQuantityBase:orderInfo.quantity,
                                buyQuantity:outPutData_Order_Quantity,
                                buyStatus:orderInfo.status,
                                buyExchangeId:orderInfo.id,
                                softBuy:botList[indexBot_trading]['softBuy'],
                                sellOrderId:null,
                                sellTime:'',
                                sellPrice:'',
                                sellQuantityBase:'',
                                sellQuantity:'',
                                sellStatus:'',
                                sellExchangeId:'',
                                softSell:'',
                                updated_at:orderInfo.updated_at,
                            };
                            outPutData.splice(index_old_order_data, 1, newBuyOrder);
                            // console.log('670:outPutData=',outPutData)
                            orderInfo.OldNew='New';
                        }else if(orderInfo.status=='canceled'){
                            outPutData.splice(index_old_order_data, 1);
                            // console.log('671:outPutData=',outPutData)
                            orderInfo.OldNew='New';
                        }else if(orderInfo.status =='partiallyFilled'){
                            let new_PartiallyFilled_Order={
                                sym:orderInfo.symbol,
                                buyOrderId:orderInfo.client_order_id,
                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                buyTime:IranDate,
                                buyPrice:orderInfo.price,
                                buyQuantityBase:orderInfo.quantity,
                                buyQuantity:outPutData_Order_Quantity,
                                buy_quantity_cumulative:orderInfo.quantity_cumulative,
                                buyStatus:orderInfo.status,
                                buyExchangeId:orderInfo.id,
                                softBuy:botList[indexBot_trading]['softBuy'],
                                sellOrderId:null,
                                sellTime:'',
                                sellPrice:'',
                                sellQuantityBase:'',
                                sellQuantity:'',
                                sellStatus:'',
                                sellExchangeId:'',
                                softSell:'',
                                updated_at:orderInfo.updated_at,
                            };
                            // ------start of tradeProb Array definition---
                            new_PartiallyFilled_Order.buytradeProb=old_order_data.buytradeProb
                            
                            // ------end of tradeProb Array definition---
                            // console.log('441:new_PartiallyFilled_Order=',new_PartiallyFilled_Order);
                            outPutData.splice(index_old_order_data, 1, new_PartiallyFilled_Order);
                            // console.log('672:outPutData=',outPutData)
                            orderInfo.OldNew='New';
                            
                        }
                    }else if (orderInfo.side ==='sell'){
                        if((orderInfo.status=='new') || (orderInfo.status=='suspended')){
                            let newSellOrder={
                                sym:orderInfo.symbol,
                                buyOrderId:old_order_data.buyOrderId,
                                buyTime:old_order_data.buyTime,
                                buyPrice:old_order_data.buyPrice,
                                buyQuantityBase:old_order_data.buyQuantityBase,
                                buyQuantity:old_order_data.buyQuantity,
                                buyStatus:old_order_data.buyStatus,
                                buyExchangeId:old_order_data.buyExchangeId,
                                buytradeProb:old_order_data.buytradeProb,
                                buyFilledNum:old_order_data.buyFilledNum,
                                softBuy:false,
                                sellOrderId:orderInfo.client_order_id,
                                // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                sellTime:IranDate,
                                sellPrice:orderInfo.price,
                                sellQuantityBase:orderInfo.quantity,
                                sellQuantity:outPutData_Order_Quantity,
                                sellStatus:orderInfo.status,
                                sellExchangeId:orderInfo.id,
                                softSell:old_order_data.softSell,
                                updated_at:orderInfo.updated_at,
                            };
                            // console.log('415:newSellOrder=',newSellOrder)
                            // console.log('416:index_old_order_data=',index_old_order_data)
                            outPutData.splice(index_old_order_data, 1, newSellOrder);
                            // console.log('417:outPutData=',outPutData);
                            // console.log('418:outPutData[0]=',outPutData[0]);
                            orderInfo.OldNew='New';
                            // console.log('674:outPutData=',outPutData) 
                        }else if(orderInfo.status=='canceled'){
                            let newSellOrder={
                                sym:orderInfo.symbol,
                                buyOrderId:old_order_data.buyOrderId,
                                buyTime:old_order_data.buyTime,
                                buyPrice:old_order_data.buyPrice,
                                buyQuantityBase:old_order_data.buyQuantityBase,
                                buyQuantity:old_order_data.buyQuantity,
                                buyStatus:old_order_data.buyStatus,
                                buyExchangeId:old_order_data.buyExchangeId,
                                buytradeProb:old_order_data.buytradeProb,
                                buyFilledNum:old_order_data.buyFilledNum,
                                softBuy:false,
                                sellOrderId:null,
                                sellTime:'',
                                sellPrice:'',
                                sellQuantityBase:'',
                                sellQuantity:'',
                                sellStatus:'',
                                sellExchangeId:'',
                                profit:'',
                                updated_at:orderInfo.updated_at,
                            };
                            outPutData.splice(index_old_order_data, 1, newSellOrder);
                            // console.log('675:outPutData=',outPutData)
                            orderInfo.OldNew='New'; 
                        }else if(orderInfo.status=='partiallyFilled'){
                            let new_PartiallyFilled_Order={
                                sym:orderInfo.symbol,
                                buyOrderId:old_order_data.buyOrderId,
                                buyTime:old_order_data.buyTime,
                                buyPrice:old_order_data.buyPrice,
                                buyQuantityBase:old_order_data.buyQuantityBase,
                                buyQuantity:old_order_data.buyQuantity,
                                buyStatus:old_order_data.buyStatus,
                                buyExchangeId:old_order_data.buyExchangeId,
                                buytradeProb:old_order_data.buytradeProb,
                                buyFilledNum:old_order_data.buyFilledNum,
                                softBuy:false,
                                sellOrderId:orderInfo.client_order_id,
                                // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                sellTime:IranDate,
                                sellPrice:orderInfo.price,
                                sellQuantityBase:orderInfo.quantity,
                                sellQuantity:outPutData_Order_Quantity,
                                sell_quantity_cumulative:orderInfo.quantity_cumulative,
                                sellStatus:orderInfo.status,
                                sellExchangeId:orderInfo.id,
                                softSell:old_order_data.softSell,
                                updated_at:orderInfo.updated_at,
                            };
                            new_PartiallyFilled_Order.selltradeProb=old_order_data.selltradeProb
                            outPutData.splice(index_old_order_data, 1, new_PartiallyFilled_Order);
                            orderInfo.OldNew='New'; 
                            // console.log('676:outPutData=',outPutData)
                            
                        }
                    }
                }else{
                    console.log("911:outPutData:",outPutData);
                }
            }else if (orderInfo.report_type === 'new'){
                if (orderInfo.side=='buy'){
                    let found=outPutData.some(order => ((order.sym == orderInfo.symbol) && (order.buyStatus == 'new')))
                    if(found){
                        old_order_data=outPutData.find(order => ((order.sym == orderInfo.symbol) && (order.buyStatus == 'new')))
                        console.log('589:old_order_data=',old_order_data);
                    }
                    let buyData={
                        sym:orderInfo.symbol,
                        buyOrderId:orderInfo.client_order_id,
                        // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                        buyTime:IranDate,
                        buyPrice:orderInfo.price,
                        buyQuantityBase:orderInfo.quantity,
                        buyQuantity:outPutData_Order_Quantity,
                        buyStatus:orderInfo.status,
                        buyExchangeId:orderInfo.id,
                        softBuy:botList[indexBot_trading]['softBuy'],
                        sellOrderId:null,
                        sellTime:'',
                        sellPrice:'',
                        sellQuantityBase:'',
                        sellQuantity:'',
                        sellStatus:'',
                        sellExchangeId:'',
                        softSell:'',
                        updated_at:orderInfo.updated_at,
                    };
                    outPutData.unshift(buyData);
                    // console.log('684:outPutData=',outPutData)
                    orderInfo.OldNew='New';
                    
                }else if (orderInfo.side ==='sell'){
                    let buyOrderId=orderInfo.client_order_id.substring(orderInfo.client_order_id.length-12);
                    let foundOrder=outPutData.some(order =>((order.sym === orderInfo.symbol) && (order.buyOrderId.substring(order.buyOrderId.length-12) == buyOrderId)))
                    if(foundOrder){
                        old_order_data=outPutData.find(order =>((order.sym === orderInfo.symbol) && (order.buyOrderId.substring(order.buyOrderId.length-12) == buyOrderId)))
                        index_old_order_data=outPutData.indexOf(old_order_data);
                        let newSellOrder={
                            sym:orderInfo.symbol,
                            buyOrderId:old_order_data.buyOrderId,
                            buyTime:old_order_data.buyTime,
                            buyPrice:old_order_data.buyPrice,
                            buyQuantityBase:old_order_data.buyQuantityBase,
                            buyQuantity:old_order_data.buyQuantity,
                            buyStatus:old_order_data.buyStatus,
                            buyExchangeId:old_order_data.buyExchangeId,
                            buytradeProb:old_order_data.buytradeProb,
                            buyFilledNum:old_order_data.buyFilledNum,
                            softBuy:false,
                            sellOrderId:orderInfo.client_order_id,
                            // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                            sellTime:IranDate,
                            sellPrice:orderInfo.price,
                            sellQuantityBase:orderInfo.quantity,
                            sellQuantity:outPutData_Order_Quantity,
                            sellStatus:orderInfo.status,
                            sellExchangeId:orderInfo.id,
                            updated_at:orderInfo.updated_at,
                            softSell:true
                        };
                        outPutData.splice(index_old_order_data, 1, newSellOrder);
                        orderInfo.OldNew='New';
                        
                    }else{
                        console.log('912:outPutData=',outPutData) 
                    }
                    
                } 
            }else if (orderInfo.report_type === 'trade'){
                let foundOrder=outPutData.some(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                if(foundOrder){
                    old_order_data=outPutData.find(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                    index_old_order_data=outPutData.indexOf(old_order_data);
                    if (orderInfo.side=='buy'){
                        if(orderInfo.status=='partiallyFilled'){
                            let new_PartiallyFilled_Order={
                                        sym:orderInfo.symbol,
                                        buyOrderId:orderInfo.client_order_id,
                                        // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        buyTime:IranDate,
                                        buyPrice:orderInfo.price,
                                        buyQuantityBase:orderInfo.quantity,
                                        buyQuantity:outPutData_Order_Quantity,
                                        buy_quantity_cumulative:orderInfo.quantity_cumulative,
                                        buyStatus:orderInfo.status,
                                        buyExchangeId:orderInfo.id,
                                        softBuy:botList[indexBot_trading]['softBuy'],
                                        sellOrderId:null,
                                        sellTime:'',
                                        sellPrice:'',
                                        sellQuantityBase:'',
                                        sellQuantity:'',
                                        sellStatus:'',
                                        sellExchangeId:'',
                                        softSell:'',
                                        updated_at:orderInfo.updated_at,
                                    };
                                    // ------start of tradeProb Array definition---
                                    tradeProb_cal(orderInfo,old_order_data,new_PartiallyFilled_Order);
                                    
                                    // ------end of tradeProb Array definition---
                                    // console.log('441:new_PartiallyFilled_Order=',new_PartiallyFilled_Order);
                                    outPutData.splice(index_old_order_data, 1, new_PartiallyFilled_Order);
                                    // console.log('672:outPutData=',outPutData)
                                    orderInfo.OldNew='New';
                                
                            
                        }else if(orderInfo.status=='filled'){
                            let filledBuyOrder={
                                sym:orderInfo.symbol,
                                buyOrderId:orderInfo.client_order_id,
                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                buyTime:IranDate,
                                buyPrice:orderInfo.price,
                                buyQuantityBase:orderInfo.quantity,
                                buyQuantity:outPutData_Order_Quantity,
                                buyStatus:orderInfo.status,
                                buyExchangeId:orderInfo.id,
                                buyFilledNum:botList[indexBot_trading]['filled_buy_order']+1,
                                softBuy:true,
                                sellOrderId:null,
                                sellTime:'',
                                sellPrice:'',
                                sellQuantityBase:'',
                                sellQuantity:'',
                                sellStatus:'',
                                sellExchangeId:'',
                                softSell:'',
                                updated_at:orderInfo.updated_at,
                            };
                            // ------start of tradeProb Array definition---
                            tradeProb_cal(orderInfo,old_order_data,filledBuyOrder);
                            // ------end of tradeProb Array definition---
                            outPutData.splice(index_old_order_data, 1, filledBuyOrder);
                            // console.log('661:outPutData=',outPutData)
                            
                            orderInfo.OldNew='New';
                                    
                                    
                            
                            
                        }
                    }else if (orderInfo.side ==='sell'){
                        if(orderInfo.status=='partiallyFilled'){
                            let new_PartiallyFilled_Order={
                                    sym:orderInfo.symbol,
                                    buyOrderId:old_order_data.buyOrderId,
                                    buyTime:old_order_data.buyTime,
                                    buyPrice:old_order_data.buyPrice,
                                    buyQuantityBase:old_order_data.buyQuantityBase,
                                    buyQuantity:old_order_data.buyQuantity,
                                    buyStatus:old_order_data.buyStatus,
                                    buyExchangeId:old_order_data.buyExchangeId,
                                    buytradeProb:old_order_data.buytradeProb,
                                    buyFilledNum:old_order_data.buyFilledNum,
                                    softBuy:false,
                                    sellOrderId:orderInfo.client_order_id,
                                    // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                    sellTime:IranDate,
                                    sellPrice:orderInfo.price,
                                    sellQuantityBase:orderInfo.quantity,
                                    sellQuantity:outPutData_Order_Quantity,
                                    sell_quantity_cumulative:orderInfo.quantity_cumulative,
                                    sellStatus:orderInfo.status,
                                    sellExchangeId:orderInfo.id,
                                    softSell:old_order_data.softSell,
                                    updated_at:orderInfo.updated_at,
                                };
                                tradeProb_cal(orderInfo,old_order_data,new_PartiallyFilled_Order);
                                // let profitPercent=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee)/(filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity)*100;
                                // new_PartiallyFilled_Order.profitPercent=profitPercent;
                                // let profitValue=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee);
                                // new_PartiallyFilled_Order.profitValue=profitValue;
                                outPutData.splice(index_old_order_data, 1, new_PartiallyFilled_Order);
                                orderInfo.OldNew='New'; 
                                // console.log('676:outPutData=',outPutData)
                        }else if(orderInfo.status=='filled'){
                            let filledSellOrder={
                                    sym:orderInfo.symbol,
                                    buyOrderId:old_order_data.buyOrderId,
                                    buyTime:old_order_data.buyTime,
                                    buyPrice:old_order_data.buyPrice,
                                    buyQuantityBase:old_order_data.buyQuantityBase,
                                    buyQuantity:old_order_data.buyQuantity,
                                    buyStatus:old_order_data.buyStatus,
                                    buyExchangeId:old_order_data.buyExchangeId,
                                    buytradeProb:old_order_data.buytradeProb,
                                    buyFilledNum:old_order_data.buyFilledNum,
                                    softBuy:false,
                                    sellOrderId:orderInfo.client_order_id,
                                    // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                    sellTime:IranDate,
                                    sellPrice:orderInfo.price,
                                    sellQuantityBase:orderInfo.quantity,
                                    sellQuantity:outPutData_Order_Quantity,
                                    sellStatus:orderInfo.status,
                                    sellType:orderInfo.type,
                                    sellExchangeId:orderInfo.id,
                                    softSell:false,
                                    // profit:(orderInfo.price-old_order_data.buyPrice)/old_order_data.buyPrice*100,
                                    updated_at:orderInfo.updated_at,
                                };
                                
                                // console.log('416:filledSellOrder=',filledSellOrder);
                                tradeProb_cal(orderInfo,old_order_data,filledSellOrder);
                                profitCalculation(filledSellOrder);
                                // let profitPercent=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee)/(filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity)*100;
                                // filledSellOrder.profitPercent=profitPercent;
                                // let profitValue=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee);
                                // filledSellOrder.profitValue=profitValue;
                                if(botList[indexBot_trading].sell_follow_up_buy_id == filledSellOrder.buyOrderId){
                                    botList[indexBot_trading].sell_follow_up_buy_id='';
                                    console.log('409:sell_follow_up_buy_id=',botList[indexBot_trading].sell_follow_up_buy_id);
                                }
                                // //console.log('filledSellOrder=',filledSellOrder);
                                outPutData.splice(index_old_order_data, 1);
                                // console.log('677:outPutData=',outPutData)
                                
                                outPutFilledData.unshift(filledSellOrder);
                                let filledBotOrder=outPutFilledData.filter(bot => bot.sym == filledSellOrder.sym);
                                console.log('248:filledBotOrder.length=',filledBotOrder.length)
                                if (filledBotOrder.length>30){
                                    let omittedFilledOrder=filledBotOrder.pop();
                                    let index_omittedFilledOrder=outPutFilledData.indexOf(omittedFilledOrder);
                                    outPutFilledData.splice(index_omittedFilledOrder, 1);
                                }
                                orderInfo.OldNew='New'; 
                        }
                    }
                }else{
                    console.log("913:outPutData:",outPutData);
                }
            }else if (orderInfo.report_type === 'canceled'){
                let foundOrder=outPutData.some(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                if(foundOrder){
                    old_order_data=outPutData.find(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                    index_old_order_data=outPutData.indexOf(old_order_data);
                    if (orderInfo.side=='buy'){
                        outPutData.splice(index_old_order_data, 1);
                        orderInfo.OldNew='New';
                    }else if (orderInfo.side ==='sell'){
                        let newSellOrder={
                            sym:orderInfo.symbol,
                            buyOrderId:old_order_data.buyOrderId,
                            buyTime:old_order_data.buyTime,
                            buyPrice:old_order_data.buyPrice,
                            buyQuantityBase:old_order_data.buyQuantityBase,
                            buyQuantity:old_order_data.buyQuantity,
                            buyStatus:old_order_data.buyStatus,
                            buyExchangeId:old_order_data.buyExchangeId,
                            buytradeProb:old_order_data.buytradeProb,
                            buyFilledNum:old_order_data.buyFilledNum,
                            softBuy:false,
                            sellOrderId:null,
                            sellTime:'',
                            sellPrice:'',
                            sellQuantityBase:'',
                            sellQuantity:'',
                            sellStatus:'',
                            sellExchangeId:'',
                            profit:'',
                            updated_at:orderInfo.updated_at,
                        };
                        outPutData.splice(index_old_order_data, 1, newSellOrder);
                        
                        orderInfo.OldNew='New'; 
                        console.log('615:sell_follow_up_buy_id=',botList[indexBot_trading]['sell_follow_up_buy_id'])
                        if (old_order_data.buyOrderId == botList[indexBot_trading]['sell_follow_up_buy_id']){
                            if(botList[indexBot_trading].suspend_inner_cancel_status == true){
                                orderInfo.report_type='suspend_inner_cancel_status'
                                console.log('616:suspend_inner_cancel_status=',botList[indexBot_trading].suspend_inner_cancel_status)
                                botList[indexBot_trading].suspend_inner_cancel_status = false;
                            }else if(botList[indexBot_trading].suspend_inner_cancel_status == 'edit_status'){
                                orderInfo.report_type='suspend_inner_edit_status'
                                console.log('617:suspend_inner_cancel_status=',botList[indexBot_trading].suspend_inner_cancel_status)
                                botList[indexBot_trading].suspend_inner_cancel_status = false;
                            }
                        }
                    }
                }else{
                    console.log('914:outPutData=',outPutData)
                }
            }else if(orderInfo.report_type === 'status'){
                let IranDate = new Date(Date.parse(orderInfo.updated_at) +12600000); 
                let outPutData_Order_Quantity=(orderInfo.quantity)*(orderInfo.price); 
                let foundOrder=outPutData.some(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                if(foundOrder){
                    old_order_data=outPutData.find(order => ((order.buyOrderId === orderInfo.client_order_id) || (order.sellOrderId === orderInfo.client_order_id)));
                    index_old_order_data=outPutData.indexOf(old_order_data);
                    console.log('591:old_order_data=',old_order_data);
                    if (orderInfo.side=='buy'){
                        if(orderInfo.status=='new'){
                            // //console.log('buySellData000=',buySellData)
                            let foundOldOrderNew=outPutData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.buyStatus==='new' && order.sym===orderInfo.symbol));
                            let foundOldOrderFilled=outPutData.some(order => (Date.parse(order.updated_at) == Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.buyStatus==='filled' && order.sym===orderInfo.symbol));
                            if (foundOldOrderNew == true){
                                console.log('147:old order is found which was new');
                                orderInfo.OldNew='Old';
                            }else if(foundOldOrderFilled == true){
                                console.log('148:old order is found which was filled');
                                orderInfo.OldNew='Old';
                                
                            }else{
                                let newBuyOrder={
                                    sym:orderInfo.symbol,
                                    buyOrderId:orderInfo.client_order_id,
                                    // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                    buyTime:IranDate,
                                    buyPrice:orderInfo.price,
                                    buyQuantityBase:orderInfo.quantity,
                                    buyQuantity:outPutData_Order_Quantity,
                                    buyStatus:orderInfo.status,
                                    buyExchangeId:orderInfo.id,
                                    softBuy:botList[indexBot_trading]['softBuy'],
                                    sellOrderId:null,
                                    sellTime:'',
                                    sellPrice:'',
                                    sellQuantityBase:'',
                                    sellQuantity:'',
                                    sellStatus:'',
                                    sellExchangeId:'',
                                    softSell:'',
                                    updated_at:orderInfo.updated_at,
                                };
                                outPutData.splice(index_old_order_data, 1, newBuyOrder);
                                // console.log('670:outPutData=',outPutData)
                                orderInfo.OldNew='New';
                                // //await stramWriteFunc(pathFile_botList,botList);;
                            }
                        }else if(orderInfo.status=='partiallyFilled'){
                            // //console.log('buySellData000=',buySellData)
                            let foundOldOrderPartiallyFilled=outPutData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.quantity_cumulative===orderInfo.quantity_cumulative && order.buyStatus==='partiallyFilled'));
                            if (foundOldOrderPartiallyFilled==true && orderInfo.status=='partiallyFilled' && orderInfo.side ==='buy'){
                                console.log('146:old order is found which was partiallyFilled and same quantity_cumulative');
                                orderInfo.OldNew='Old';
                            }else{
                                let foundOrder= outPutData.some(order => (((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')) && (order.sym == orderInfo.symbol)));
                                console.log('178:foundOrder='+foundOrder)
                                if (foundOrder){
                                    let OldBuyOrder=outPutData.find(order => (((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')) && (order.sym == orderInfo.symbol)));
                                    let indexOrder=outPutData.indexOf(OldBuyOrder);
                                    let new_PartiallyFilled_Order={
                                        sym:orderInfo.symbol,
                                        buyOrderId:orderInfo.client_order_id,
                                        // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        buyTime:IranDate,
                                        buyPrice:orderInfo.price,
                                        buyQuantityBase:orderInfo.quantity,
                                        buyQuantity:outPutData_Order_Quantity,
                                        buy_quantity_cumulative:orderInfo.quantity_cumulative,
                                        buyStatus:orderInfo.status,
                                        buyExchangeId:orderInfo.id,
                                        softBuy:botList[indexBot_trading]['softBuy'],
                                        sellOrderId:null,
                                        sellTime:'',
                                        sellPrice:'',
                                        sellQuantityBase:'',
                                        sellQuantity:'',
                                        sellStatus:'',
                                        sellExchangeId:'',
                                        softSell:'',
                                        updated_at:orderInfo.updated_at,
                                    };
                                    
                                    // ------start of tradeProb Array definition---
                                    new_PartiallyFilled_Order.buytradeProb=OldBuyOrder.buytradeProb
                                    
                                    // ------end of tradeProb Array definition---
                                    // console.log('441:new_PartiallyFilled_Order=',new_PartiallyFilled_Order);
                                    outPutData.splice(indexOrder, 1, new_PartiallyFilled_Order);
                                    // console.log('672:outPutData=',outPutData)
                                    orderInfo.OldNew='New';
                                    
                                    
                                    // //await stramWriteFunc(pathFile_botList,botList);;
                                    //console.log( '281:new_PartiallyFilled_Order=', new_PartiallyFilled_Order);
                                }else{
                                    //console.log('159:there is no buySellData with status (PartiallyFilled or new) which is new_PartiallyFilled_Order');
                                    //console.log('buySellData=',buySellData);
                                    
                                    alertErrorBot.unshift({id: uuid.v4(), msg:'159:there is no buySellData with status (PartiallyFilled or new) which is new_PartiallyFilled_Order'});   
                                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)                 
                                }     
                            }
                            
                        }
                    }else if (orderInfo.side ==='sell'){
                        if(orderInfo.status=='new' || orderInfo.status=='suspended'){
                            // //console.log('buySellData000=',buySellData)
                            let foundOldOrderNew=outPutData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.sellStatus==='new'));
                            let foundOldOrderFilled=outPutData.some(order => (Date.parse(order.updated_at) == Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.sellStatus==='filled'));
                            
                            if (foundOldOrderNew==true){
                                console.log('150:old order is found which was new sell');
                                orderInfo.OldNew='Old';

                            }else if (foundOldOrderFilled==true){
                                console.log('150:old order is found which was filled sell');
                                orderInfo.OldNew='Old';
                            }
                            else{
                                let newSellOrder={
                                    sym:orderInfo.symbol,
                                    buyOrderId:old_order_data.buyOrderId,
                                    buyTime:old_order_data.buyTime,
                                    buyPrice:old_order_data.buyPrice,
                                    buyQuantityBase:old_order_data.buyQuantityBase,
                                    buyQuantity:old_order_data.buyQuantity,
                                    buyStatus:old_order_data.buyStatus,
                                    buyExchangeId:old_order_data.buyExchangeId,
                                    buytradeProb:old_order_data.buytradeProb,
                                    buyFilledNum:old_order_data.buyFilledNum,
                                    softBuy:false,
                                    sellOrderId:orderInfo.client_order_id,
                                    // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                    sellTime:IranDate,
                                    sellPrice:orderInfo.price,
                                    sellQuantityBase:orderInfo.quantity,
                                    sellQuantity:outPutData_Order_Quantity,
                                    sellStatus:orderInfo.status,
                                    sellExchangeId:orderInfo.id,
                                    softSell:old_order_data.softSell,
                                    updated_at:orderInfo.updated_at,
                                };
                                // console.log('415:newSellOrder=',newSellOrder)
                                // console.log('416:index_old_order_data=',index_old_order_data)
                                outPutData.splice(index_old_order_data, 1, newSellOrder);
                                // console.log('417:outPutData=',outPutData);
                                // console.log('418:outPutData[0]=',outPutData[0]);
                                orderInfo.OldNew='New';
                                // console.log('674:outPutData=',outPutData) 
                            }
                            
                        }else if(orderInfo.status=='partiallyFilled'){
                            // //console.log('buySellData000=',buySellData)
                            let foundOldOrderPartiallyFilled=outPutData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.quantity_cumulative===orderInfo.quantity_cumulative && order.sellStatus==='partiallyFilled'));
                            
                            if (foundOldOrderPartiallyFilled==true){
                                console.log('154:old order is found which was partiallyFilled and same quantity_cumulative');
                                orderInfo.OldNew='Old';
                            }
                            else{
                                let new_PartiallyFilled_Order={
                                    sym:orderInfo.symbol,
                                    buyOrderId:old_order_data.buyOrderId,
                                    buyTime:old_order_data.buyTime,
                                    buyPrice:old_order_data.buyPrice,
                                    buyQuantityBase:old_order_data.buyQuantityBase,
                                    buyQuantity:old_order_data.buyQuantity,
                                    buyStatus:old_order_data.buyStatus,
                                    buyExchangeId:old_order_data.buyExchangeId,
                                    buytradeProb:old_order_data.buytradeProb,
                                    buyFilledNum:old_order_data.buyFilledNum,
                                    softBuy:false,
                                    sellOrderId:orderInfo.client_order_id,
                                    // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                    sellTime:IranDate,
                                    sellPrice:orderInfo.price,
                                    sellQuantityBase:orderInfo.quantity,
                                    sellQuantity:outPutData_Order_Quantity,
                                    sell_quantity_cumulative:orderInfo.quantity_cumulative,
                                    sellStatus:orderInfo.status,
                                    sellExchangeId:orderInfo.id,
                                    softSell:old_order_data.softSell,
                                    updated_at:orderInfo.updated_at,
                                };
                                new_PartiallyFilled_Order.selltradeProb=old_order_data.selltradeProb
                                // let profitPercent=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee)/(filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity)*100;
                                // new_PartiallyFilled_Order.profitPercent=profitPercent;
                                // let profitValue=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee);
                                // new_PartiallyFilled_Order.profitValue=profitValue;
                                outPutData.splice(index_old_order_data, 1, new_PartiallyFilled_Order);
                                orderInfo.OldNew='New'; 
                                // console.log('676:outPutData=',outPutData)
                            }
                            
                        }
                    }
                }else{
                    console.log("915:outPutData:",outPutData);
                }
                  
            }else if(orderInfo.report_type === 'suspended'){
                if (orderInfo.side ==='sell'){
                    let foundOrder=outPutData.some(order => ((order.sym === orderInfo.symbol) && (order.buyStatus === 'filled') && (order.sellStatus ==='')));
                    if(foundOrder){
                        old_order_data=outPutData.find(order => ((order.sym === orderInfo.symbol) && (order.buyStatus === 'filled') && (order.sellStatus ==='')));
                        index_old_order_data=outPutData.indexOf(old_order_data);
                        let newSellOrder={
                            sym:orderInfo.symbol,
                            buyOrderId:old_order_data.buyOrderId,
                            buyTime:old_order_data.buyTime,
                            buyPrice:old_order_data.buyPrice,
                            buyQuantityBase:old_order_data.buyQuantityBase,
                            buyQuantity:old_order_data.buyQuantity,
                            buyStatus:old_order_data.buyStatus,
                            buyExchangeId:old_order_data.buyExchangeId,
                            buytradeProb:old_order_data.buytradeProb,
                            buyFilledNum:old_order_data.buyFilledNum,
                            softBuy:false,
                            sellOrderId:orderInfo.client_order_id,
                            // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                            sellTime:IranDate,
                            sellPrice:orderInfo.price,
                            sellQuantityBase:orderInfo.quantity,
                            sellQuantity:outPutData_Order_Quantity,
                            sellStatus:orderInfo.status,
                            sellExchangeId:orderInfo.id,
                            updated_at:orderInfo.updated_at,
                            softSell:true
                        };
                        outPutData.splice(index_old_order_data, 1, newSellOrder);
                        orderInfo.OldNew='New';
                    }else{
                        console.log("917:outPutData:",outPutData);
                    }
                }
            } 
        } catch (error) {
            console.log("811:outPutData_update:",error);
            console.log("812:orderInfo:",orderInfo);
            console.log("813:indexBot_trading:",indexBot_trading);
            alertErrorBot.unshift({id: uuid.v4(), msg:"outPutData_update:",error});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            
        }
    
    }
    // ==============End of outPutData_update on active bot========
    // -------------------------------------------------------------------------
    // -----------------------------------------------------------------
    // ==============Start of outPutData_update on active bot========
    function outPutManualData_update(orderInfo){
        let foundOrder=outPutManualData.some(order=>order.orderId === orderInfo.client_order_id)
        if(foundOrder){
            let manualOrder=outPutManualData.find(order=>order.orderId === orderInfo.client_order_id)
            let indexOrder=outPutManualData.indexOf(manualOrder);
            if (orderInfo.status === 'filled'){
                manualOrder.time=new Date(Date.parse(orderInfo.updated_at) +12600000);
                manualOrder.status='filled';
                manualOrder.price=orderInfo.price;
                let sym=manualOrder.sym;
                let outPutManualData_botFilter=outPutManualData.filter(order=>((order.sym === sym) && (order.status === 'filled')) );
                if (outPutManualData_botFilter.length>3){
                    //console.log('733:outPutManualData.length=',outPutManualData_botFilter.length)
                    let removeOrder=outPutManualData_botFilter.pop();
                    //console.log('845:removeOrder=',removeOrder)
                    let removeOrderIndex=outPutManualData.indexOf(removeOrder);
                    //console.log('845:removeOrderIndex=',removeOrderIndex)
                    outPutManualData.splice(removeOrderIndex,1)
                }


            }else if(orderInfo.status === 'partiallyFilled'){
                manualOrder.time=new Date(Date.parse(orderInfo.updated_at) +12600000);
                manualOrder.status='partiallyFilled';
                manualOrder.quantity_cumulative=orderInfo.quantity_cumulative;
                manualOrder.price=orderInfo.price;
            }
            outPutManualData.splice(indexOrder, 1, manualOrder);
            // //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);  
        }else{
            if (orderInfo.status == 'new'){
                let newOrder={
                    sym:orderInfo.symbol,
                    orderId:orderInfo.client_order_id,
                    time:new Date(Date.parse(orderInfo.updated_at) +12600000),
                    price:orderInfo.price,
                    quantityBase:orderInfo.quantity,
                    quantity:orderInfo.quantity,
                    status:orderInfo.status,
                    exchangeId:orderInfo.id,
                    side:orderInfo.side
                };
                outPutManualData.unshift(newOrder);
            }
        }
    }
    // ==============End of outPutData_update on active bot========
    // -------------------------------------------------------------------------
    // -----------------------------------------------------------------
    // ==============Start of finding_indexBot_trading on active bot========
    function finding_indexBot_trading(sym){
        try { 
            let foundBot=botList.find(bot => bot.sym === sym);
            return indexBot_trading=botList.indexOf(foundBot);
        } catch (error) {
            //console.log("41:finding_indexBot_trading:",error);
            alertErrorBot.unshift({id: uuid.v4(), msg:"41:finding_indexBot_trading:",error});
            // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            
        }  
    }
    // ==============End of finding_indexBot_trading on active bot========
    // -------------------------------------------------------------------------
    // -----------------------------------------------------------------
    // ==============Start of min_check_candle========
    function min_check_candle(indexBot){
        // console.log('458:nCC=',botList[indexBot]['nCC']);
        let lowPrice=botList[indexBot]['lowPrice'];
        // console.log('300:lowPrice=',lowPrice);
        if (botList[indexBot]['nCC'] > 0) {
            botList[indexBot]['minCheckCandlePrice']=Math.min(...lowPrice);
            // //await stramWriteFunc(pathFile_botList,botList);;

        }
        console.log('400:minCheckCandlePrice='+botList[indexBot]['minCheckCandlePrice']);
    }
    // ==============end of min_check_candle==========
    // --------------------------------------------------
    // -----------------------------------------------------------------
    // ==============Start of close_up_check_candle========
    function close_up_check_candle(indexBot){
        // console.log('333:nCC='+botList[indexBot]['nCC']);
        if (botList[indexBot]['nCC'] > 0) {
            // =============method1====
            // let closePrice
            // if(botList[indexBot]['closePrice']>botList[indexBot]['openPrice']){
            //     closePrice=botList[indexBot]['openPrice'];
            // }else{
            //     closePrice=botList[indexBot]['closePrice'];
            // }
            // ============method2=======
            let closePrice=botList[indexBot]['closePrice'];
            let openPrice=botList[indexBot]['openPrice'];
            // ========================
            let closeUpArray=new Array();
            for (let i=0; i<closePrice.length-1; i++){
                if(closePrice[i]> openPrice[i]) {
                    closeUpArray[i] = closePrice[i];
                }else{
                    closeUpArray[i]=openPrice[i]
                }
            }
            // console.log('410:closePrice=',closePrice);
            // console.log('411:openPrice=',openPrice);
            // console.log('412:closeUpArray=',closeUpArray);
            botList[indexBot]['closeUpCheckCandle']=Math.max(...closeUpArray);

        }else{
            botList[indexBot]['closeUpCheckCandle']=null;
        }
        console.log('401:closeUpCheckCandle='+botList[indexBot]['closeUpCheckCandle']);
    }
    // ==============end of close_up_check_candle==========
        // -----------------------------------------------------------------
    // --------------------------------------------------
    // ==============Start of bolinger========
    function bolinger(nCandel,closePrice,lowPrice,highPrice){
        let meanSingleCandel = new Array;
        let sumMeanCandle = 0;
        let sumSquarData = 0;
        for (let i = 0; i < nCandel; i++) {
            meanSingleCandel[i] = (lowPrice[i] + highPrice[i] + closePrice[i]) / 3;
            sumMeanCandle += meanSingleCandel[i];
        }
        let meanNcandle = sumMeanCandle / nCandel;

        for (let i = 0; i < nCandel; i++) {
            squarData[i] = Math.pow((meanNcandle - meanSingleCandel[i]), 2);
            sumSquarData += squarData[i];
        }

        standardDeviation = Math.sqrt(sumSquarData / nCandel);
        BOLU = meanNcandle + m_BOL * standardDeviation;
        BOLD = meanNcandle - m_BOL * standardDeviation;
        // botList[indexBot]['BOLU']=BOLU;
        // botList[indexBot]['BOLD']=BOLD;
        // console.info('BOLU='+BOLU);
        // console.info('BOLD='+BOLD);
    }
    // ==============end of bolinger==========
        // -----------------------------------------------------------------
   // --------------------------------------------------
    // ==============Start of BP_calculation========
    function BP_calculation(indexBot_trading){
        // -------------------------------------------------
        // //console.log('3:'+":DPB="+':'+botList[indexBot_trading]['DPB']);
        let mathIDPB
        let NBO
        NBO=botList[indexBot_trading]['NBO']
        if(botList[indexBot_trading]['filled_buy_order']>=NBO && NBO>1){
            NBO=botList[indexBot_trading]['filled_buy_order']+1
        }else{
            NBO=1
        }
        console.log('841:NBO=',NBO)
        let BuyPriceQuantity={};
        console.log('852:filled_buy_order=',botList[indexBot_trading]['filled_buy_order'])
        if((botList[indexBot_trading]['Deep_dowun_buy'] === true) && (botList[indexBot_trading]['filled_buy_order']+1 == botList[indexBot_trading]['NDDB'])){
            mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order'])*(botList[indexBot_trading]['filled_buy_order']);
            console.log('853:mathIDPB=',mathIDPB)
        }else{
            mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order']);
            console.log('855:mathIDPB=',mathIDPB)
        }
        // let mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order']);
        let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
        if(botList[indexBot_trading]['softBuy']==true){
            DPB_coeff=(botList[indexBot_trading]['DPB'])*mathIDPB+botList[indexBot_trading]['SDPB'];
            //console.log('457:softBuy=',botList[indexBot_trading]['softBuy'])
        }
        //console.log('80:mathIDPB='+mathIDPB);
        console.log('170:DPB_coeff='+DPB_coeff);
        console.log('170:sym='+botList[indexBot_trading].sym+'(price)='+botList[indexBot_trading]['price']);
        let newBuyPrice = (1 - DPB_coeff/ 100) * botList[indexBot_trading]['price'];
        
        if(newBuyPrice<=0){
            return alertErrorBot.unshift({id: uuid.v4(), msg:'011:new Buy Price of your buy order is <0, Please Edit your input BUY data'});
        }else{
            console.log('172:newBuyPrice='+newBuyPrice);
            let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
            console.log('173:new_down_BuyPrice=',new_down_BuyPrice);
            // --------------------------------------------------
            // --------------------------------------------------
            //console.log('457:nCC=',typeof(botList[indexBot_trading]['nCC']));
            if(botList[indexBot_trading]['nCC'] > 0){
                min_check_candle(indexBot_trading);
                if (botList[indexBot_trading]['minCheckCandlePrice'] < new_down_BuyPrice) {
                    console.log('171:min_check_candle option apply=',botList[indexBot_trading]['minCheckCandlePrice']);
                    new_down_BuyPrice = Math.floor(botList[indexBot_trading]['minCheckCandlePrice'] * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                    //console.log('174:botList['+indexBot_trading+']["price"]=',botList[indexBot_trading]['price']);
                    //console.log('175:new_down_BuyPrice_mincheck=',new_down_BuyPrice);
                }
            }
            if(botList[indexBot_trading]['filled_buy_order']>0){
                let sym=botList[indexBot_trading].sym
                let min_buy=getLowestBuyPrice(sym);
                if(min_buy<new_down_BuyPrice && min_buy>0){
                    console.log('173:min_buy apply=',min_buy);
                    new_down_BuyPrice = Math.floor(0.998*min_buy * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow']; 
                }
            }
            // --------------------------------------------------
            let mathIQ=Math.pow((1+botList[indexBot_trading]['IQ']/100),botList[indexBot_trading]['filled_buy_order']);
            console.log('428:mathIQ=',mathIQ);
            // let buyQuantity=botList[indexBot_trading]['FirstQuantity']*mathIQ;
            // let RDPB=1-(DPB_coeff)/100;
            // let neededQuantity=buyQuantity*(RDPB*botList[indexBot_trading]['price']);
            let neededQuantity=(botList[indexBot_trading]['quantity'])*mathIQ/(new_down_BuyPrice);
            console.log('418:neededQuantity0=',neededQuantity);
            console.log('419:neededQuantity1=',(botList[indexBot_trading]['quantity'])*mathIQ/(new_down_BuyPrice));
            BuyPriceQuantity.price=new_down_BuyPrice;
            BuyPriceQuantity.quantity=neededQuantity
            console.log('448:BuyPriceQuantity=',BuyPriceQuantity)
            return BuyPriceQuantity

        }
        
    }
    // ===================end of BP_calculation================
        // -----------------------------------------------------------------
    // -------------------------------------------------------
    // ==============Start of buy_follow_check========
    async function buy_follow_check(indexBot,old_price){
        if(botList[indexBot]['softBuy']==false){
            if((botList[indexBot]['nCC']>0 && botList[indexBot]['price']<=botList[indexBot]['closeUpCheckCandle']) || (botList[indexBot]['nCC']=='0')){
                if (botList[indexBot]['price'] != old_price){
                    if (botList[indexBot]['filled_buy_order']<= botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false) {
                        // console.log('74:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
                        let new_buy_order_data_info=newBuyOrderDataInfo(indexBot);
                        // console.log("444=new_buy_order_data_info",new_buy_order_data_info)
                        if(Object.keys(new_buy_order_data_info).length == 0){
                            new_buy_order_data_info.buyOrderId='NoId';
                        }
                        if (new_buy_order_data_info.buyOrderId !='NoId'){
                            let found=outPutData.some(bot => bot.sym === botList[indexBot]['sym'] && (bot.buyStatus==='new' || bot.buyStatus==='partiallyFilled'));
                            if (found){
                                let diff_buy_spot=botList[indexBot]['diff_buy_spot'];
                                // console.log('10:botList['+indexBot+']["price"]='+botList[indexBot]['price']);
                                // console.log('10:new_buy_order_data_info.buyOrderId='+new_buy_order_data_info.buyOrderId);
                                // console.log('11:new_buy_order_data_info.buyPrice='+new_buy_order_data_info.buyPrice);
                                // console.log('12:diff_buy_spot='+diff_buy_spot);
                                // console.log('13:(10:botList[indexBot]["price"] - new_buy_order_data_info.buyPrice) - diff_buy_spot=',((botList[indexBot]['price'] - new_buy_order_data_info.buyPrice) - diff_buy_spot));
                                if((botList[indexBot]['price'] - new_buy_order_data_info.buyPrice) - diff_buy_spot > 0){
                                    // await buy_follow(indexBot,diff_buy_spot);
                                    console.log("14:buy_follow should start:");
                                    await buy_follow(indexBot,diff_buy_spot,new_buy_order_data_info);
                                }

                            }else{
                                console.log('475:can not found order in outPutData with bot sym=',botList[indexBot]['sym']);
                            }
                            
                        
                        }
                    } else if(botList[indexBot]['filled_buy_order']>= botList[indexBot]['MO'] ){
                        console.log('27:filled_buy_order=' + (botList[indexBot]['filled_buy_order']) + '>max_order=' + botList[indexBot]['MO']);

                    }

                }
                //console.log(botList[indexBot]['sym']+':'+ 'botList[indexBot]["price"]: ' + botList[indexBot]["price"]+'         '+'  filled_buy_order=' + (botList[indexBot]['filled_buy_order']) + '   ' + 'max_order=' +botList[indexBot]['MO']);
            }else if(botList[indexBot]['price']>botList[indexBot]['closeUpCheckCandle']){
                console.log('842:buy follow is not done:(SpotPrice='+botList[indexBot]['price']+')>(closeUpCheckCandle='+botList[indexBot]['closeUpCheckCandle'])
            }

        }
    }
    // ==================end of buy_follow_check============================
    // -----------------------------------------------------------------
    // ------------------------------------------------
    // ==============Start of sell_followUp_check========
    async function sell_follow_checkUp(indexBot,old_price){
        if(botList[indexBot]['sell_follow_up_Price'] || botList[indexBot]['sell_follow_up_Percent']){
            // console.log("433:botList[indexBot]['sell_follow_up']",botList[indexBot]['sell_follow_up']);
            if (botList[indexBot]['price'] != old_price){
                if (botList[indexBot]['filled_buy_order']>0) {
                    let new_sell_order_data_info
                    let sell_follow_up_buy_id=botList[indexBot]['sell_follow_up_buy_id'];
                    console.log("401:sell_follow_up_buy_id=",sell_follow_up_buy_id);
                    if(sell_follow_up_buy_id == '' && (botList[indexBot]['filled_buy_order'] >= botList[indexBot].NSO)){
                        console.log("402:botList[indexBot].NSO=",botList[indexBot].NSO);
                        new_sell_order_data_info=newSellOrderDataInfo(indexBot);
                    }else{
                        let found=outPutData.some(order => order.buyOrderId === sell_follow_up_buy_id);
                        if(found){
                            new_sell_order_data_info=outPutData.find(order => order.buyOrderId === sell_follow_up_buy_id);
                        }else{
                            sell_follow_up_buy_id ='';
                            new_sell_order_data_info=newSellOrderDataInfo(indexBot);
                        }
                        // console.log("402:new_sell_order_data_info.buyOrderId=",new_sell_order_data_info.buyOrderId);
                    }
                    // console.log("430:diff_sell_spot",diff_sell_spot);
                    
                    let SSFU0=botList[indexBot].SSFU0;
                    // console.log("430:sym=",botList[indexBot]['sym']);
                    // console.log("431:new_sell_order_data_info",new_sell_order_data_info);
                    if(Object.keys(new_sell_order_data_info).length == 0){
                        new_sell_order_data_info.sellOrderId='NoId';
                    }
                    if (new_sell_order_data_info.sellOrderId !='NoId'){
                        let found=outPutData.some(order => order.sellOrderId === new_sell_order_data_info.sellOrderId);
                        // console.log('439:found=' + found);
                        if(found){
                            if((new_sell_order_data_info.sellStatus == 'new') && (new_sell_order_data_info.buyOrderId != sell_follow_up_buy_id) && (sell_follow_up_buy_id == '') && (botList[indexBot]['filled_buy_order'] >= botList[indexBot].NSO)){
                                // console.log('434:-----new');
                                let SSFU=botList[indexBot]['SSFU'];
                                let diff_sell_spot=100*(parseFloat(new_sell_order_data_info.sellPrice)-botList[indexBot]['price'])/(botList[indexBot]['price'])
                                // console.log("435:diff_sell_spot",diff_sell_spot);
                                if(diff_sell_spot<0.25){
                                    console.log('429:'+botList[indexBot]['sym']+'-----start suspended');
                                    console.log('421:spotPrice='+botList[indexBot]['price']);
                                    botList[indexBot]['sell_follow_up_buy_id']=new_sell_order_data_info.buyOrderId;
                                    // botList[indexBot]['diff_stop_spot']=botList[indexBot]['price']-stopPrice;
                                    botList[indexBot].suspend_inner_cancel_status=true;
                                    cancel_order(new_sell_order_data_info.sellOrderId);
                                }

                            }else if((new_sell_order_data_info.sellStatus == 'suspended') && (new_sell_order_data_info.buyOrderId == sell_follow_up_buy_id)){
                                // --------------------
                                // console.log('430:'+botList[indexBot]['sym']+'-----suspended');
                                // console.log('431:SSFU=',botList[indexBot]['Temporary_SSFU']);
                                let profit=100*Math.abs(botList[indexBot]['price']-parseFloat(new_sell_order_data_info.buyPrice))/botList[indexBot]['price'];
                                if(parseFloat(new_sell_order_data_info.buyPrice) < botList[indexBot]['price'] && profit>botList[indexBot]['TPSFU']){
                                    let SSFU
                                    if(botList[indexBot]['Temporary_SSFU']>botList[indexBot].SSFU0){
                                        SSFU=botList[indexBot].SSFU0;
                                    }else{
                                        // console.log('189:profit=',profit);
                                        // console.log('190:botList[indexBot].TPSFU=',botList[indexBot].TPSFU);
                                        let new_SSFU=((botList[indexBot].TPSFU)/profit)*botList[indexBot].SSFU0;
                                        if(new_SSFU<botList[indexBot]['Temporary_SSFU']){
                                            SSFU=new_SSFU
                                        }else{
                                            SSFU=botList[indexBot]['Temporary_SSFU'];
                                        }
                                    }
                                    console.log('402:SSFU=',SSFU);
                                    let diff_spot_stop=100*(parseFloat((botList[indexBot]['price']-new_sell_order_data_info.sellPrice))/(new_sell_order_data_info.sellPrice));
                                    let diff_old_new_spot_stop=100*Math.abs((diff_spot_stop-SSFU)/(SSFU));
                                    console.log("439:diff_spot_stop",diff_spot_stop);
                                    console.log("442:diff_old_new_spot_stop",diff_old_new_spot_stop);
                                    let divergenceSSFU=30;
                                    if(diff_spot_stop>0  && diff_spot_stop>SSFU && diff_old_new_spot_stop>divergenceSSFU){
                                        botList[indexBot].suspend_inner_cancel_status=true;
                                        cancel_order(new_sell_order_data_info.sellOrderId) 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //  ==============end of sell_followUp_check========
    // -----------------------------------------------------------------
    // ------------------------------------------------
    // ==============Start of sell_followUp_check======== 
    async function sell_follow_up_ReplaceSellOrder_Stop(orderInfo,indexBot){
        let new_sell_order_data_info;
        let buyClient_orderInfo=orderInfo.client_order_id.substring(orderInfo.client_order_id.length-12)
        let buyOrderInfo=outPutData.find(order => ((order.sym == orderInfo.symbol) && (order.buyOrderId.substring(order.buyOrderId.length-12) == buyClient_orderInfo)))
        let sell_follow_up_buy_id=botList[indexBot]['sell_follow_up_buy_id'];
        console.log("401:sell_follow_up_buy_id=",sell_follow_up_buy_id);
        let SSFU0=botList[indexBot].SSFU0;
        if((orderInfo.client_order_id.substring(0,6) != 'SrSell')){
            // console.log('434:-----new');
            let SSFU=botList[indexBot]['SSFU'];
            let SSFU_Price=botList[indexBot].SSFU_Price;
            // console.log("435:diff_sell_spot",diff_sell_spot);
            console.log('429:'+botList[indexBot]['sym']+'-----start suspended');
            console.log('421:spotPrice='+botList[indexBot]['price']);
            console.log('399:SSFU=',SSFU);
            let profit=100*Math.abs(botList[indexBot]['price']-parseFloat(buyOrderInfo.buyPrice))/botList[indexBot]['price'];
            console.log('400:profit='+profit);
            if(parseFloat(buyOrderInfo.buyPrice) < botList[indexBot]['price'] && profit>botList[indexBot]['TPSFU']){
                SSFU=SSFU0;
                console.log('401:SSFU=',SSFU);
            }
            let stopPrice
            if(botList[indexBot]['sell_follow_up_Percent']){
                stopPrice = Math.floor((1-SSFU/100)*botList[indexBot]['price'] * botList[indexBot]['roundPricePow']) / botList[indexBot]['roundPricePow'];

            }else if(botList[indexBot]['sell_follow_up_Price']){
                stopPrice = Math.floor(SSFU_Price* botList[indexBot]['roundPricePow']) / botList[indexBot]['roundPricePow'];
            }
            let IranDate = new Date(Date.now()+12600000);
            alertErrorBot.unshift({id: uuid.v4(), msg: +IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +':'+botList[indexBot]['sym']+':market-sell follow up: start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')'});
            console.log('412:'+botList[indexBot]['sym']+':market-sell follow up: start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')')
            // console.log("438:old_sellOrder_Id",new_sell_order_data_info.sellOrderId); 
            // console.log("437:new_sell_price",new_sell_price);
            
            botList[indexBot]['sell_follow_up_buy_id']=buyOrderInfo.buyOrderId;
            // botList[indexBot]['diff_stop_spot']=botList[indexBot]['price']-stopPrice;
            botList[indexBot]['Temporary_SSFU']=SSFU;
            console.log("441:botList[indexBot]['Temporary_SSFU']=",SSFU);
            ReplaceSellOrder_Stop(orderInfo.client_order_id, stopPrice, orderInfo.quantity,indexBot);
            console.log("444:suspend_inner_cancel_status=",botList[indexBot].suspend_inner_cancel_status);
        }else{
            // --------------------
            // console.log('430:'+botList[indexBot]['sym']+'-----suspended');
            // console.log('431:SSFU=',botList[indexBot]['Temporary_SSFU']);
            let profit=100*Math.abs(botList[indexBot]['price']-parseFloat(buyOrderInfo.buyPrice))/botList[indexBot]['price'];
            let SSFU
            if(botList[indexBot]['Temporary_SSFU']>botList[indexBot].SSFU0){
                SSFU=botList[indexBot].SSFU0;
            }else{
                // console.log('189:profit=',profit);
                // console.log('190:botList[indexBot].TPSFU=',botList[indexBot].TPSFU);
                let new_SSFU=((botList[indexBot].TPSFU)/profit)*botList[indexBot].SSFU0;
                if(new_SSFU<botList[indexBot]['Temporary_SSFU']){
                    SSFU=new_SSFU
                }else{
                    SSFU=botList[indexBot]['Temporary_SSFU'];
                }
            }
            console.log('403:SSFU=',SSFU);
            let stopPrice = Math.floor((1-SSFU/100)*botList[indexBot]['price'] * botList[indexBot]['roundPricePow']) / botList[indexBot]['roundPricePow'];
            // console.log('446:-----diff_spot_stop>0');
            let IranDate = new Date(Date.now()+12600000);
            alertErrorBot.unshift({id: uuid.v4(), msg: +IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +':'+botList[indexBot]['sym']+':market-sell follow up:SSFU0='+parseFloat(SSFU).toFixed(3)+': start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')'});
            console.log('413:'+botList[indexBot]['sym']+':market-sell follow up:'+'SSFU0='+parseFloat(SSFU).toFixed(3)+ ':'+'start=('+botList[indexBot]['price']+')-stop=('+stopPrice+')');
            // console.log("441:old_sellOrder_Id",new_sell_order_data_info.sellOrderId); 
            // console.log("437:new_sell_price",new_sell_price);
            botList[indexBot]['Temporary_SSFU']=SSFU;
            // console.log("443:botList[indexBot]['Temporary_SSFU']=",SSFU);
            ReplaceSellOrder_Stop(orderInfo.client_order_id,stopPrice, orderInfo.quantity,indexBot);
            console.log("445:suspend_inner_cancel_status=",botList[indexBot].suspend_inner_cancel_status);
        }
        
    }
    //  ==============end of sell_followUp_check========
    // -----------------------------------------------------------------
    //------------------------------------
    // ==============Start of foud_LowQuantity_bot_func========
    async function foud_LowQuantity_bot_func(){
        await Promise.all(botList.map(async (bot) =>  {
            if(bot.quantity_low){
                console.log('814:'+bot.sym+':quantity_low='+bot.quantity_low);
                let indexBot_trading=botList.indexOf(bot);
                let sym=bot.sym;
                console.log('815:'+indexBot_trading+':buy_order_is_done='+botList[indexBot_trading].buy_order_is_done);
                if((botList[indexBot_trading]['delete_buttom'] == false) &&(botList[indexBot_trading]['stop_buttom'] == false) && ((botList[indexBot_trading]['filled_buy_order']) < (botList[indexBot_trading]['MO'])) && (botList[indexBot_trading].buy_order_is_done == false)){
                    console.log('816:'+bot.sym+':indexBot_trading=',indexBot_trading);
                    // botList[indexBot_trading]['quantity_low']=false;
                    // await douwn_percent_order_buy(indexBot_trading);
                    // //console.log('817:'+bot.sym+':quantity_low='+bot.quantity_low);
                    let Free_fund=await balance_update_symR(indexBot_trading,'symR');
                    let new_buyQuantity=Free_fund/botList[indexBot_trading]['price'];
                    let roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                    //console.log('258:roundQuantity='+roundQuantity);
                    if (roundQuantity<2){
                        let symR=symRL_Func(indexBot_trading,'symR')
                        console.log('482:Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                        alertErrorBot.unshift({id: uuid.v4(), msg: 'Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund});
                        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                        return;
                    }else{
                        botList[indexBot_trading]['quantity_low']=false;
                        console.log('828:'+bot.sym+':quantity_low='+bot.quantity_low);
                        await douwn_percent_order_buy(indexBot_trading);
                    }
                }
            }}
        ))
    }
    // ==========================================
    // ---------------------------------
    //------------------------------------
    // ==============start of profit caculation========
    function profitCalculation(filledSellOrder){
        filledSellOrder.buySumTradeQuantity= null;
        filledSellOrder.buySumTradeFee= null;
        filledSellOrder.sellSumTradeQuantity= null;
        filledSellOrder.sellSumTradeFee= null;
        console.log('839:BuyOrderId=',filledSellOrder.buyOrderId);
        console.log('840:SellOrderId=',filledSellOrder.sellOrderId);
        console.log('849:filledSellOrder.buytradeProb=',filledSellOrder.buytradeProb);
        filledSellOrder.buytradeProb
        filledSellOrder.buytradeProb.forEach(tradePropObj=> {
            console.log('841:tradePropObj=',tradePropObj);
            if(Object.keys(tradePropObj).length != 0){
                let profitBuyRaw=parseFloat(tradePropObj.buyTradeQuantity*tradePropObj.buyTradePrice);
                filledSellOrder.buySumTradeQuantity=filledSellOrder.buySumTradeQuantity+profitBuyRaw;
                filledSellOrder.buySumTradeFee=filledSellOrder.buySumTradeFee+parseFloat(tradePropObj.buyTradeFee);   
            }else{
                console.log('894:tradePropObj=',tradePropObj);
                console.log('895:buyOrderId=',filledSellOrder.buyOrderId);
                let id=filledSellOrder.buyOrderId
                alertErrorBot.unshift({id: uuid.v4(), msg:"emty tradePropObj(buyOrderId):",id});
                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            }
            
        });
        filledSellOrder.selltradeProb.forEach(tradePropObj=> {
            console.log('842:tradePropObj=',tradePropObj);
            if(Object.keys(tradePropObj).length != 0){
                let profitSellRaw=parseFloat(tradePropObj.sellTradeQuantity*tradePropObj.sellTradePrice);
                filledSellOrder.sellSumTradeQuantity=filledSellOrder.sellSumTradeQuantity+profitSellRaw;
                filledSellOrder.sellSumTradeFee=filledSellOrder.sellSumTradeFee+parseFloat(tradePropObj.sellTradeFee);
            }else{
                console.log('896:tradePropObj=',tradePropObj);
                console.log('897:sellOrderId=',filledSellOrder.sellOrderId);
                let id=filledSellOrder.sellOrderId
                alertErrorBot.unshift({id: uuid.v4(), msg:"emty tradePropObj(sellOrderId):",id});
                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            }
        });
        let buyPrice_mean=filledSellOrder.buySumTradeQuantity/filledSellOrder.buyQuantityBase;
        let sellPrice_mean=filledSellOrder.sellSumTradeQuantity/filledSellOrder.sellQuantityBase;
        let profitValue=(filledSellOrder.sellSumTradeQuantity-filledSellOrder.buySumTradeQuantity-filledSellOrder.buySumTradeFee-filledSellOrder.sellSumTradeFee);
        filledSellOrder.profitValue=profitValue;
        let profitPercent=(filledSellOrder.sellSumTradeQuantity-filledSellOrder.buySumTradeQuantity-filledSellOrder.buySumTradeFee-filledSellOrder.sellSumTradeFee)/(filledSellOrder.buySumTradeQuantity+filledSellOrder.buySumTradeFee+filledSellOrder.sellSumTradeFee)*100;
        filledSellOrder.profitPercent=profitPercent;
        filledSellOrder.buyPrice=buyPrice_mean;
        filledSellOrder.sellPrice=sellPrice_mean;
    }
    // ==============end of profit caculation========
    // ---------------------------------
    //------------------------------------
    // ==============start of newBuyOrderDataInfo========
    function newBuyOrderDataInfo(indexBot){
        
        try{
            let new_buy_order_data_info={};
            let sym=botList[indexBot]["sym"];
            let foundBuyOrder= outPutData.some(order => (((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled'))) && (order.sym === sym));
            if (foundBuyOrder){
                new_buy_order_data_info= outPutData.find(order => (((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled'))) && (order.sym === sym));
                return new_buy_order_data_info
            }else{
                return new_buy_order_data_info
            }

        }catch(e){
            console.log("759=",e)
        }
        

    }
                                    
    // ==============end of newBuyOrderDataInfo======== 
    //------------------------------------
    // ==============start of newSellOrderDataInfo========
    function newSellOrderDataInfo(indexBot){
        
        try{
            let new_sell_order_data_info={};
            let sym=botList[indexBot]["sym"];
            let new_all_sell_orders_info=new Array();
                // console.log('785:buySellData=',buySellData)
            let foundSellOrder= outPutData.some(order => (((order.sellStatus=='new')|| (order.sellStatus=='suspended'))) && (order.sym === sym));
            if (foundSellOrder){
                new_all_sell_orders_info= outPutData.filter(order => (((order.sellStatus=='new')|| (order.sellStatus=='suspended'))) && (order.sym === sym));
                new_sell_order_data_info=new_all_sell_orders_info[0];
                // console.log('460:new_all_sell_orders_info',new_all_sell_orders_info);
                // console.log('461:new_sell_order_data_info',new_sell_order_data_info);
                new_all_sell_orders_info.forEach(sell_order_info =>{
                    // console.log('462:sell_order_info',sell_order_info);
                    // console.log('464:new_sell_order_data_info.buyPrice',parseFloat(new_sell_order_data_info.buyPrice));
                    // console.log('465:parseFloat(new_sell_order_data_info.buyPrice)',parseFloat(new_sell_order_data_info.buyPrice));
                    if(parseFloat(sell_order_info.buyPrice)<parseFloat(new_sell_order_data_info.buyPrice)){
                        new_sell_order_data_info=sell_order_info;
                        // console.log('463:new_sell_order_data_info',new_sell_order_data_info);
                    }
                } )
                // console.log('445:new_all_sell_orders_info=',new_all_sell_orders_info);
                return new_sell_order_data_info
            }else{
                return new_sell_order_data_info
            }

        }catch(e){
            console.log("759=",e)
        }
        

    }                     
    // ==============end of newSellOrderDataInfo======== 
    //------------------------------------
    //------------------------------------
    // ==============start of symR_Func()========
    function symRL_Func(indexBot,symRL){
        let sym = botList[indexBot]['sym'];
        let symR
        let symL
        if (sym.substr(sym.length - 4) == "USDT" || sym.substr(sym.length - 4) == "BUSD" || sym.substr(sym.length - 4) == "TUSD" || sym.substr(sym.length - 4) == "USDC" || sym.substr(sym.length - 4) == "BIDR" || sym.substr(sym.length - 4) == "IDRT"
        || sym.substr(sym.length - 4) == "EURS" || sym.substr(sym.length - 4) == "BKRW") {
            symR = sym.substr(sym.length - 4);
            // botList[indexBot]['symR']=symR;
            symL = sym.substr(0, sym.length - 4);
            // botList[indexBot]['symL']=symL;
        } else {
            symR = sym.substr(sym.length - 3);
            // botList[indexBot]['symR']=symR
            symL = sym.substr(0, sym.length - 3);
            // botList[indexBot]['symL']=symL;

        }
        if(symRL == 'symR'){
            return symR
        }else{
            return symL
        }
        

    }
    // ================end of newSellOrderDataInfo======================
    //------------------------------------
    //------------------------------------
    // ================start of erase_sell_follow_up_buy_id=============
    function erase_sell_follow_up_buy_id(indexBot,sell_order_id){
        let buyOrderId_Stop=sell_order_id.substring(sell_order_id.length-12)
        let sell_follow_up_buy_id=botList[indexBot]['sell_follow_up_buy_id'];
        console.log('593:buyOrderId_Stop=',buyOrderId_Stop);
        console.log('594:sell_follow_up=',sell_follow_up_buy_id.substring(sell_follow_up_buy_id.length-12));
        if(sell_follow_up_buy_id.substring(sell_follow_up_buy_id.length-12) == buyOrderId_Stop){
            botList[indexBot]['sell_follow_up_buy_id']='';
        }
    }
    // =============end of erase_sell_follow_up_buy_id=============
    //------------------------------------
    //------------------------------------
    // ================start of checkingOrders=============
    async function checkingOrders(orders){
        let botClientOrderIdBS= new Array();
        // console.log('412:orders=',orders)
        await Promise.all(outPutData.map(async (outPutData_Order) =>  {
            let indexBot_trading= finding_indexBot_trading(outPutData_Order.sym);
            console.log('122:indexBot_trading=',indexBot_trading);
            console.log('123:sym=',outPutData_Order.sym);
            console.log('124:outPutData_Order=',outPutData_Order);
            let index_order=outPutData.indexOf(outPutData_Order)
            console.log('125:index_order=',index_order);
            if((outPutData_Order.buyStatus === 'new' || outPutData_Order.buyStatus === 'partiallyFilled')){
                let foundOrder=orders.some(order =>(order.client_order_id === outPutData_Order.buyOrderId));
                if(foundOrder){
                    botClientOrderIdBS.push(outPutData_Order.buyOrderId)
                    if(botList[indexBot_trading]['softBuy']){
                        let diff_time=Date.now()-Date.parse(outPutData_Order.buyTime);
                        if(diff_time>(1000*botList[indexBot_trading]['TBF']+5000)){
                            let newOrder=orders.find(order => order.client_order_id === outPutData_Order.buyOrderId);
                            let orderInfo=orderInfoBuild(newOrder,'spot_orders');
                            console.log('477:outPutData_Order.buyOrderId=',outPutData_Order.buyOrderId);
                            await buyNew(orderInfo,indexBot_trading)
                        }
                    }
                }else{
                    let foundBuyOrder=orders.some(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'buy') && order.client_order_id.length <32));
                    if(foundBuyOrder){
                        let newOrder=orders.find(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'buy') && order.client_order_id.length <32));
                        newOrder.report_type='replaced';
                        newOrder.original_client_order_id=outPutData_Order.buyOrderId;
                        let orderInfo=orderInfoBuild(newOrder,'spot_order');
                        console.log('476:orderInfo=',orderInfo);
                        outPutData_update(orderInfo,indexBot_trading);
                        botClientOrderIdBS.push(newOrder.client_order_id)
                        await buyNew(orderInfo,indexBot_trading);
                    }else{
                        let Free_fund=await balance_update_symR(indexBot_trading,'symL');
                        if (outPutData_Order.buyQuantityBase <= Free_fund){
                            console.log('478:outPutData_Order.buyOrderId=',outPutData_Order.buyOrderId);
                            // outPutData_Order.buyStatus='filled'
                            let orderInfo=orderInfoBuild_buyFilled(outPutData_Order,'spot_orders');
                            console.log('479:orderInfo=',orderInfo);
                            console.log('480:outPutData=',outPutData);
                            outPutData_update(orderInfo,indexBot_trading);
                            console.log('481:outPutData=',outPutData);
                            await buyFilled(orderInfo,indexBot_trading);
                        }
                    } 
                }
            }
            if(outPutData_Order.buyStatus === 'filled' && outPutData_Order.sellStatus === '' ){
                outPutData.splice(index_order, 1);
                checking_filled_buy_order(outPutData_Order.sym,indexBot_trading)
            }
            if(outPutData_Order.sellStatus === 'new' || outPutData_Order.sellStatus === 'partiallyFilled'){
                let foundOrder=orders.some(order =>(order.client_order_id === outPutData_Order.sellOrderId));
                if(foundOrder){
                    botClientOrderIdBS.push(outPutData_Order.sellOrderId)
                    let diff_time=Date.now()-Date.parse(outPutData_Order.sellTime);
                    if((diff_time>(1000*botList[indexBot_trading]['TSF1']+10000) && (botList[indexBot_trading]['softSell'] == true)) || diff_time>(1000*botList[indexBot_trading]['TSF0']+5000)){
                        console.log('496:outPutData_Order.sellOrderId=',outPutData_Order.sellOrderId)
                        let newOrder=orders.find(order => order.client_order_id === outPutData_Order.sellOrderId)
                        let orderInfo=orderInfoBuild(newOrder,'spot_orders');
                        await sellNew(orderInfo,indexBot_trading)
                    }
                    
                }else{
                    let buyClient_OutPutData=outPutData_Order.buyOrderId.substring(outPutData_Order.buyOrderId.length-12)
                    let foundSellOrder=orders.some(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'sell') && (order.client_order_id.length <32) && (order.client_order_id.substring(order.client_order_id.length-12) == buyClient_OutPutData)));
                    if(foundSellOrder){
                        let newOrder=orders.find(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'sell') && (order.client_order_id.length <32) && (order.client_order_id.substring(order.client_order_id.length-12) == buyClient_OutPutData)));
                        newOrder.report_type='replaced';
                        newOrder.original_client_order_id=outPutData_Order.sellOrderId;
                        let orderInfo=orderInfoBuild(newOrder,'spot_order');
                        console.log('476:orderInfo=',orderInfo);
                        outPutData_update(orderInfo,indexBot_trading);
                        botClientOrderIdBS.push(newOrder.client_order_id)
                        await sellNew(orderInfo,indexBot_trading);
                        
                    }else{
                        console.log('149:outPutData_Order=',outPutData_Order);
                        console.log('150:buyClient_OutPutData=',buyClient_OutPutData);
                        console.log('151:foundSellOrder=',foundSellOrder);
                    }
                }
            }else if(outPutData_Order.sellStatus === 'suspended'){
                let foundOrder=orders.some(order => order.client_order_id === outPutData_Order.sellOrderId)
                if(foundOrder){
                    botClientOrderIdBS.push(outPutData_Order.sellOrderId);
                    botList[indexBot_trading].sell_follow_up_buy_id=outPutData_Order.buyOrderId;
                }else{
                    let foundSuspendedOrder=orders.some(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'suspended') && (order.client_order_id.length <32)));
                    if(foundSuspendedOrder){
                        let newOrder=orders.find(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'suspended') && (order.client_order_id.length <32)));
                        newOrder.report_type='suspended';
                        outPutData_Order[index_order].sellStatus='';
                        let orderInfo=orderInfoBuild(newOrder,'spot_order');
                        console.log('478:orderInfo=',orderInfo);
                        botList[indexBot_trading].sell_follow_up_buy_id=outPutData_Order.buyOrderId;
                        outPutData_update(orderInfo,indexBot_trading);
                        botClientOrderIdBS.push(newOrder.client_order_id);
                    }else{
                        let buyClient_OutPutData=outPutData_Order.buyOrderId.substring(outPutData_Order.buyOrderId.length-12)
                        let foundSellOrder=orders.some(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'sell') && (order.client_order_id.length <32) && (order.client_order_id.substring(order.client_order_id.length-12) == buyClient_OutPutData)));
                        if(foundSellOrder){
                            let newOrder=orders.find(order =>((order.symbol === outPutData_Order.sym) && (order.side === 'sell') && (order.client_order_id.length <32) && (order.client_order_id.substring(order.client_order_id.length-12) == buyClient_OutPutData)));
                            newOrder.report_type='replaced';
                            newOrder.original_client_order_id=outPutData_Order.sellOrderId;
                            let orderInfo=orderInfoBuild(newOrder,'spot_order');
                            console.log('483:orderInfo=',orderInfo);
                            outPutData_update(orderInfo,indexBot_trading);
                            botClientOrderIdBS.push(newOrder.client_order_id)
                            await sellNew(orderInfo,indexBot_trading);
                            
                        }else{
                            console.log('480:outPutData_Order=',outPutData_Order);
                            console.log('481:buyClient_OutPutData=',buyClient_OutPutData);
                            console.log('482:foundSellOrder=',foundSellOrder);
                        }
                    } 
                }
                
            }
        }));
        // await Promise.all(orders.map(async(order) =>{
        //     let indexBot_trading= finding_indexBot_trading(order.symbol);
        //     console.log('123:indexBot_trading=',indexBot_trading);
        //     console.log('124:sym=',order.symbol);
        //     if(order.client_order_id.length <32){
        //         if(order.side === 'buy'){
        //             let foundOrder=outPutData.some(outPutData_Order =>(outPutData_Order.buyOrderId === order.client_order_id)); 
        //             if(foundOrder){
        //                 botClientOrderIdBS.push(order.client_order_id)
        //                 if(botList[indexBot_trading]['softBuy']){
        //                     let diff_time=Date.now()-Date.parse(order.updated_at);
        //                     if(diff_time>(1000*botList[indexBot_trading]['TBF']+5000)){
        //                         let newOrder=outPutData.find(outPutData_Order => outPutData_Order.buyOrderId == order.client_order_id);
        //                         let orderInfo=orderInfoBuild(newOrder,'spot_orders');
        //                         console.log('477:outPutData_Order.buyOrderId=',outPutData_Order.buyOrderId);
        //                         await buyNew(orderInfo,indexBot_trading)
        //                     }
        //                 }
        //             }else{
        //                 let foundBuyOrder=outPutData.some(outPutData_Order =>((outPutData_Order.sym === order.symbol) && ((outPutData_Order.buyStatus === 'new') || (outPutData_Order.buyStatus === 'partiallyFilled'))));
        //                 if(foundBuyOrder){
        //                     let outPutData_Order=outPutData.find(outPutData_Order =>((outPutData_Order.sym === order.symbol) && ((outPutData_Order.buyStatus === 'new') || (outPutData_Order.buyStatus === 'partiallyFilled'))));
        //                     botClientOrderIdBS.push(order.client_order_id)
        //                     order.report_type='replaced';
        //                     order.original_client_order_id=outPutData_Order.buyOrderId;
        //                     let orderInfo=orderInfoBuild(order,'spot_order');
        //                     console.log('476:orderInfo=',orderInfo);
        //                     outPutData_update(orderInfo,indexBot_trading);
        //                     await buyNew(orderInfo,indexBot_trading);
        //                 }else{
        //                     if((botList[indexBot_trading].filled_buy_order<botList[indexBot_trading].MO) && (botList[indexBot_trading].stop_buttom == false) ){
        //                         botClientOrderIdBS.push(order.client_order_id)
        //                         order.report_type='new';
        //                         let orderInfo=orderInfoBuild(order,'spot_order');
        //                         console.log('476:orderInfo=',orderInfo);
        //                         outPutData_update(orderInfo,indexBot_trading);
        //                         await buyNew(orderInfo,indexBot_trading);
        //                     }
        //                 } 
        //             }
        //         }else if(order.side === 'sell'){
        //             if((order.status === 'new') || (order.status === 'partiallyFilled') ){
        //                 let foundOrder=outPutData.some(outPutData_Order =>(outPutData_Order.sellOrderId === order.client_order_id)); 
        //                 if(foundOrder){
        //                     let diff_time=Date.now()-Date.parse(order.updated_at);
        //                     if(diff_time>(1000*botList[indexBot_trading]['TSF1']+5000) && diff_time>(1000*botList[indexBot_trading]['TSF0']+5000)){
        //                         console.log('473:order.client_order_id=',order.client_order_id)
        //                         let orderInfo=orderInfoBuild(order,'spot_orders');
        //                         await sellNew(orderInfo,indexBot_trading)
        //                     }
        //                 }else{
        //                     let buyClient_order=order.client_order_id.substring(order.client_order_id.length-12)
        //                     let foundSellOrder=outPutData.some(outPutData_Order =>((outPutData_Order.sym === order.symbol) && ((outPutData_Order.sellStatus === 'new') || (outPutData_Order.sellStatus === 'partiallyFilled')) && (outPutData_Order.sellOrderId.substring(outPutData_Order.sellOrderId-12) == buyClient_order)));
        //                     if(foundSellOrder){
        //                         let outPutData_Order=outPutData.some(outPutData_Order =>((outPutData_Order.sym === order.symbol) && ((outPutData_Order.sellStatus === 'new') || (outPutData_Order.sellStatus === 'partiallyFilled')) && (outPutData_Order.sellOrderId.substring(outPutData_Order.sellOrderId-12) == buyClient_order)));
        //                         order.report_type='replaced';
        //                         order.original_client_order_id=outPutData_Order.sellOrderId;
        //                         let orderInfo=orderInfoBuild(order,'spot_order');
        //                         console.log('476:orderInfo=',orderInfo);
        //                         outPutData_update(orderInfo,indexBot_trading);
        //                         botClientOrderIdBS.push(order.client_order_id)
        //                         await sellNew(orderInfo,indexBot_trading);
                                
        //                     }else{
        //                         console.log('149:order=',order);
        //                         console.log('150:buyClient_order=',buyClient_order);
        //                         console.log('151:foundSellOrder=',foundSellOrder);
        //                     }
        //                 }
                        
        //             }

        //         }
        //     }
            
        // }))
        // -----------------------------------------------

        await Promise.all(orders.map(async(order) =>{
            let indexBot_trading= finding_indexBot_trading(order.symbol);
            console.log('125:indexBot_trading=',indexBot_trading);
            console.log('126:sym=',order.symbol);
            if(order.client_order_id.length <32){
                if(order.side === 'buy'){
                    let foundOrder=outPutData.some(outPutData_Order =>(outPutData_Order.buyOrderId === order.client_order_id)); 
                    console.log('488:foundOrder=',foundOrder);
                    if(!foundOrder){
                        let foundBuyOrder=outPutData.some(outPutData_Order =>((outPutData_Order.sym === order.symbol) && ((outPutData_Order.buyStatus === 'new') || (outPutData_Order.buyStatus === 'partiallyFilled'))));
                        console.log('489:foundBuyOrder=',foundBuyOrder);
                        if(!foundBuyOrder){
                            if((botList[indexBot_trading].filled_buy_order<botList[indexBot_trading].MO) && (botList[indexBot_trading].stop_buttom == false) ){
                                botClientOrderIdBS.push(order.client_order_id)
                                order.report_type='new';
                                let orderInfo=orderInfoBuild(order,'spot_order');
                                console.log('496:orderInfo=',orderInfo);
                                outPutData_update(orderInfo,indexBot_trading);
                                await buyNew(orderInfo,indexBot_trading);
                            }
                        }
                    }
                }
                
            }
            
        }))
        let NewOutPutManualData=outPutData.filter(order => ((order.status == 'filled') || (order.status == 'partiallyFilled')));
        outPutManualData.splice(0, outPutManualData.length);
        outPutManualData.push(...NewOutPutManualData);
        orders.forEach(orderInfo => {
            if (orderInfo.client_order_id.length == 32){
                let foundOrder=outPutManualData.some(order=>order.orderId === orderInfo.client_order_id);
                if(!foundOrder){
                    let NewManualOrder={
                        orderId:orderInfo.client_order_id,
                        sym:orderInfo.symbol,
                        time:new Date(Date.parse(orderInfo.updated_at) +12600000),
                        price:orderInfo.price,
                        quantityBase:orderInfo.quantity,
                        quantity:orderInfo.quantity, 
                        status:orderInfo.status,
                        exchangeId:orderInfo.id,
                        side:orderInfo.side,
                    };
                    outPutManualData.push(NewManualOrder);
                }
            }else if(!botClientOrderIdBS.includes(orderInfo.client_order_id)){
                console.log('548:orderInfo.client_order_id=',orderInfo.client_order_id)
                let NewManualOrder={
                    orderId:orderInfo.client_order_id,
                    sym:orderInfo.symbol,
                    time:new Date(Date.parse(orderInfo.updated_at) +12600000),
                    price:orderInfo.price,
                    quantityBase:orderInfo.quantity,
                    quantity:orderInfo.quantity, 
                    status:orderInfo.status,
                    exchangeId:orderInfo.id,
                    side:orderInfo.side,
                };
                if(!manualClientOrderIdBS.includes(NewManualOrder.orderId)){
                    manualClientOrderIdBS.push(NewManualOrder.orderId);
                }
                outPutManualData.push(NewManualOrder);
            }

        })
    }
    // =============end of checkingOrders=============
    //------------------------------------
    //------------------------------------
    // ================start of orderInfoBuild=============
    function orderInfoBuild(NewOrder,method){
        let orderInfo={};
        orderInfo.method = method;
        orderInfo.id = NewOrder.id
        orderInfo.type=NewOrder.type;
        orderInfo.symbol = NewOrder.symbol;
        orderInfo.price = parseFloat(NewOrder.price);
        orderInfo.quantity = parseFloat(NewOrder.quantity);
        orderInfo.quantity_cumulative=parseFloat(NewOrder.quantity_cumulative);
        orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
        orderInfo.side = NewOrder.side;
        orderInfo.client_order_id = NewOrder.client_order_id;
        orderInfo.status = NewOrder.status;
        orderInfo.updated_at=NewOrder.updated_at;
        orderInfo.OldNew='Old';
        orderInfo.report_type=NewOrder.report_type;
        if (((NewOrder.status === 'filled') || (NewOrder.status === 'partiallyFilled')) && (NewOrder.report_type === 'trade') ){
            orderInfo.trade_id=NewOrder.trade_id;
            orderInfo.trade_quantity=parseFloat(NewOrder.trade_quantity);
            orderInfo.trade_price=parseFloat(NewOrder.trade_price);
            orderInfo.trade_fee=parseFloat(NewOrder.trade_fee);
        }
        if((NewOrder.status === 'suspended') && (NewOrder.type === 'stopMarket')){
            orderInfo.price=NewOrder.stop_price;
        }
        if((NewOrder.status === 'filled') && (NewOrder.type === 'stopMarket')){
            orderInfo.price=NewOrder.stop_price;
        }
        if(NewOrder.report_type === 'replaced' ){
            orderInfo.original_client_order_id=NewOrder.original_client_order_id;
        }
        return orderInfo

    }
    // =============end of orderInfoBuild=============
    //------------------------------------
    //------------------------------------
    // ================start of orderInfoSellBuild=============
    function orderInfoSellBuild(NewOrder,method){
        let orderInfo={};
        orderInfo.method = method;
        orderInfo.id = NewOrder.sellOrderId
        orderInfo.type='limit';
        orderInfo.symbol = NewOrder.sym;
        orderInfo.price = parseFloat(NewOrder.sellPrice);
        orderInfo.quantity = parseFloat(NewOrder.sellQuantityBase);
        orderInfo.quantity_cumulative=0;
        orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
        orderInfo.side = 'sell';
        orderInfo.client_order_id = NewOrder.sellOrderId;
        orderInfo.status = 'new';
        orderInfo.updated_at=NewOrder.updated_at;
        orderInfo.OldNew='Old';
        orderInfo.report_type='status';
        return orderInfo

    }
    // =============end of orderInfoSellBuild=============
    //------------------------------------
    //------------------------------------
    // ================start of orderInfoBuyBuild=============
    function orderInfoBuyBuild(NewOrder,method){
        let orderInfo={};
        orderInfo.method = method;
        orderInfo.id = NewOrder.buyOrderId
        orderInfo.type='limit';
        orderInfo.symbol = NewOrder.sym;
        orderInfo.price = parseFloat(NewOrder.buyPrice);
        orderInfo.quantity = parseFloat(NewOrder.buyQuantityBase);
        orderInfo.quantity_cumulative=0;
        orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
        orderInfo.side = 'buy';
        orderInfo.client_order_id = NewOrder.buyOrderId;
        orderInfo.status = 'new';
        orderInfo.updated_at=NewOrder.updated_at;
        orderInfo.OldNew='Old';
        orderInfo.report_type='status';
        return orderInfo
    }
    // =============end of orderInfoBuyBuild=============
    //------------------------------------
    //------------------------------------
    // ================start of orderInfoBuild_outPutData=============
    function orderInfoBuild_buyFilled(NewOrder,method){
        let orderInfo={};
        orderInfo.method = method;
        orderInfo.id = 1000;
        orderInfo.type='limit';
        orderInfo.symbol = NewOrder.sym;
        orderInfo.price = parseFloat(NewOrder.buyPrice);
        orderInfo.quantity = parseFloat(NewOrder.buyQuantityBase);
        orderInfo.quantity_cumulative=parseFloat(NewOrder.buyQuantityBase);
        orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
        orderInfo.side = 'buy';
        orderInfo.client_order_id = NewOrder.buyOrderId;
        orderInfo.status = 'filled';
        orderInfo.updated_at=NewOrder.updated_at;
        orderInfo.OldNew='Old';
        orderInfo.report_type='trade'
        orderInfo.trade_id=1000;
        orderInfo.trade_quantity=parseFloat(NewOrder.buyQuantityBase);
        orderInfo.trade_price=parseFloat(NewOrder.buyPrice);
        orderInfo.trade_fee=parseFloat(NewOrder.buyQuantity)*(NewOrder.buyPrice)*0.0002;
        return orderInfo

    }
    // =============end of orderInfoBuild_outPutData=============
    //------------------------------------
    //------------------------------------
    // ================start of spot_subscribe_Request=============
    async function spot_subscribe_Request(){
        
        setInterval(async ()=>{
            console.log('------------start spot')
            
            // console.log('421:spotOrders=',spotOrders);
            if(spotSbscripe){
                let spotOrders= await request_trading('spot_get_orders',{},20000,0);
                await checkingOrders(spotOrders);
            }
            // outPutData_building();
        }, 30000);
            console.log('------------end spot')
    }
    // =============end of spot_subscribe_Request=============
    //------------------------------------
    //------------------------------------
    // ================start of buyCanceled===========
    async function buyCanceled(orderInfo,indexBot_trading){
        //console.log('55:order cancelled')
        botList[indexBot_trading]['buy_order_is_done'] = false;
        botList[indexBot_trading]['softBuy'] = true;
        console.log('471:botList[indexBot_trading]["softBuy"]=',botList[indexBot_trading]['softBuy']);
        await foud_LowQuantity_bot_func();
        if (botList[indexBot_trading]['dead']==false){
            if (botList[indexBot_trading]['filled_buy_order']< botList[indexBot_trading]['MO'] && botList[indexBot_trading]['stop_buttom'] == false ) {   
                await douwn_percent_order_buy(indexBot_trading);
            }
        }

    }
    // ================end of buyCanceled===========
    // ---------------------------------------------
    //------------------------------------
    // ================start of sellCanceled===========
    async function sellCanceled(orderInfo,indexBot_trading){
        
        if(botList[indexBot_trading]['dead']==true){
            await SellOrder(orderInfo.price, orderInfo.quantity,indexBot_trading)
        }else{
            console.log('562:orderInfo.client_order_id=',orderInfo.client_order_id)
            erase_sell_follow_up_buy_id(indexBot_trading,orderInfo.client_order_id)
            await up_percent_order_sell(orderInfo,indexBot_trading);
        } 

    }
    // ================end of sellCanceled===========
    // -----------------------------------------------
    //------------------------------------
    // ================start of buyNew===========
    async function buyNew(orderInfo,indexBot_trading){
        if (botList[indexBot_trading]['buy_order_is_done'] == false){
            botList[indexBot_trading]['buy_order_is_done']=true;
        }
        if(botList[indexBot_trading]['quantity_low']){
            botList[indexBot_trading]['quantity_low']=false;
            console.log('245:quantity_low=',botList[indexBot_trading]['quantity_low'])
        }
        if (botList[indexBot_trading]['softBuy']==true){
            let data_buy = orderInfo;
            let sym=botList[indexBot_trading]['sym'];
            // -----------------------
            let mathIDPB
            let NBO
            NBO=botList[indexBot_trading]['NBO']
            if(botList[indexBot_trading]['filled_buy_order']+1>=NBO && NBO>1){
                NBO=botList[indexBot_trading]['filled_buy_order']+1
            }else{
                NBO=1
            }
            console.log('844:NBO=',NBO)
            if((botList[indexBot_trading]['Deep_dowun_buy'] === true) && (botList[indexBot_trading]['filled_buy_order']+1 == botList[indexBot_trading]['NDDB'])){
                mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order'])*(botList[indexBot_trading]['filled_buy_order']);
                console.log('810:mathIDPB=',mathIDPB)
            }else{
                mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/(100*NBO)),botList[indexBot_trading]['filled_buy_order']);
                console.log('811:mathIDPB=',mathIDPB)
            }
            let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
            console.log('894:DPB_coeff=',DPB_coeff);
            console.log('895:botList[indexBot_trading]=',botList[indexBot_trading]['price']);
            let newBuyPrice = (1 - DPB_coeff/ 100) * botList[indexBot_trading]['price'];
            let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
            // ---------------------
            console.log('712:roundPricePow=',botList[indexBot_trading]['roundPricePow']);
            console.log('713:spotPrice=',botList[indexBot_trading]['price']);
            console.log('714:data_buy.price=',parseFloat(data_buy.price));
            console.log('715:new_down_BuyPrice=',new_down_BuyPrice);
            if(data_buy.price<new_down_BuyPrice && botList[indexBot_trading]['SBF']>=0.1 && botList[indexBot_trading]['SDPB']>0 && botList[indexBot_trading]['TBF']>0){
                console.log('716:softBuy=',botList[indexBot_trading]['softBuy']);
                setTimeout(function () { soft_buy_follow(data_buy,sym) }, (botList[indexBot_trading]['TBF']) * 1000);
            }else{
                botList[indexBot_trading]['softBuy']=false;
                let foundOrder=outPutData.some(order => order.buyOrderId === orderInfo.client_order_id)
                if(foundOrder){
                    let ouputData_order=outPutData.find(order => order.buyOrderId === orderInfo.client_order_id)
                    let index_order=outPutData.indexOf(ouputData_order);
                    outPutData[index_order]['softBuy']=false;
                    //await stramWriteFunc(pathFile_botList,botList);;
                    console.log('348:botList[indexBot_trading]["softBuy"]=',botList[indexBot_trading]['softBuy']);
                }else{
                    console.log('349:outPutData=',outPutData)
                }
            }

        }
    }
    // ================end of buyNew===========
    // -----------------------------------------------
    //------------------------------------
    // ================start of sellNew===========
    async function sellNew(orderInfo,indexBot_trading){
        let data_sell = orderInfo;
        // console.log('data_sell-befor sell_follow',data_sell)
        let sym=botList[indexBot_trading]['sym'];
        // ---------------------
        let fonudOrder=outPutData.find(order => ((order.sellOrderId === data_sell.client_order_id) && (order.sym === sym)));
        let index_outPutData=outPutData.indexOf(fonudOrder)
        let buyPrice=fonudOrder.buyPrice;
        //console.log("753:buyPrice=" + buyPrice);
        let mathIUPS=Math.pow((1+botList[indexBot_trading]['IUPS']/100),fonudOrder.buyFilledNum-1);
        // console.log('765:mathIUPS=',mathIUPS)
        // -----------------------------------
        let coffFilled
        coffFilledCal();
        function coffFilledCal(){
            if((botList[indexBot_trading]['IntBot'] === 1) || (botList[indexBot_trading]['IntBot'] === 3) ){
                if(parseInt(botList[indexBot_trading]['filled_buy_order']) === 1){
                    coffFilled=1;
                }else{
                    // coffFilled=1+1/(Math.pow(2,fonudOrder.buyFilledNum-1)*10);
                    coffFilled=2-(fonudOrder.buyFilledNum)/(botList[indexBot_trading]['filled_buy_order'])
                    if(coffFilled<0.5){
                        coffFilled=0.5;
                    }
                    if(coffFilled>2){
                        coffFilled=2;
                    }
                }

            }else{
                coffFilled=1;
            }
            //console.log('478:coffFilled=',coffFilled)
        }
        
        // ---------------------

        let coffDiff;
        coffDiffCal(data_sell.price);
        // ------------------------
        function coffDiffCal(SP){
            let LP=botList[indexBot_trading]['price'];
            let BP=buyPrice;
            if((botList[indexBot_trading]['IntBot'] === 2) || (botList[indexBot_trading]['IntBot'] === 3) ){
                let diff_LP_BP=Math.abs((LP-BP)/(LP)*100);
                let diff_SP_Lp=Math.abs((SP-LP)/(SP)*100);
                if(LP>BP && SP>LP &&  diff_LP_BP>0.3 && diff_SP_Lp>0.3){
                    // coffDiff=Math.pow(2,Math.log((SP)/(botList[indexBot_trading]['price'])-1)-Math.log((botList[indexBot_trading]['price'])/buyPrice-1));
                    let SP_LP=Math.abs(1+(SP-LP)/(LP));
                    let LP_BP=Math.abs((LP-BP)/(BP));
                    coffDiff=Math.pow(SP_LP,0.1/LP_BP);
                    //console.log('477:coffDiff=',coffDiff);
                    if(coffDiff>3){
                        coffDiff=3;
                    }
                }else{
                    coffDiff=1
                }

            }else {
                coffDiff=1
            }
            
            //console.log('478:coffDiff=',coffDiff);

        }
        // ---------------------
        let Sellprice0 = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*botList[indexBot_trading]['SSF0']/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
        let diffSellprice0=Math.abs((Sellprice0-data_sell.price)/(data_sell.price)*100);
        
        
            
        // let NewUpPercentageSell = (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1'])- botList[indexBot_trading]['SSF0'];
        // let NewCoeffUPS = (1 + NewUpPercentageSell / 100) / (1 + (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1']) / 100);
        // let Sellprice0 = Math.ceil(NewCoeffUPS * data_sell.price * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
        // ---------------------
        let Sellprice1 = Math.ceil((1 + mathIUPS*(botList[indexBot_trading]['UPS1']) / 100) *(buyPrice)* botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                
        console.log("754:Sellprice0=" + Sellprice0);
        console.log("755:Sellprice1=" + Sellprice1);
        // console.log("756:0.995*Sellprice1=" + 0.995*Sellprice1);
        //console.log("756:data_sell.price=" + data_sell.price);
        //console.log("785:price=" + botList[indexBot_trading]['price']);
        //console.log("786:UPS0=" + botList[indexBot_trading]['UPS0']);
        //console.log("787:UPS1=" + botList[indexBot_trading]['UPS1']);
        //console.log("788:roundPricePow=" + botList[indexBot_trading]['roundPricePow']);
        if (botList[indexBot_trading]['UPS0'] == 0){
            outPutData[index_outPutData]['softSell']=false;
        }
        // --------------------
        if((outPutData[index_outPutData]['softSell']== true) && (Sellprice0<=Sellprice1)){
            outPutData[index_outPutData]['softSell']=false;
            console.log('412=outPutData[index_outPutData][softSell]=',outPutData[index_outPutData]['softSell']);
            let diffSellprice1=Math.abs((Sellprice1-data_sell.price)/(data_sell.price)*100);
            if(diffSellprice1<0.05){
                let SSF1=botList[indexBot_trading]['SSF1'];
                console.log("740:diffSellprice1=" + diffSellprice1);
                //alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20009a-Sell Price not change)'+' '+ sym}); 
                console.log('741:Warning(20009a-Sell Price not change)'+' '+ sym);   
                Sellprice1 = Math.ceil((1 + mathIUPS*(botList[indexBot_trading]['UPS1']) / 100) *(1-SSF1/100) * (buyPrice)* botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
            } 
            setTimeout(function () { sell_follow(data_sell,sym,Sellprice1) }, (botList[indexBot_trading]['TSF0']) * 1000);
        }else if (outPutData[index_outPutData]['softSell']== false || Sellprice0>Sellprice1){
            if(Sellprice0>Sellprice1 && botList[indexBot_trading]['SSF0']>=0.1 && botList[indexBot_trading]['TSF0']>0 && botList[indexBot_trading]['UPS0'] > 0){
                // console.log("789:iSellprice0>Sellprice1");
                let SSF0=botList[indexBot_trading]['SSF0'];
                let TSF0=botList[indexBot_trading]['TSF0'];
                let Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF0/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                if(diffSellprice0<.09){
                    console.log("752:diffSellprice0=" + diffSellprice0);
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20009a-Sell Price not change)'+' '+ sym}); 
                    console.log('741:Warning(20009:)'+' '+ sym);
                    Sellprice = Math.ceil((data_sell.price)*(1-2*SSF0/100)*botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow']; 
                }
                let diff_SP_BP=Math.abs((Sellprice-buyPrice)/(buyPrice)*100);
                if((diff_SP_BP<.3) || Sellprice<buyPrice){
                    coffDiff=1;
                    Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF0/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                }
                outPutData[index_outPutData]['softSell']=true;
                console.log('413=outPutData[index_outPutData][softSell]=',outPutData[index_outPutData]['softSell'])
                setTimeout(function () { sell_follow(data_sell,sym,Sellprice) }, (TSF0) * 1000);
            }else if((Sellprice0<=Sellprice1 || botList[indexBot_trading]['UPS0'] == 0) && botList[indexBot_trading]['SSF1']>=0.1 && botList[indexBot_trading]['TSF1']>0 &&  botList[indexBot_trading]['UPS1'] > 0){
                // console.log("789:Sellprice0<=Sellprice1");
                let SSF1=botList[indexBot_trading]['SSF1'];
                let TSF1=parseInt(botList[indexBot_trading]['TSF1']/(coffFilled));
                //console.log('674:TSF1=',TSF1)
                let Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF1/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                let diffSellprice1=Math.abs((Sellprice-data_sell.price)/(data_sell.price)*100);
                if(diffSellprice1<0.09){
                    console.log("754:diffSellprice1=" + diffSellprice1);
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20009a-Sell Price not change)'+' '+ sym}); 
                    console.log('743:Warning(20009a-Sell Price not change)'+' '+ sym);   
                    Sellprice = Math.ceil((data_sell.price)*(1-2*SSF1/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                }else{
                    let diff_SP_BP=Math.abs((Sellprice-buyPrice)/(buyPrice)*100);
                    if((diff_SP_BP<.3) || Sellprice<buyPrice){
                        coffDiff=1;
                        Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF1/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                    }
                }
                outPutData[index_outPutData]['softSell']=false;
                console.log('414=outPutData[index_outPutData][softSell]=',outPutData[index_outPutData]['softSell'])
                setTimeout(function () { sell_follow(data_sell,sym,Sellprice) }, (TSF1) * 1000);
            }else if (botList[indexBot_trading]['UPS0'] <= 0){
                console.log("753:botList[indexBot_trading]['UPS0']=" + botList[indexBot_trading]['UPS0']);
            }else if (botList[indexBot_trading]['UPS1'] <= 0){
                console.log("755:botList[indexBot_trading]['UPS1']=" + botList[indexBot_trading]['UPS1']);
            }
        }
    }
    // ================end of sellNew===========
    // -----------------------------------------------
    //--------------------------------------------
    // ================start of buyFilled===========
    async function buyFilled(orderInfo,indexBot_trading){
        botList[indexBot_trading]['buy_order_is_done'] = false;
        botList[indexBot_trading]['softBuy'] = true;
        //await stramWriteFunc(pathFile_botList,botList);;
        let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
        filled_buy_order++;
        botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
        console.log('184='+botList[indexBot_trading]['sym']+'=filled_buy_order:'+botList[indexBot_trading]['filled_buy_order']+'(buy filled)');
        checking_filled_buy_order(botList[indexBot_trading].sym,indexBot_trading)
        //await stramWriteFunc(pathFile_botList,botList);;
        //console.log('buy filled , filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
        
        await up_percent_order_sell(orderInfo, indexBot_trading);
        if ((botList[indexBot_trading]['filled_buy_order']) < botList[indexBot_trading]['MO'] && botList[indexBot_trading]['stop_buttom'] == false) {
            //console.log('35:'+botList[indexBot_trading]['sym']+':'+'max_order=' + botList[indexBot_trading]['MO']);
            //console.log('36:'+botList[indexBot_trading]['sym']+':'+'filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
            await douwn_percent_order_buy(indexBot_trading);
        }

    }
    // ================end of buyFilled===========
    // -------------------------------------------
    // ================start of sellFilled===========
    async function sellFilled(orderInfo,indexBot_trading,filled_buy_order){
        console.log('140:filled_buy_order=' + filled_buy_order)
        alertErrorBot.unshift({id: uuid.v4(), msg: orderInfo.symbol+':'+ orderInfo.client_order_id +':'+orderInfo.type+ 'sellOrder is filled'});
        console.log('410:buy_order_is_done=',botList[indexBot_trading]['buy_order_is_done']);
        console.log('411:quantity_low=',botList[indexBot_trading]['quantity_low'])
        await foud_LowQuantity_bot_func();
        if (botList[indexBot_trading]['stop_buttom'] == false){   
            if (filled_buy_order+1 < (botList[indexBot_trading]['MO'])){
                // -------------------
                // -------------
                console.log('421:buy_order_is_done=',botList[indexBot_trading]['buy_order_is_done']);
                console.log('422:quantity_low=',botList[indexBot_trading]['quantity_low'])
                if(botList[indexBot_trading]['buy_order_is_done'] == false && botList[indexBot_trading]['quantity_low'] == true){
                    //console.log('filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                    //console.log('max_order=' + botList[indexBot_trading]['MO'])
                    await douwn_percent_order_buy(indexBot_trading);
                    return;
                }else if(botList[indexBot_trading]['buy_order_is_done'] == true){
                    // let new_buy_order_data_info={};
                    // new_buy_order_data_info.buyOrderId='NoId';
                        let new_buy_order_info=newBuyOrderDataInfo(indexBot_trading);
                    console.log('185:new_buy_order_info=',new_buy_order_info);
                    if((new_buy_order_info.buyStatus === 'new') || (new_buy_order_info.buyStatus === 'partiallyFilled')){
                        //await stramWriteFunc(pathFile_botList,botList);;
                        let BuyPriceQuantity=BP_calculation(indexBot_trading);
                        let sym=botList[indexBot_trading]['sym'];
                        let roundQuantity=Math.floor(BuyPriceQuantity.quantity/(symInfo[sym].quantity_increment));
                        let symQuantity
                        //console.log('22:roundQuantity='+roundQuantity);
                        if(new_buy_order_info.buyStatus === 'new'){
                            symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
                        }else if(new_buy_order_info.buyStatus === 'partiallyFilled'){
                            symQuantity=new_buy_order_info.buyQuantityBase
                            console.log('189:symQuantity='+symQuantity);
                        }
                        
                        //console.log('41:'+sym+':BuyOrder input Quantity=',symQuantity);
                        // -------------
                        if((parseFloat(new_buy_order_info.buyPrice) == parseFloat(BuyPriceQuantity.price)) && (parseFloat(new_buy_order_info.buyQuantityBase) == parseFloat(symQuantity) )){
                            alertErrorBot.unshift({id: uuid.v4(), msg: '429:Replace buy not Done: '+' '+sym+'  '+'old_claient_order_id='+new_buy_order_info.buyOrderId});
                            console.log('429:Replace buy not Done for id=',new_buy_order_info.buyOrderId);
                        }else{
                            botList[indexBot_trading]['softBuy']=true;
                            await ReplaceBuyOrder(new_buy_order_info.buyOrderId, BuyPriceQuantity.price, symQuantity,indexBot_trading);
                        }
                        // --------------
                        
                        //console.log('81:filled sell checked:'+botList[indexBot_trading]['sym']+"ReplaceBuyOrder was Done");
                        // await cancel_order(new_buy_order_info.buyOrderId,indexBot_trading);
                        // fs.writeFileSync('./StorageData/botList.json', JSON.stringify(botList));
                        return;
                    }
                }
                return;

            }else if ((filled_buy_order+1) == botList[indexBot_trading]['MO'] && botList[indexBot_trading]['buy_order_is_done'] == false) {
                // -------------------
                console.log('141:filled_buy_order=' + filled_buy_order)
                await douwn_percent_order_buy(indexBot_trading);
                return;
            }else if ((filled_buy_order+1) > botList[indexBot_trading]['MO']) {
                console.log('142:filled_buy_order=' + filled_buy_order)
                return;
            }
        }else{
            // -------------------
            
            if((filled_buy_order+1) == 0){
                botList[indexBot_trading]['delete_buttom'] =true;
                botList[indexBot_trading]['stop_buttom'] =false;
            }
            //await stramWriteFunc(pathFile_botList,botList);;
            //console.log('sell filled, filled_buy_order=' +botList[indexBot_trading]['filled_buy_order']);
            // -------------
        }
    }
    // ================end of sellFilled===========
    // -------------------------------------------
    // -------------------------------------------
    // ================start of orderInfoSpotOrders===========
    function orderInfoSpotOrders(message){
        let orders = message.params;
        let NewOrder=orders[0];
        let date_order=NewOrder.updated_at
        let date = Date.now();
        let minTime=date-Date.parse(date_order);
        let newClientOrderId=NewOrder.client_order_id;
        // console.log('newClientOrderId0=',newClientOrderId)

        orders.forEach(order => {
            let date_order=order.updated_at
            let diffDate=date-Date.parse(date_order);
            
            // //console.log('diffDate=',diffDate)
            if(minTime>diffDate){
                minTime=diffDate;
                newClientOrderId=order.client_order_id
            }
            
        });
        // //console.log('newClientOrderId1=',newClientOrderId);
        NewOrder=orders.find(order => order.client_order_id === newClientOrderId);
        return orderInfo=orderInfoBuild(NewOrder,message.method);

    }
    // ================end of orderInfoSpotOrders===========
    // -------------------------------------------
    // -------------------------------------------
    // ================start of tradeProb_cal===========
    function tradeProb_cal(orderInfo,OldOrder,newOrder){
        let tradePropObj={};
        if ((OldOrder.buyStatus === 'new') || (OldOrder.buyStatus === 'partiallyFilled')){
            tradePropObj.buyTradeQuantity=orderInfo.trade_quantity;
            tradePropObj.buyTradePrice=orderInfo.trade_price;
            tradePropObj.buyTradeFee=orderInfo.trade_fee;
            
            console.log('885:OrderId=',newOrder.buyOrderId)
            console.log('886:tradePropObj=',tradePropObj);
            if (OldOrder.buyStatus === 'new'){
                let tradeProb=new Array();
                tradeProb.push(tradePropObj);
                //console.log('880:tradePropObj=',tradePropObj)
                newOrder.buytradeProb=tradeProb;
                return newOrder
            }else if (OldOrder.buyStatus === 'partiallyFilled'){
                let oldProb=OldOrder.buytradeProb;
                oldProb.push(tradePropObj)
                newOrder.buytradeProb=oldProb
                return newOrder
            }
        }else if((OldOrder.sellStatus === 'new') || (OldOrder.sellStatus === 'partiallyFilled')){
            tradePropObj.sellTradeQuantity=orderInfo.trade_quantity;
            tradePropObj.sellTradePrice=orderInfo.trade_price;
            tradePropObj.sellTradeFee=orderInfo.trade_fee;
            console.log('887:sellOrderId=',newOrder.sellOrderId)
            console.log('888:tradePropObj=',tradePropObj)
            if (OldOrder.sellStatus === 'new'){
                let tradeProb=new Array();
                tradeProb.push(tradePropObj);
                newOrder.selltradeProb=tradeProb;
                return newOrder
            }else if (OldOrder.sellStatus === 'partiallyFilled'){
                let oldProb=OldOrder.selltradeProb
                oldProb.push(tradePropObj)
                newOrder.selltradeProb=oldProb
                return newOrder
            }

        }
        
        

    }
    // ================end of tradeProb_cal===========
    // -------------------------------------------
    // -------------------------------------------
    // ================start of eror20001Handling===========
    async function eror20001Handling(errNum,BSprice,sym,client_order_id_buy_sell,symQuantity,errCode){
        console.log('680:errNum=',errNum);  
        let indexBot_trading=finding_indexBot_trading(sym)
        let checking_existing_buy=false
        botList[indexBot_trading]['buy_order_is_done']= false
        if (errNum == 20001 || errNum == 2010){
            // //console.log( '12:client_order_id_buy_sell=', client_order_id_buy_sell);
            console.log('490:errCode=',errCode)
            if(errCode == 0){
                let Free_fund=await balance_update_symR(indexBot_trading,'symR');
                console.log('478:Free_fund=',Free_fund)
                // let DPB_coeff=botList[indexBot_trading]['DPB'];
                // if(botList[indexBot_trading]['softBuy']==true){
                //     DPB_coeff=botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB'];
                // }
                // let RDPB=1-(DPB_coeff)/100;
                // let new_buyQuantity=Free_fund/(RDPB*botList[indexBot_trading]['price']);
                let new_buyQuantity=Free_fund/(BSprice);
                let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                let new_symQuantity=(new_roundQuantity)*(symInfo[sym].quantity_increment);
                if(new_symQuantity>symQuantity){
                    checking_existing_buy=checking_new_buy_existing(sym)
                    new_symQuantity=symQuantity;
                }
                if (new_roundQuantity<2){
                    botList[indexBot_trading]['quantity_low']=true;
                    console.log('477:'+botList[indexBot_trading]['sym']+':quantity_low=',botList[indexBot_trading]['quantity_low'])
                    let sym=botList[indexBot_trading]['sym']
                    await checking_funds(sym);
                    return;
                }else{
                    //console.log('14:'+sym+':FirstQuantity='+botList[indexBot_trading]['quantity'])
                    let symR=symRL_Func(indexBot_trading,'symR')
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning('+errNum+':Insufficient(20001) or undefind(2010) found):'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund+''}); 
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    // console.log('25:new_symQuantity='+new_symQuantity);
                    errCode=20001;
                    if(checking_existing_buy){
                        console.log('810:checking_existing_buy=',checking_existing_buy)
                    }else{
                        await BuyOrder(BSprice, new_symQuantity,indexBot_trading,errCode);
                    }
                }
            }else{
                let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
                let new_roundQuantity=roundQuantity-1
                let new_symQuantity=(new_roundQuantity)*(symInfo[sym].quantity_increment);
                if (new_roundQuantity<2){
                    botList[indexBot_trading]['quantity_low']=true;
                    let sym=botList[indexBot_trading]['sym']
                    await checking_funds(sym);
                    return;
                }else{
                    alertErrorBot.unshift({id: uuid.v4(), msg:'Warning(20001:Insufficient funds)'+' '+ sym}); 
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    // console.log('25:new_symQuantity='+new_symQuantity);
                    // let foundNewOrder=outPutData.some(order => ( (order.buyStatus == 'new') && (order.sym == sym)));
                    errCode=20001;
                    await BuyOrder(BSprice, new_symQuantity,indexBot_trading,errCode);
                }
            }
            
        }else if (errNum == 2011){
            botList[indexBot_trading]['quantity_low']=true
            botList[indexBot_trading]['buy_order_is_done']=false;
            let lowQuantity_botSym=botList[indexBot_trading]['sym']
            await checking_funds(lowQuantity_botSym);
            return;
        }
    }
    // ================end of eror20001Handling===========
    // ----------------------------------------------------
    // -------------------------------------------
    // ================start of eror20001Handling_Sell===========
    async function eror20001Handling_Sell(errNum,BSprice,sym,symQuantity){
        console.log('680:errNum=',errNum);  
        let indexBot_trading=finding_indexBot_trading(sym)
        let Free_fund=await balance_update_symR(indexBot_trading,'symL');
        console.log('479:Free_fund=',Free_fund)
        let new_symQuantity=Free_fund;
        if(new_symQuantity>symQuantity){
            new_symQuantity=symQuantity;
        }
        let symL=symRL_Func(indexBot_trading,'symL')
        alertErrorBot.unshift({id: uuid.v4(), msg:'Warning('+errNum+':Insufficient(20001) or undefind(2010) found):'+' '+ sym+':'+'Your Free_fund of'+' '+symL +' '+'is:'+ Free_fund+''}); 
        await SellOrder(BSprice, new_symQuantity,indexBot_trading);      
    }
    // ================end of eror20001Handling_Sell===========
    function checking_filled_buy_order(sym,indexBot){
        let filled_buy_outPutData=outPutData.filter(order => ((order.buyStatus == 'filled') && (order.sym == sym)));
        let filled_buy_order_outPutData=filled_buy_outPutData.length;
        console.log('756:filled_buy_order_outPutData=',filled_buy_order_outPutData);
        if(botList[indexBot].filled_buy_order != filled_buy_order_outPutData){
            console.log('757:botList[indexBot].filled_buy_order=',botList[indexBot].filled_buy_order);
            alertErrorBot.unshift({id: uuid.v4(), msg:'757='+botList[indexBot].sym+':(filled_buy_order='+botList[indexBot].filled_buy_order+')!=(filled_buy_order_outPutData='+filled_buy_order_outPutData});
            botList[indexBot].filled_buy_order=filled_buy_order_outPutData;
        }
    }
    // -----------------------start of replaceString----------------------------
    function replaceString(oldS, newS, fullS) {
        return fullS.split(oldS).join(newS);
    }
    // ------------------------end of replaceString----------------------
    //-----------memory of node js exploring----------------------
    // ----------BTCUSDT_public_ws_checking----------------------
    function BTCUSDT_public_ws_checking(){
        console.log('526:BTCUSDT_public_WS=',BTCUSDT_public_WS)
        if (BTCUSDT_public_WS == false){
            alertErrorBot.unshift({id: uuid.v4(), msg: '010P:ws-Public socket concetion is request to open at:'+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds() +'--'+'BTCUSDT'+'--(delayP='+delayTime_public/1000+'sec)'});
            let found_BtcUsdt_Bot=botList.some(bot => bot.sym == 'BTCUSDT');
            if (found_BtcUsdt_Bot){
                let BtcUsdt_Bot=botList.find(bot => bot.sym == 'BTCUSDT');
                createSocket_public('subscribe', 'candles/'+ (BtcUsdt_Bot.tCC),{symbols: [BtcUsdt_Bot.sym],limit: (BtcUsdt_Bot.nCC+1)},BtcUsdt_Bot.sym,delayTime_public);
            }else{
                createSocket_public('subscribe', 'candles/'+ ('M1'),{symbols: ['BTCUSDT'],limit: 1},'BTCUSDT',delayTime_public);
            }
            if(botList.length>0){
                for (const botInfo of botList){
                    let indexBot=botList.indexOf(botInfo);
                    // if(botList[indexBot]['delete_buttom'] ==false){
                    //     await B1DownEs(botList[indexBot]['sym']);
                    // }
                    checking_filled_buy_order(botList[indexBot].sym,indexBot)
                    // //console.log('botList['+indexBot+']["dead"]='+botList[indexBot]["dead"]);
                } 
            }
        }
        // setTimeout(() =>{
        //     BTCUSDT_public_ws_checking()
        // },40000);
    }
    // ------------------------------------------------
    // ------------------------------------
    function checking_new_buy_existing(sym){
        let found=outPutData.some(order => ((order.sym == sym) && (order.buyStatus == 'new')))
        return found

    }
    // ----------------------------------
    function getLowestBuyPrice(sym) {
        const found = outPutData.some(order => ((order.sym === sym) && (order.buyStatus == 'filled')));
        if(found){
            const buyFilledData = outPutData.filter(order => ((order.sym === sym) && (order.buyStatus == 'filled')));
            const min_buy = Math.min(...buyFilledData.map(order => order.buyPrice));
            console.log('152:min_buy=',min_buy)
            return min_buy;
        }else{
            const min_buy=0
            console.log('153:min_buy=',min_buy)
            return min_buy;
        }
    }
    // -----------------------------------
    //const used = process.memoryUsage().heapUsed / 1024 / 1024;
    // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    // ---------------------------------------------
    // *************************************
    // --------start of function chckingMinBalance-------
    function chckingMinBalance(){
        const userInfo = userStore.getUserInfo();
        const lastCharge = Date.now() - userInfo.lastTimeCharge;
        if(balanceData && Object.keys(balanceData).length > 0){
            if(lastCharge<chargeTime){
                if(balanceData.availableUSDT>userInfo.maxBalance){
                    userInfo.maxBalance=balanceData.availableUSDT;
                    userStore.updateField("maxBalance", userInfo.maxBalance);
                }
            }else{
                userInfo.maxBalance=balanceData.availableUSDT;
                userStore.updateField("maxBalance", userInfo.maxBalance);
            }
            
        }else{
            console.log('128:balanceData=',balanceData)
        }
        console.log('116:userInfo=',userInfo);
        
    }
    // -----------end of chckingMinBalance-------------------
    // ------end of Functions--------------
    // ====================================
        
}



module.exports = router;
