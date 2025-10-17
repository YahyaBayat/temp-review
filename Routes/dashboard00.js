const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ensureAuth } = require('../config/auth');
const request = require('request-promise');
// const { json } = require('express');
// const os = require('os');
const WebSocket = require('ws');
const uuid=require('uuid');
const path=require('path');
const json = require('big-json');
const fs = require("fs");
const Logged_User = require('../Models/Logged_User');
const User = require('../Models/User');
const { Console } = require('console');
const mongoose=require('mongoose');
let startBot= true;
let died_connection=false;
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
// const clientOrderIdBS=new Array();
// const symInfo={};
// const balanceData={};
// const corresBotId = new Array();
// const outPutData = new Array();
// const outPutFilledData = new Array();
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
// const clientOrderIdBS=JSON.parse(fs.readFileSync("./StorageData/clientOrderIdBS.json"));
const symInfo=JSON.parse(fs.readFileSync("./StorageData/symInfo.json"));
const balanceData={};
// const balanceData=JSON.parse(fs.readFileSync("./StorageData/balanceData.json"));
// const corresBotId = JSON.parse(fs.readFileSync("./StorageData/corresBotId.json"));
// const botList = JSON.parse(fs.readFileSync("./StorageData/botList.json"));
// const outPutData = JSON.parse(fs.readFileSync("./StorageData/outPutData.json"));
// const outPutFilledData = JSON.parse(fs.readFileSync("./StorageData/outPutFilledData.json"));
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

excutionBot();
async function excutionBot(){
    let start=Date.now()
    // ----------------botlis Reading---
    const botList = new Array();
    let pathFile_botList='./StorageData/botList.json';
    await stramReadFunc(pathFile_botList,botList);
    rewrittingFiles(pathFile_botList,botList,JSON.stringify(new Array()));
    // ------------------------------------
    // ----------------clientOrderIdBS Reading---
    const clientOrderIdBS = new Array();
    // let pathFile_clientOrderIdBS='./StorageData/clientOrderIdBS.json';
    // await stramReadFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
    // ------------------------------------
    // ----------------corresBotId Reading---
    const corresBotId = new Array();
    // let pathFile_corresBotId='./StorageData/corresBotId.json';
    // await stramReadFunc(pathFile_corresBotId,corresBotId);
    // // ------------------------------------
    // // ----------------outPutData Reading---
    const outPutData = new Array();
    let pathFile_outPutData='./StorageData/outPutData.json';
    await stramReadFunc(pathFile_outPutData,outPutData);
    rewrittingFiles(pathFile_outPutData,outPutData,JSON.stringify(new Array()));
    // // ------------------------------------
    // // ----------------outPutFilledData Reading---
    const outPutFilledData = new Array();
    let pathFile_outPutFilledData='./StorageData/outPutFilledData.json';
    await stramReadFunc(pathFile_outPutFilledData,outPutFilledData);
    rewrittingFiles(pathFile_outPutFilledData,outPutFilledData,JSON.stringify(new Array()));
    // // ------------------------------------
    // // ----------------alertErrorBot Reading---
    const alertErrorBot = new Array();
    // let pathFile_alertErrorBot='./StorageData/alertErrorBot.json';
    // await stramReadFunc(pathFile_alertErrorBot,alertErrorBot);
    
    // // ------------------------------------
    // // ----------------outPutManualData Reading---
    const outPutManualData = new Array();
    let pathFile_outPutManualData='./StorageData/outPutManualData.json';
    await stramReadFunc(pathFile_outPutManualData,outPutManualData);
    rewrittingFiles(pathFile_outPutManualData,outPutManualData,JSON.stringify(new Array()));
    // ----------------------------------------
    // // ----------------outPutManualData Reading---
    const chartData = new Array();
    // let pathFile_chartData='./StorageData/chartData.json';
    // await stramReadFunc(pathFile_chartData,chartData);
    // ----------------------------------------
    
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
    // *************************************
    // setTimeout(() =>{
    //     botList.push({"bbbb20":"20000"});
    //     console.log('200000')
    // },20000);
    // setTimeout(() =>{
    //     botList.push({"bbb8":"80000"})
    //     console.log('8000')
    // },8000);
    // ----------------rewrittingFiles---
    // const ch=new Array();
    // ch.push({"ch0":"0"})
    // let pathFile_ch='./StorageData/ch.json';
    // await stramReadFunc(pathFile_ch,ch);
    // rewrittingFiles(pathFile_ch,ch,JSON.stringify(new Array()));
    // setTimeout(() =>{
    //     ch.splice(0, 1, {"ch17":[5000]});
    //     console.log('50000')
    // },5000);
    // setTimeout(() =>{
    //     let mm=ch[0];
    //     let kk=mm.ch17;
    //     kk[0]=15000;
    //     mm.ch17=kk;
    //     ch[0]=mm;
    //     console.log('15000')
    // },15000);
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
        setTimeout(() =>{
            // console.log("227:internal_OldArray[0]=",internal_OldArray[0])
            rewrittingFiles(pathFile,newArry,oldArry)
        },20000);
    }
    // ----------------------
    // // ----------------rewrittingFiles---
    // function rewrittingFiles (pathFile,newArry,oldArry){
    //     // let internal_OldArray= new Array();
    //     console.log("221:newArry=",newArry)
    //     console.log("222:oldArry=",oldArry)
    //     let result=checkingEquallArray(newArry,oldArry);
    //     if(result){
    //         console.log('845:no change');
    //         // internal_OldArray=[...oldArry];
    //         // console.log("223:internal_OldArray[0]=",internal_OldArray[0])
    //     }else{
    //         console.log('846:changed');
    //         oldArry = [];
    //         // newArry.forEach(obj => oldArry.push(Object.assign({}, obj)));
    //         oldArry=[...newArry];
    //         // oldArry =lodash.cloneDeep(newArry);
    //         // oldArry=JSON.parse(JSON.stringify(newArry))
    //         console.log("224:changed_OldArray=",oldArry)
    //         // start=Date.now()
            
    //         // //await stramWriteFunc(pathFile,newArry);
    //         // let diffTime=Date.now() - start;
    //         // console.log('diffTime1=',diffTime);
    //         // start=Date.now()
    //         fs.writeFileSync(pathFile, JSON.stringify(newArry));
    //         // diffTime=Date.now() - start;
    //         // console.log('diffTime2=',diffTime);
            

    //     }
    //     // newArry.splice(0, 1, {"ddd":"555"});
    //     // console.log("225:internal_OldArray[0]=",internal_OldArray[0])
    //     // console.log("226:newArry[0]=",newArry[0])
    //     setTimeout(() =>{
    //         // console.log("227:internal_OldArray[0]=",internal_OldArray[0])
    //         rewrittingFiles(pathFile,newArry,oldArry)
    //     },12000);
    //     function checkingEquallArray(newArry,oldArry){
    //         let result=false;
    //         if (newArry.length === oldArry.length) {
    //             for (let i = 0; i < newArry.length; i++) {
    //               result = newArry.indexOf(oldArry[i]) !== -1;
    //               console.log('oldArry[i]=',oldArry[i]);
    //               console.log('newArry[i]=',newArry[i]);
    //               console.log('index=',newArry.indexOf(oldArry[i]))
    //               console.log("55:result=",result);
    //               if (result === false) {
    //                 return result
    //               }
    //             }
    //             return result
    //         }else{
    //            console.log('newArry.length=',newArry.length);
    //            console.log('oldArry.length=',oldArry.length) 
    //         }
    //     }
    // }
    // // ----------------------
    // -----------------------
    // User.findOne({email:'YahyaBayat@site'})
    //             .then(user=>{
    //                 Logged_User.key1=user.key1
    //                 Logged_User.key2=user.key2;
    //                 //console.log('Logged_User=',Logged_User)});
    if (botList.length>0) rebootFunction()
    // -------------------------------
    async function rebootFunction(){
        // return;
        for (const botInfo of botList){
            let indexBot=botList.indexOf(botInfo);
            botList[indexBot]['dead']=true;
            //await stramWriteFunc(pathFile_botList,botList);
            if (botList[indexBot]['delete_buttom'] ==false) await B1DownEs(botList[indexBot]['id']);
            // //console.log('botList['+indexBot+']["dead"]='+botList[indexBot]["dead"]);

        }

    }
    let diffTime=Date.now() - start;
    console.log('diffTime1=',diffTime);
    // -------------------------

    // ----------------------

    router.post('/sym', async (req, res) => {
        let sym = req.body.sym;
        let quantity_increment;
        // console.log('841:symInfo[sym]',symInfo[sym]);
        if (symInfo[sym] === undefined){
            let currencies= await getSymProb(sym);
            // console.log('384:currencies=',currencies)
            symInfo[sym]={};
            quantity_increment=parseFloat(currencies.quantity_increment)
            symInfo[sym].quantity_increment=quantity_increment;
            fs.writeFileSync('./StorageData/symInfo.json', JSON.stringify(symInfo));
        }else{
            quantity_increment=parseFloat(symInfo[sym].quantity_increment)
        }
        let foundBot=botList.some(bot => bot.sym === sym);
        let symPrice
        let minSymQuantity
        let symPriceQuantity
        if(foundBot){
            let bot=botList.find(bot => bot.sym === sym);
            symPrice = bot.price;
            minSymQuantity=symPrice*quantity_increment*1.1;
            symPriceQuantity={symPrice:symPrice,minSymQuantity:minSymQuantity}
            // console.log('741:symPriceQuantity=',symPriceQuantity)
        }else{
            const response = await getPriceSym(sym);
            symPrice = response.data;
            minSymQuantity=symPrice.price*quantity_increment*1.1;
            symPriceQuantity={symPrice:symPrice.price,minSymQuantity:minSymQuantity}
            // console.log('742:symPriceQuantity=',symPriceQuantity)
        }
        
        res.json(symPriceQuantity);
    });
    router.post('/balance', async (req, res) => {
        await addBalance();
        res.json(balanceData);

    });
    router.get('/balance',  (req, res) => {
        res.send(balanceData);
    });

    router.post('/inputData', async (req, res) => {
        console.log('452:add bottom')
        let inputData = {
            id: uuid.v4(),
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
            SDPB:parseFloat(req.body.inputData.SDPB),
            TBF: parseFloat(req.body.inputData.TBF),
            SBF: parseFloat(req.body.inputData.SBF),
            UPS0: parseFloat(req.body.inputData.UPS0),
            TSF0: parseFloat(req.body.inputData.TSF0),
            SSF0: parseFloat(req.body.inputData.SSF0),
            UPS1: parseFloat(req.body.inputData.UPS1),
            TSF1: parseFloat(req.body.inputData.TSF1),
            SSF1: parseFloat(req.body.inputData.SSF1),
            IntBot: parseInt(req.body.inputData.IntBot),
            tCC: 'M1',
            roundPricePow:Math.pow(10, (parseFloat(req.body.inputData.RP))),
            minSymQuantity:parseFloat(req.body.inputData.minSymQuantity),
            add_buttom: true,
            edit_buttom: false,
            delete_buttom: false,
            stop_buttom: false,
            filled_buy_order:0,
            buy_order_is_done:false,
            FirstQuantity:'',
            dead:false,
            // new_buy_order_info:{},
            quantity_low:false,
            minCheckCandlePrice:req.body.inputData.price,
            closeUpCheckCandle:req.body.inputData.price,
            lowPrice:new Array(),
            // tick_snapshot:new Array(),   
            softBuy: true,  
        };
        let localInputData={
            id: uuid.v4(),
            price:parseFloat(req.body.inputData.price),
            minCheckCandlePrice:req.body.inputData.price,
            closeUpCheckCandle:req.body.inputData.price,
            lowPrice:new Array(),
            // tick_snapshot:new Array(),   
        }
            
        let mathIDPB=Math.pow((1+inputData.IDPB/100),inputData.filled_buy_order);
        let DPB_coeff=(inputData.DPB+inputData.SDPB)*mathIDPB;
        let RDPB=1-(DPB_coeff)/100;
        // console.log('122:RDPB=',RDPB);
        inputData.FirstQuantity=String((inputData.quantity)/(RDPB*(inputData.price)));
        // //console.log('123:inputData.FirstQuantity=',inputData.FirstQuantity);
        // //console.log('123:inputData=',inputData);
        if (!inputData.sym || !inputData.price || !inputData.quantity || !inputData.MO || !inputData.DPB || !inputData.UPS1 || !inputData.TSF1 || !inputData.SSF1 || !inputData.tCC){
        alertErrorBot.push({id: uuid.v4(), msg: 'Error3:Please Fill all elements of BOT!'});
        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        //console.log(alertErrorBot)
            res.send(alertErrorBot);
            
        }else if (inputData.quantity<inputData.minSymQuantity){
            alertErrorBot.push({id: uuid.v4(), msg: 'Error4:Yure input Quantity should be higher than MinQuantity'});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        //console.log(alertErrorBot)
            res.send(alertErrorBot);

        }else {
            botList.push(inputData);
            // localBotlist.push(localInputData);
            //await stramWriteFunc(pathFile_botList,botList);

            res.send(botList);
            // console.log(typeof(inputData.price))
            // return;
            //  console.log('451:botList=',botList)
            await B1DownEs(inputData.id);
        }
        
    });
    router.get('/botList', async (req, res) => {
        res.json(botList);
    });
    router.post('/:id/:clickedButtom', async (req,res)=>{
        let id = req.params.id;
        let clickedButtom = req.params.clickedButtom;
        //console.log('clickedButtom=',clickedButtom);
        //console.log('id=',id);
        let found= botList.some(bot => bot.id === req.params.id );
        if (found){
            let deletedBot=botList.filter(bot => bot.id === req.params.id)[0];
            let index=botList.indexOf(deletedBot);
            if (clickedButtom=='delete'){
                botList[index]['delete_buttom']=true;
                //await stramWriteFunc(pathFile_botList,botList);;
                alertErrorBot.push({id: uuid.v4(), msg: 'deleted id='+' '+req.params.id});
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                await B1DownEs(id);
            }else if(clickedButtom=='stop'){
                botList[index]['stop_buttom']=true;
                //await stramWriteFunc(pathFile_botList,botList);;
                alertErrorBot.push({id: uuid.v4(), msg: 'stopped id='+' '+req.params.id});
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                await B1DownEs(id);
            }
            res.json(botList);
        } else {
            alertErrorBot.push({id: uuid.v4(), msg: 'No member with id of '+' '+req.params.id});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)

            res.send(alertErrorBot);
        }
            
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

    router.delete('/:id', async (req,res)=>{
        let eraesed_botId=req.params.id
        let found= botList.some(bot => bot.id === eraesed_botId);
        if (found){
            eraesed_outputDate(eraesed_botId);
            //await stramWriteFunc(pathFile_outputDate,outputDate)
            eraesed_outputFilledDate(eraesed_botId);
            //await stramWriteFunc(pathFile_outPutFilledData,outPutFilledData)
            eraesed_corresBotId(eraesed_botId);
            eraesed_clientOrderIdBS();
            eraesed_chartData(eraesed_botId);
            eraesed_botList(eraesed_botId);
            //await stramWriteFunc(pathFile_botList,botList);
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            res.json(botList);
        } else {
            alertErrorBot.push({id: uuid.v4(), msg: 'No member with id of '+' '+eraesed_botId});
            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
            res.send(alertErrorBot)
        }
    });

    router.put('/editData', async (req,res)=>{
        let editData = {
            id: req.body.editData.id,
            quantity: parseFloat(req.body.editData.quantity),
            IQ:parseFloat(req.body.editData.IQ),
            MO: parseInt(req.body.editData.MO),
            nCC: parseInt(req.body.editData.nCC),
            DPB: parseFloat(req.body.editData.DPB),
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
            IntBot: parseInt(req.body.editData.IntBot),
            edit_buttom: true,
            FirstQuantity:'',
        };
        let found= botList.some(bot => bot.id === editData.id );
        if (found){
            let foundBot=botList.filter(bot => bot.id === editData.id)[0];
            let index=botList.indexOf(foundBot);

            if (foundBot.delete_buttom==true){
                eraesed_corresBotId(editData.id);
                eraesed_clientOrderIdBS();
                botList[index]['price']=parseFloat(req.body.editData.price),
                editData.delete_buttom=false;
                editData.filled_buy_order=0;
                editData.new_buy_order_info={};
                editData.quantity_low=false;
                editData.minCheckCandlePrice=req.body.editData.price;
                editData.closeUpCheckCandle=req.body.editData.price;
                editData.softBuy=true;
                //console.log('51:editData=',editData)
                // alertErrorBot.push({id: uuid.v4(), msg: 'the Deleted id of '+' '+editData.id+' '+'can not be Edited'});
                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                // res.json(alertErrorBot)
            }else if(foundBot.stop_buttom==true){
                botList[index]['stop_buttom']=false;
                if (foundBot.buy_order_is_done==true){
                    botList[index]['buy_order_is_done']=false;
                }
            }
            let mathIDPB=Math.pow((1+editData.IDPB/100),botList[index]['filled_buy_order']);
            let DPB_coeff=(editData.DPB+editData.SDPB)*mathIDPB;
            let RDPB=1-(DPB_coeff)/100;
            editData.FirstQuantity=String((editData.quantity)/(RDPB*(botList[index]['price'])));
            //console.log('editData.FirstQuantity='+editData.FirstQuantity)
            alertErrorBot.push({id: uuid.v4(), msg: 'edited id='+' '+editData.id});
            const editedBot = Object.assign({}, foundBot, editData);
            botList.splice(index, 1, editedBot);
            // //console.log('botList=',botList);
            await B1DownEs(editData.id);
            res.json(botList);
            
            
        } else {
            alertErrorBot.push({id: uuid.v4(), msg: 'No member with id of '+' '+editData.id});
            res.json(alertErrorBot)
        }
        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
        //await stramWriteFunc(pathFile_botList,botList);

    });
    router.get('/alertErrorBot',  (req, res) => {
        res.json(alertErrorBot);
    });
    router.get('/outPutData',  (req, res) => {
        let outPutNFData={outPutData,outPutFilledData};
        // //console.log('outPutNFData=',outPutNFData);
        res.json(outPutNFData);
    });
    router.delete('/outPutData/:BotId/:sellOrderId', async (req,res)=>{
        let selectedBot=outPutFilledData.find(bot => bot.BotId === req.params.BotId);
        let botIndex=outPutFilledData.indexOf(selectedBot);
        // //console.log('selectedBot=',selectedBot);
        let buySellFilledData=selectedBot.buySellFilledData;
        let orderData=buySellFilledData.find(order =>order.sellOrderId === req.params.sellOrderId );
        // //console.log('orderData=',orderData);
        let oredrIndex=buySellFilledData.indexOf(orderData);
        buySellFilledData.splice(oredrIndex,1);
        // //console.log('buySellData0=',buySellData);
        selectedBot.buySellFilledData=buySellFilledData;
        // //console.log('selectedBot0=',selectedBot);
        outPutFilledData.splice(botIndex, 1, selectedBot);
        //await stramWriteFunc(pathFile_outPutFilledData,outPutFilledData)
        // -----start of corresBotId earese order----
        // let corresId=corresBotId.find(order => order.client_order_id_sell === orderData.sellOrderId);
        // let corresIndex=corresBotId.indexOf(corresId);
        // corresBotId.splice(corresIndex, 1);
        // fs.writeFileSync('./StorageData/corresBotId.json', JSON.stringify(corresBotId));
        // //console.log('corresBotId00=',corresBotId)
        // --------------------end of corresBotId earese order----
        let outPutNFData={outPutData,outPutFilledData}
        res.json(outPutNFData);

        // botList.indexOf(selectedBot);
        // let index=alertErrorBot.indexOf(eraseErordBot);
        // alertErrorBot.splice(index,1);
        
    });
    router.delete('/CancelOrder/:botId/:cancelOrderId',(req,res) => {
        //console.log('468:cancelOrderData=')
        let cancelOrderData ={
            botId:req.params.botId,
            cancelOrderId:req.params.cancelOrderId
        }
        // console.log('785:cancelOrderData=',cancelOrderData);
        cancelOrder(cancelOrderData);
        res.json('kk');
    });
    router.post('/manualOrdering',async (req,res) => {
        let inputData = {
            botId: req.body.inputData.botId,
            sym: req.body.inputData.sym.toUpperCase(),
            price:parseFloat(req.body.inputData.price),
            quantity: parseFloat(req.body.inputData.quantity),
            side: req.body.inputData.side,
        };
        // inputData.quantity=parseFloat((inputData.quantity)/(inputData.price));
        // //console.log('inputData=',inputData);
        let orderInfo=await manualOrdering(inputData); 
        outPutManualData.unshift(orderInfo);
        let outPutManualData_botFilter=outPutManualData.filter(order=>((order.botId === inputData.botId) && (order.status === 'filled')) );
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
            BotId: inputData.botId,
            sym: inputData.sym,
            intervalValue: inputData.intervalValue
        };
        resaultChart.ohlcv=ohlcv;
        let found=chartData.some(resaultChart =>resaultChart.BotId === inputData.botId);
        if(found){
            let foundResaultChart=chartData.find(resaultChart =>resaultChart.BotId === inputData.botId);
            let index=chartData.indexOf(foundResaultChart);
            chartData.splice(index, 1, resaultChart);
        }else{
            chartData.push(resaultChart);   
        }
        // //await stramWriteFunc(pathFile_chartData,chartData);
        res.send(chartData);
    });
    router.get('/chartDepict',  (req, res) => {
        // console.log('488:chartData=');
        res.send(chartData);
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
    //         alertErrorBot.push({id: uuid.v4(), msg: '3:'+err});
    //     });

    // };
    // **************************************
    // *************************************
    async function getSymProb(sym){
        return new Promise((resolve,reject)=>{
            axios.get('https://api.hitbtc.com/api/3/public/symbol/'+ sym)
            .then(res=>{
                
                resolve(res.data)
                
            })
            .catch((err)=>{
                alertErrorBot.push({id: uuid.v4(), msg: '4:Your sym is not valid'});
                console.log('584:err=',err)
                reject(err)}
                );
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
    // // =========addBalance========
    async function addBalance() {
        // =====================ws/trading============================
        return new Promise(function(resolve,reject){
            let socket = new WebSocket("wss://api.hitbtc.com/api/3/ws/trading");
            socket.onopen = socketDataSend2
            function socketDataSend2() {
                var SocketSessionAuthenticationData =
                {
                    "method": "login",
                    "params": {"type": "Basic","api_key": Logged_User.key1,"secret_key": Logged_User.key2}
                };
                var Subscribe_to_spot_Balance =
                {
                    "method": "spot_balances",
                    "params": {},
                    "id": 123
                }
                socket.send(JSON.stringify(SocketSessionAuthenticationData));
                socket.send(JSON.stringify(Subscribe_to_spot_Balance));
            };
            socket.onmessage = async (event) => {
                let res = JSON.parse(event.data);
                if(res.result !=true){
                    let Balance = res.result;
                    let FreeBalance={};
                    let LockedBalance={};
                    for (let index = 0; index < Balance.length; index++) {
                        var indexOfBalance = -1;
                        var symb
                        if (parseFloat(Balance[index]['available']) > 0) {
                            symb = Balance[index]['currency'];
                            
                            FreeBalance[symb]= Balance[index].available;
                            
                            var indexOfBalance = symb;
                            
                        }
                        if (parseFloat(Balance[index].reserved) > 0) {
                            symb = Balance[index]['currency'];
                            LockedBalance[symb] = Balance[index].reserved;
                        } else if (indexOfBalance != -1) {
                            LockedBalance[indexOfBalance] = 0;
                            
                        }
                    }
                    balanceData.FreeBalance=FreeBalance
                    balanceData.LockedBalance=LockedBalance;
                    // //console.log('balanceData.FreeBalance=',balanceData.FreeBalance);
                    // //console.log('balanceData.LockedBalance=',balanceData.LockedBalance);
                    // fs.writeFileSync('./StorageData/balanceData.json', JSON.stringify(balanceData));
                    await available_USDT_Cumputing()
                    resolve(balanceData)
                }
                
            };
            socket.onclose = function (event) {
                if (event.wasClean) {
                    //console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    //console.log('[close] Connection died');
                }
            };
            socket.onerror = function (error) {
                //console.log(`[error] ${error.message}`);
            };
        })
    }
    // **************************************
    // **************************************
    // // =========cancelOrder========
    async function cancelOrder(cancelOrderData) {
        // =====================ws/trading============================
        let socket = new WebSocket("wss://api.hitbtc.com/api/3/ws/trading");
        socket.onopen = socketDataSend2
        function socketDataSend2() {
            var SocketSessionAuthenticationData =
            {
                "method": "login",
                "params": {"type": "Basic","api_key": Logged_User.key1,"secret_key": Logged_User.key2}
            };
            var Subscribe_to_spot_cancel_order =
            {
                "method": "spot_cancel_order",
                "params": {
                    "client_order_id": cancelOrderData.cancelOrderId
                },
                "id": 123
            }
            
            socket.send(JSON.stringify(SocketSessionAuthenticationData));
            socket.send(JSON.stringify(Subscribe_to_spot_cancel_order));
        };
        socket.onmessage = async (event) => {
            let res = JSON.parse(event.data);
            console.log('426:res=',res)
            console.log('427:res.result=',res.result)
            // try {
                if(res.result != undefined ){
                    if (res.result !=true){
                        let found=outPutManualData.some(order => order.orderId===res.result.client_order_id)
                        if (found){
                            let cancel_Order_Id=outPutManualData.find(order => order.orderId===res.result.client_order_id);
                            let index=outPutManualData.indexOf(cancel_Order_Id);
                            outPutManualData.splice(index,1);
                            //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);
                        }
                        
                    }

                }
                if(res.error != undefined ){
                    if(res.error.code === 20002){
                        alertErrorBot.push({id: uuid.v4(), msg: '128:cancel_order Eror: '+res.error.code+':'+' '+'cancel_Order_Id='+cancelOrderData.cancelOrderId });
                        await cancelErrorHandling(cancelOrderData)
                    } 
                }
                
                //console.log('428:res=',res)
            // } catch (err) {
                
                
                // console.log('388:err:',err.code);
                // alertErrorBot.push({id: uuid.v4(), msg: '128:cancel_order Eror: '+err.code+':'+' '+'cancel_Order_Id='+cancelOrderData.cancelOrderId });
                // console.log('res.error=',res.error)
                // if (res.error ==='undefined'){
                //     return;
                // }else if((res.error.code === 20002) || (res.error.code === 20009) || (res.error.code === 20080) || (res.error.code === 20010)){
                //     console.log('556:res.error.code=',res.error.code)
                //     await cancelErrorHandling(cancelOrderData)

                // }
                    
            // }
            
        };
        socket.onclose = function (event) {
            if (event.wasClean) {
                //console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                //console.log('[close] Connection died');
            }
        };
        socket.onerror = function (error) {
            //console.log(`[error] ${error.message}`);
        };
    }
    // **************************************
    // **************************************
    // // // =========profitBot========
    // function profitBot(profitTime) {
    //     let profit_bot= {};
    //     let IranDate = new Date(Date.now() +12600000);
    //     let numTime
    //     if(profitTime === 'day'){
    //         numTime=IranDate.getDate();
    //     }else if(profitTime === 'month'){
    //         numTime=IranDate.getMonth();
    //     }
    //     //console.log('numTime=',numTime);
    //     outPutFilledData.forEach(filled_orders_bot=> {
    //         profit_bot={
    //             botId:filled_orders_bot.BotId,
    //             profitValue: null,
    //             profitPercent:null,
    //         };
    //         filled_orders_bot.buySellFilledData.forEach(filled_order => {
    //             let orderDate=new Date(filled_order.sellTime);
    //             let orderTime
    //             if(profitTime === 'day'){
    //                 orderTime=orderDate.getDate();
    //             }else if(profitTime === 'month'){
    //                 orderTime=orderDate.getMonth();
    //             }else if(profitTime === '7'){
    //                 let numDay=parseInt(profitTime);
    //                 orderTime=orderDate.getDate();
    //             }
    //             //console.log('orderTime=',orderTime);
    //             if(orderTime === numTime){
    //                 profit_bot.profitValue+=parseFloat(filled_order.profitValue);
    //                 profit_bot.profitPercent+=parseFloat(filled_order.profitPercent);
    //             }
                
    //         })
    //         let botInfo=botList.find(bot => bot.id === filled_orders_bot.BotId );
    //         let index=botList.indexOf(botInfo);
    //         botInfo.profitValue=profit_bot.profitValue;
    //         botInfo.profitPercent=profit_bot.profitPercent;
    //         botList.splice(index, 1, botInfo);
    //         fs.writeFileSync('./StorageData/botList.json', JSON.stringify(botList));
    //     });
    // }
    // // ===========================
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
        
        //console.log('startTime=',startTime);
        outPutFilledData.forEach(filled_orders_bot=> {
            profit_bot={
                botId:filled_orders_bot.BotId,
                profitValue: 0,
                profitPercent:0,
            };
            filled_orders_bot.buySellFilledData.forEach(filled_order => {
                let orderTime=Date.parse(filled_order.sellTime);
                //console.log('orderTime=',orderTime);
                if( startTime<=orderTime){
                    profit_bot.profitValue+=parseFloat(filled_order.profitValue);
                    profit_bot.profitPercent+=(parseFloat(filled_order.profitPercent))*(parseFloat(filled_order.profitValue));
                }
                
            });
            if(profit_bot.profitValue === 0 ){
                profit_bot.profitPercent=0
            }else{
                profit_bot.profitPercent=(profit_bot.profitPercent)/(profit_bot.profitValue);
            }
            let botInfo=botList.find(bot => bot.id === filled_orders_bot.BotId );
            let index=botList.indexOf(botInfo);
            console.log('463:botInfo=',botInfo);
            botInfo.profitValue=profit_bot.profitValue;
            botInfo.profitPercent=profit_bot.profitPercent;
            botList.splice(index, 1, botInfo);
        });
        
    }
    // ===========================
    

            
    // **************************************
    // *************************************
    // // =========manualOrdering========
    async function manualOrdering(inputData) {
        // =====================ws/trading============================
        return new Promise(function(resolve,reject){
            let socket = new WebSocket("wss://api.hitbtc.com/api/3/ws/trading");
            socket.onopen = socketDataSend2
            function socketDataSend2() {
                var SocketSessionAuthenticationData =
                {
                    "method": "login",
                    "params": {"type": "Basic","api_key": Logged_User.key1,"secret_key": Logged_User.key2}
                };
                var Subscribe_to_spot_new_order =
                {
                    "method": "spot_new_order",
                    "params": {
                        "client_order_id": generateRandom(),
                        "symbol": inputData.sym,
                        "side": inputData.side,
                        "type": "limit",
                        "quantity": inputData.quantity,
                        "price": inputData.price
                    },
                    "id": 123
                }
                
                socket.send(JSON.stringify(SocketSessionAuthenticationData));
                socket.send(JSON.stringify(Subscribe_to_spot_new_order));
            };
            socket.onmessage = async (event) => {
                let res = JSON.parse(event.data);
                try {
                    
                    //console.log('res=',res);
                    if(res.result !==true){
                        let newOrder={
                            botId:inputData.botId,
                            orderId:res.result.client_order_id,
                            sym:inputData.sym,
                            time:new Date(Date.parse(res.result.updated_at) +12600000),
                            price:res.result.price,
                            quantityBase:res.result.quantity,
                            quantity:res.result.quantity, 
                            status:res.result.status,
                            exchangeId:res.result.id,
                            side:res.result.side,
                        };
                        resolve(newOrder)
                    }
                } catch (err) {
                    //console.log(err.code);
                    alertErrorBot.push({id: uuid.v4(), msg: 'Mnaual_Order_Eror: '+err.code+':'+' '+'syms='+inputData.sym });
                    
                if (res.error ==='undefined'){
                    return;
                }else if(res.error.code === 20001){
                    alertErrorBot.push({id: uuid.v4(), msg: 'Mnaual_Order_Eror code: '+res.error.code+':'+' '+'syms='+inputData.sym });
                    
    
                }
                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }
                
            };
            socket.onclose = function (event) {
                if (event.wasClean) {
                    //console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    //console.log('[close] Connection died');
                }
            };
            socket.onerror = function (error) {
                //console.log(`[error] ${error.message}`);
            };
        })
    }
    // **************************************
    // *************************************
    // // =========chartDepict_webSocket========
    // async function chartDepict_webSocket(inputData) {
    //     // =====================ws/trading============================
    //     return new Promise(function(resolve,reject){
    //         let socket = new WebSocket("wss:/api.hitbtc.com/api/3/ws/public");
    //         socket.onopen = socketDataSend2
    //         function socketDataSend2() {
    //             var Subscribe_to_candles =
    //             {
    //                 "method": "subscribe",
    //                 "ch":"candles/"+inputData.intervalValue,
    //                 "params": {"symbols": [inputData.sym],"limit": inputData.nCandel},
    //                 "id": 123
    //             };
    //             socket.send(JSON.stringify(Subscribe_to_candles));
    //         };
    //         socket.onmessage = async (event) => {
    //             try {
    //                 if (JSON.parse(event.data).result == null){
    //                     if(JSON.parse(event.data).snapshot !=null){
    //                         // //console.log('481:',JSON.parse(event.data).snapshot);
    //                         let chartInfo=JSON.parse(event.data).snapshot;
    //                         resolve(chartInfo[inputData.sym]);
    //                         return;
    //                     }
    //                 }
    //             } 
    //             catch (err) {
    //                 //console.log(err.code);
    //                 alertErrorBot.push({id: uuid.v4(), msg: 'Mnaual_Order_Eror: '+err.code+':'+' '+'syms='+inputData.sym });
    //                 ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
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
    // ************************************
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
    // ---------------------------------------------------------------
    // ========Start of Generat client_ord_id Function==================
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
    async function available_USDT_Cumputing(){
        if (Object.keys(balanceData.FreeBalance).length !== 0){
            let availableBL=0;
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
                    const response = await getPriceSym(symbUSDT);
                    // //console.log('response=',response)
                    // //console.log('data1=',data)
                    let symPriceDate = response.data;
                    let symPrice=symPriceDate.price
                    // //console.log('symPrice=',symPrice);
                    availableBL+=(symPrice*parseFloat(balanceData.FreeBalance[symb]));
                    // //console.log('availableBL2='+availableBL);
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
                    // //console.log('symbUSDT=',symbUSDT)
                    const response = await getPriceSym(symbUSDT);
                    // //console.log('response=',response)
                    // //console.log('data1=',data)
                    let symPriceDate = response.data;
                    let symPrice=symPriceDate.price
                    // //console.log('symPrice=',symPrice);
                    availableBL+=(symPrice*parseFloat(balanceData.LockedBalance[symb]));
                    // //console.log('availableBL2='+availableBL);
                }
                
            }
            balanceData.availableUSDT=availableBL;
            // fs.writeFileSync('./StorageData/balanceData.json', JSON.stringify(balanceData));
        }
        // //console.log('balanceData.availableUSDT='+balanceData.availableUSDT);
    }
    // ----------------------------
    // ************************************
    // ************************************
    // ==============cancelErrorHanding()===========
    async function cancelErrorHandling(cancelOrderData){
        let found=outPutManualData.some(order => order.orderId===cancelOrderData.cancelOrderId)
        if (found){
            let foundNewOrder=outPutManualData.find(order => ((order.orderId===cancelOrderData.cancelOrderId) && ((order.status === 'new') || (order.status === 'partiallyFilled'))));
            if(foundNewOrder){
                let orderInfo=outPutManualData.find(order => ((order.orderId===cancelOrderData.cancelOrderId) && ((order.status === 'new') || (order.status === 'partiallyFilled'))));
                orderInfo.status='Lost Order'
                let index=outPutManualData.indexOf(orderInfo);
                outPutManualData.splice(index,1,orderInfo);
                //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);

            }else{
                let foundLostOrder=outPutManualData.find(order => ((order.orderId===cancelOrderData.cancelOrderId) && (order.status === 'Lost Order')));
                if(foundLostOrder){
                    let orderInfo=outPutManualData.find(order => ((order.orderId===cancelOrderData.cancelOrderId) && (order.status === 'Lost Order')));
                    let index=outPutManualData.indexOf(orderInfo);
                    outPutManualData.splice(index,1);
                    //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);

                }
            }
            
        }else{
            let foundBot=outPutData.some(bot => bot.BotId === cancelOrderData.botId);
            if(foundBot){
                let selectedBot=botList.filter(bot => bot.id === cancelOrderData.botId)[0];
                let indexBot_botList=botList.indexOf(selectedBot);
                let resaultBot=outPutData.find(bot => bot.BotId === cancelOrderData.botId);
                let indexBot=outPutData.indexOf(resaultBot);
                let buySellData=resaultBot.buySellData;
                let foundOrder= buySellData.some(order => ((((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.buyOrderId === cancelOrderData.cancelOrderId)) || (((order.sellStatus === 'new') || (order.sellStatus === 'partiallyFilled')) && (order.sellOrderId === cancelOrderData.cancelOrderId))));
                //console.log('471:foundOrder=',foundOrder)
                if(foundOrder){
                    let OldOrder=buySellData.find(order => ((((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && (order.buyOrderId === cancelOrderData.cancelOrderId)) || (((order.sellStatus === 'new') || (order.sellStatus === 'partiallyFilled')) && (order.sellOrderId === cancelOrderData.cancelOrderId))));
                    let indexOrder=buySellData.indexOf(OldOrder);
                    if((OldOrder.buyStatus === 'new') || (OldOrder.buyStatus === 'partiallyFilled')){
                        OldOrder.buyStatus='Lost Order';
                    }else if((OldOrder.sellStatus === 'new') || (OldOrder.sellStatus === 'partiallyFilled')){
                        OldOrder.sellStatus='Lost Order';
                    }
                    //console.log('471:OldOrder=',OldOrder)
                    buySellData.splice(indexOrder, 1,OldOrder);
                    resaultBot.buySellData=buySellData;
                    outPutData.splice(indexBot, 1, resaultBot);
                    //await stramWriteFunc(pathFile_outPutData,outPutData)
                }else{
                    let foundOrder= buySellData.some(order => (((order.buyStatus === 'Lost Order') && (order.buyOrderId === cancelOrderData.cancelOrderId)) || ((order.sellStatus === 'Lost Order') && (order.sellOrderId === cancelOrderData.cancelOrderId))));
                    //console.log('475:foundOrder=',foundOrder)
                    if(foundOrder){
                        let OldOrder=buySellData.find(order => (((order.buyStatus === 'Lost Order') && (order.buyOrderId === cancelOrderData.cancelOrderId)) || ((order.sellStatus === 'Lost Order') && (order.sellOrderId === cancelOrderData.cancelOrderId))));
                        //console.log('476:OldOrder=',OldOrder);
                        //console.log('477:OldOrder.sellStatus=',OldOrder.sellStatus)
                        if(OldOrder.buyStatus === 'Lost Order'){
                            botList[indexBot_botList]['buy_order_is_done']=false;
                            botList[indexBot_botList]['new_buy_order_info']={};
                        }else if(OldOrder.sellStatus === 'Lost Order'){
                            //console.log('478:OldOrder.sellStatus=',OldOrder.sellStatus)
                            let filled_buy_order=botList[indexBot_botList]['filled_buy_order']
                            filled_buy_order--;
                            console.log('736:filled_buy_order=',filled_buy_order);
                            botList[indexBot_botList]['filled_buy_order']=filled_buy_order;
                            // let new_buy_order_data_info=botList[indexBot_botList]['new_buy_order_info'];
                            // if(Object.keys(new_buy_order_data_info).length == 0){
                            //     botList[indexBot_botList]['buy_order_is_done']=false;
                            //     console.log('737:buy_order_is_done=',botList[indexBot_botList]['buy_order_is_done']);
                            // }
                        }
                        //await stramWriteFunc(pathFile_botList,botList);;
                        let indexOrder=buySellData.indexOf(OldOrder);
                        buySellData.splice(indexOrder, 1);
                        resaultBot.buySellData=buySellData;
                        outPutData.splice(indexBot, 1, resaultBot);
                        //await stramWriteFunc(pathFile_outPutData,outPutData)
                        // -------------------------------------
                        let foundId=corresBotId.some(bot => bot.client_order_id_buy === cancelOrderData.cancelOrderId);
                        if(foundId){
                            let corresId=corresBotId.find(bot => bot.client_order_id_buy === cancelOrderData.cancelOrderId);
                            let indexBotCorresId=corresBotId.indexOf(corresId);
                            corresBotId.splice(indexBotCorresId, 1); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                            //console.log('corresBotId22222=',corresBotId);

                        }
                        // ---------------------------------------------------
                        // -------------------------------------
                        let foundClientId=clientOrderIdBS.some(client_order_id => client_order_id === cancelOrderData.cancelOrderId);
                        if(foundClientId){
                            let indexClient=clientOrderIdBS.indexOf(cancelOrderData.cancelOrderId)
                            clientOrderIdBS.splice(indexClient,1);
                            //console.log('54:clientOrderIdBS=',clientOrderIdBS)
                            ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        }
                        // ---------------------------------------------------
                        if(botList[indexBot_botList]["stop_buttom"]===false && botList[indexBot_botList]["delete_buttom"]===false){
                            botList[indexBot_botList]["edit_buttom"]=true;
                            //await stramWriteFunc(pathFile_botList,botList);;
                            console.log('738:cancelOrderData.botId=',cancelOrderData.botId);
                            await B1DownEs(cancelOrderData.botId);
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
    // ==============ereas outputDate of selected bot()===========
    function eraesed_outputDate(eraesed_botId){
        let selectedBot=outPutData.find(bot => bot.BotId === eraesed_botId);
        let botIndex=outPutData.indexOf(selectedBot);
        outPutData.splice(botIndex, 1);
        

    }
    // ***********************************************
    // ***********************************************
    // ==============ereas outputFilledDate of selected Filled bot()===========
    function eraesed_outputFilledDate(eraesed_botId){
        let selectedFilledBot=outPutFilledData.find(bot => bot.BotId === eraesed_botId);
        let FilledBotIndex=outPutFilledData.indexOf(selectedFilledBot);
        outPutFilledData.splice(FilledBotIndex, 1);
        

    }
    // *****************************************
    // *****************************************
    // ==============ereas corresBotId of selected Filled bot===========
    function eraesed_corresBotId(eraesed_botId){
        let corresId=corresBotId.filter(bot => bot.BotId != eraesed_botId);
        corresBotId.splice(0, corresBotId.length);
        corresBotId.push(...corresId);
        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);

    }
    // *****************************************
    // *****************************************
    // ==============ereas clientOrderIdBS of selected Filled bot===========
    function eraesed_clientOrderIdBS(){
        let ubdate_clientOrderIdBS=new Array();
        corresBotId.forEach(element=> {
            let not_Include_id_buy = !ubdate_clientOrderIdBS.includes(element.client_order_id_buy);
            if(not_Include_id_buy){
                if(element.client_order_id_buy != "" ){
                    ubdate_clientOrderIdBS.push(element.client_order_id_buy)
                }
            }
            let not_Include_id_sell = !ubdate_clientOrderIdBS.includes(element.client_order_id_sell);
            if(not_Include_id_sell){
                if(element.client_order_id_sell != "" ){
                    ubdate_clientOrderIdBS.push(element.client_order_id_sell)
                }
            }

        });
        //console.log('356:ubdate_clientOrderIdBS=',ubdate_clientOrderIdBS);
        clientOrderIdBS.splice(0, clientOrderIdBS.length);
        clientOrderIdBS.push(...ubdate_clientOrderIdBS);
        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
    }
    // ****************************************
    // ****************************************
    // ==============ereas botList of selected bot===========
    function eraesed_botList(eraesed_botId){
        let erasedBot=botList.find(bot => bot.id === eraesed_botId);
        let index=botList.indexOf(erasedBot);
        alertErrorBot.push({id: uuid.v4(), msg: 'earesed id='+' '+eraesed_botId});
        botList.splice(index,1);
        
    }
    // *************************************
    // *****************************************
    // --------------------------------------
    // ==============ereas chartData of selected bot()===========
    function eraesed_chartData(eraesed_botId){
        let selectedBot=chartData.find(bot => bot.BotId === eraesed_botId);
        let botIndex=chartData.indexOf(selectedBot);
        chartData.splice(botIndex, 1);
        fs.writeFileSync('./StorageData/chartData.json', JSON.stringify(chartData));
    }
    // ***********************************************

    // ===============================================================================================
    // ====================B1DownEs()==============
    async function B1DownEs(idBot) {
        // ++++++++++++++++++++++++++++++++++++++
        //console.log('idBot=',idBot)
        let selectedBot=botList.filter(bot => bot.id === idBot)[0];
        let indexBot=botList.indexOf(selectedBot);
        let new_buy_order_info={};
        let new_all_sell_orders_info=new Array();
        new_buy_order_info.buyOrderId='NoId';
        let foundBot= outPutData.some(bot => bot.BotId === selectedBot.id);
        if (foundBot){
            let resaultBot=outPutData.find(bot => bot.BotId === selectedBot.id);
            // let indexBot_outPutData=outPutData.indexOf(resaultBot);
            let buySellData=resaultBot.buySellData;
            let foundBuyOrder= buySellData.some(order => (order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled'));
            if (foundBuyOrder){
                new_buy_order_info= buySellData.find(order => (order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled'));
            }
            let foundSellOrder= buySellData.some(order => order.sellStatus === 'new');
            //console.log('foundSellOrder=',foundSellOrder)
            if (foundSellOrder){
                new_all_sell_orders_info= buySellData.filter(order => order.sellStatus === 'new');
                //console.log('new_all_sell_orders_info=',new_all_sell_orders_info)
            }

        }
        
        // //console.log('indexBot=',indexBot);
        //console.log('botList['+indexBot+']=',botList[indexBot]);
        // //console.log('botList[indexBot][filled_buy_order]=',filled_buy_order);
        


        
        // let num_buy_new_order = 0;

        // +++++++++++++++++++++++++++++++++++++++++++++++
        // ------------------------------------------------
        let sym = selectedBot.sym;
        // let add_buttom =selectedBot.add_buttom;
        // let edit_buttom =selectedBot.edit_buttom;
        // let delete_buttom = selectedBot.delete_buttom;
        // let stop_buttom = selectedBot.stop_buttom;
        // -----------------------------------------------
        // ++++++++++++++++++++++++++++++++++++++++++
        // +++++++++++++++initial value+++++++++++++++++++++
        // let SpotPrice = 0;
        // let SpotPrice=botList[indexBot]['SpotPrice'];
        // let filled_buy_order=botList[indexBot]['filled_buy_order'];
        // let filled_buy_order=0
        // //console.log("71:filled_buy_order =", botList[indexBot]['filled_buy_order']);
        let symL
        let symR
        // let minCheckCandlePrice
        
        // let diff_buy_spot =0;
        // let cancel_order_is_done = false;
        // let buy_order_is_done = false;
        // let ws_public_close = false;
        // let ws_trading_close = false;
        let corres_order_info=new Array();
        let erorFoundingCode='';
        // ++++++++++++++++++++++++++++++++++++++++++++++++
        // -------------------------------------------------
        // =====================BOLINGER PARAMETRES=========
        
        let BOLU
        let BOLD
        let m_BOL = 2;
        // let openPrice = new Array();
        // let closePrice = new Array();
        // let lowPrice = new Array();
        // let highPrice = new Array();
        let squarData = new Array();
        // let timeStep
        // let tick_snapshot
        let last_min_check_candle_buy =0;
        // ====================================
        // ++++++++++++++++++++++++++++++++++++

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
        ws_socket_V3();


        function ws_socket_V3() {
            // ===========================
            // if (typeof WebSocket !== 'function') {
            //     // for node.js install ws package
            //     WebSocket = require('ws');
            // }
            class SocketClient {

                constructor(onConnected) {
                    this._id = 1;
                    this._createSocket_trading();
                    this._onConnected = onConnected;
                    this._promises = new Map();
                    this._handles = new Map();
                }


                _createSocket_trading() {
                    this._ws = new WebSocket('wss://api.hitbtc.com/api/3/ws/trading');
                    this._ws.onopen = () => {
                        try{
                            console.log('770:indexBot=',indexBot);
                            died_connection=false;
                            //console.log('ws/trading connected');
                            // alertErrorBot.push({id: uuid.v4(), msg: 'ws/trading connected of '+' '+botList[indexBot]['sym']+'  '+'id='+(botList[indexBot]['id'])});
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            this._onConnected();
                            // if (startBot){
                            //     socketApi.request('spot_subscribe');
                            //     startBot=false;
                            // }

                        }catch(e){
                            console.log('771:ws_trading_eror=',e);
                            console.log('772:indexBot=',indexBot);
                            console.log('773:botList=',botList);
                        }
                    };
                    this._ws.onclose = (err) => {
                        console.log('296:',err);
                        this._promises.forEach((cb, id) => {
                            this._promises.delete(id);
                            cb.reject(new Error('Disconnected'));
                        });
                        startBot=true;
                        died_connection=true;
                        console.log('001T:startBot='+startBot)
                        console.log('001T:concetion is died: (ws-trading socket is closed )');
                        setTimeout(() => this._createSocket_trading(), 500);
                        // if (botList.length>0) rebootFunction()
                        // setTimeout(() => rebootFunction(), 10000);
                        
                    };
                    this._ws.onerror = err => {
                        startBot=true;
                        died_connection=true;
                        console.log('002T:startBot='+startBot)
                        console.log('002T:concetion is died: (ws-trading socket is closed ):err is:', err);
                    };
                    this._ws.onmessage = async (msg) => {
                        try {
                            const message = JSON.parse(msg.data);
                            if (message.id) {
                                // console.log('388:message=',message);
                                if (this._promises.has(message.id)) {
                                    // console.log('389:this._promises',this._promises.get(message.id));
                                    const cb = this._promises.get(message.id);
                                    this._promises.delete(message.id);
                                    if (message.result) {
                                        cb.resolve(message.result);
                                    } else if (message.error) {
                                        cb.reject(message.error);
                                    } else {
                                        console.log('400:Unprocessed response0', message)
                                    }
                                }
                            } else if (message.method && message.params) {
                                if (this._handles.has(message.method)) {
                                    this._handles.get(message.method).forEach(cb => {
                                        cb(message.params);
                                        // console.log('402:message.params=',message.params)
                                    });
                                } else {
                                    // let foundBot=botList.some(bot => bot.id === idBot);
                                    // if(foundBot){
                                    //     let selectedBot=botList.filter(bot => bot.id === idBot)[0];
                                    //     let indexBot=botList.indexOf(selectedBot);
                                    //     let data = message.params;
                                    //     if (data.length != 0) {
                                    //         //console.log('57:message=',message);
                                    //         execution_update_order_sell(message);
                                    //     }
                                    //     if (botList[indexBot]['delete_buttom']==true && botList[indexBot]['buy_order_is_done']==false) {
                                    //         // this._ws.close();
                                    //         //console.log('74:'+botList[indexBot]['sym']+':delete_buttom=' + botList[indexBot]['delete_buttom']+':ws_trading_close');
                                    //         alertErrorBot.push({id: uuid.v4(), msg: '74:ws_trading_close of '+' '+botList[indexBot]['sym']+'  '+'id='+botList[indexBot]['id']});
                                    //         ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                    //     }  
                                    // }else{
                                    //     // this._ws.close();
                                    //     //console.log('60:'+idBot+' '+'can not be fond....maybe it was ereased');
                                    // }
                                    // console.log('403:message=',message)
                                    let data = message.params;
                                    if (data.length != 0) {
                                        // console.log('57:message=',message);
                                        execution_update_order_sell(message);
                                    }
                                    
                                }
                            
                            } else {
                                //console.log('Unprocessed response2', message)
                            }
                        } catch (e) {
                            console.log('408:Fail parse message', e);
                        }
                    }
                }
                

                request(method, params = {}) {
                    if (this._ws.readyState === WebSocket.OPEN) {
                        return new Promise((resolve, reject) => {
                            const requestId = ++this._id;
                            this._promises.set(requestId, { resolve, reject });
                            const msg = JSON.stringify({ method, params, id: requestId });
                            // //console.log('>',msg)
                            this._ws.send(msg);
                            setTimeout(() => {
                                if (this._promises.has(requestId)) {
                                    this._promises.delete(requestId);
                                    startBot=true;
                                    console.log('003:startBot='+startBot)
                                    reject(new Error('Timeout'));
                                }
                            }, 10000);
                        });
                    } else {
                        return Promise.reject(()=>{
                            new Error('WebSocket connection not established');
                            alertErrorBot.push({id: uuid.v4(), msg: 'ws/trading connection of '+' '+botList[indexBot]['sym']+'  '+'id='+botList[indexBot]['id']+'not established: DELETE BOT AND ADD NEW BOT'});
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                        })
                    }
                }
            }
            // ============================

            class SocketClient_public {

                constructor(onConnected) {
                    this._id = 1;
                    this._createSocket_public();
                    this._onConnected = onConnected;
                    this._promises = new Map();
                    this._handles = new Map();
                }


                _createSocket_public() {
                    this._ws = new WebSocket('wss://api.hitbtc.com/api/3/ws/public');
                    this._ws.onopen = () => {
                        try{
                            console.log('760:indexBot=',indexBot);
                            died_connection=false;
                            // alertErrorBot.push({id: uuid.v4(), msg: 'ws/public connected of '+' '+botList[indexBot]['sym']+'  '+'id='+botList[indexBot]['id']});
                            // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            this._onConnected();

                        }catch(e){
                            console.log('761:ws_public_eror=',e);
                            console.log('762:indexBot=',indexBot);
                            console.log('763:ibotList=',botList);
                        }
                    };
                    this._ws.onclose = (err) => {
                        console.log('387:',err);
                        this._promises.forEach((cb, id) => {
                            this._promises.delete(id);
                            cb.reject(new Error('Disconnected'));
                        });
                        console.log('001P:concetion is died: (ws-Public socket is closed )');
                        if(died_connection){
                            console.log('408:died_connection:',died_connection);
                            setTimeout(() => this._createSocket_public(), 500);
                        }else{
                            let foundBot=botList.some(bot => bot.id === idBot)
                            if(foundBot){
                                let selectedBot=botList.filter(bot => bot.id === idBot)[0];
                                let indexBot=botList.indexOf(selectedBot);
                                if (botList[indexBot]['delete_buttom']==false) {
                                    console.log('006:ws_public_close')
                                    setTimeout(() => this._createSocket_public(), 500);
                                }else if (botList[indexBot]['buy_order_is_done'] == false && botList[indexBot]['delete_buttom']==true ) {         
                                    this._ws.close();
                                    alertErrorBot.push({id: uuid.v4(), msg: 'ws_public_close of '+' '+botList[indexBot]['sym']+'  '+'id='+botList[indexBot]['id']+':delete_buttom=' + botList[indexBot]['delete_buttom']});
                                    // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                };
                            }else{
                                this._ws.close();
                                alertErrorBot.push({id: uuid.v4(), msg: 'ws_public_close:  of BOT with id='+idBot+' '+'can not be fond....maybe it was ereased'});
                                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                //console.log('70:'+idBot+' '+'can not be fond....maybe it was ereased');
                            }

                        }
                    };
                    this._ws.onerror = err => {
                        startBot=true;
                        died_connection=true;
                        console.log('002P:startBot='+startBot)
                        console.log('002P:concetion is died: (ws-public socket is closed', err);
                    };
                    this._ws.onmessage = async (msg) => {
                        try {
                            const message = JSON.parse(msg.data);
                            if (message.id) {
                                if (this._promises.has(message.id)) {
                                    const cb = this._promises.get(message.id);
                                    this._promises.delete(message.id);
                                    if (message.result) {
                                        cb.resolve(message.result);

                                    } else if (message.error) {
                                        cb.reject(message.error);
                                    } else {
                                        //console.log('Unprocessed response0', message)
                                    }
                                }
                            } else {
                                let foundBot=botList.some(bot => bot.id === idBot)
                                if(foundBot){
                                    let selectedBot=botList.filter(bot => bot.id === idBot)[0];
                                    let indexBot=botList.indexOf(selectedBot);
                                    // //console.log('8:indexBot='+indexBot);
                                    // //console.log('72:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
                                    if (botList[indexBot]['delete_buttom']==false) {
                                        // //console.log('Unprocessed response2', message)
                                        // //console.log('START- min_check_candle_bolinger');
                                        let old_price=botList[indexBot]['price'];
                                        min_check_candle_bolinger(message,indexBot);
                                        // //console.log('9:indexBot='+indexBot);
                                        // //console.log('73:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
                                        console.log('485:price='+botList[indexBot]['price'])
                                        if(botList[indexBot]['softBuy']==false){
                                            if((botList[indexBot]['nCC']>0 && botList[indexBot]['price']<=botList[indexBot]['closeUpCheckCandle']) || (botList[indexBot]['nCC']=='0')){
                                                if (botList[indexBot]['price'] != old_price && botList[indexBot]['dead']==false){
                                                    if (botList[indexBot]['filled_buy_order']<= botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false) {
                                                        // console.log('74:botList[indexBot]["sym"]='+botList[indexBot]['sym']);
                                                        let new_buy_order_data_info=newBuyOrderDataInfo(indexBot);
                                                        // console.log("444=new_buy_order_data_info",new_buy_order_data_info)
                                                        if(Object.keys(new_buy_order_data_info).length == 0){
                                                            new_buy_order_data_info.buyOrderId='NoId';
                                                        }
                                                        if (new_buy_order_data_info.buyOrderId !='NoId'){
                                                            let found=corresBotId.some(bot => bot.BotId === selectedBot.id && (bot.statusBuy==='new' || bot.statusBuy==='partiallyFilled'));
                                                            if (found){
                                                                let corresId=corresBotId.filter(bot => bot.BotId === selectedBot.id && (bot.statusBuy==='new' || bot.statusBuy==='partiallyFilled'))[0];
                                                                let diff_buy_spot=corresId.diff_buy_spot;
                                                                // console.log('10:botList['+indexBot+']["price"]='+botList[indexBot]['price']);
                                                                // console.log('11:new_buy_order_data_info.buyPrice='+new_buy_order_data_info.buyPrice);
                                                                // console.log('12:diff_buy_spot='+diff_buy_spot);
                                                                // console.log('13:(10:botList[indexBot]["price"] - new_buy_order_data_info.buyPrice) - diff_buy_spot=',((botList[indexBot]['price'] - new_buy_order_data_info.buyPrice) - diff_buy_spot));
                                                                if((botList[indexBot]['price'] - new_buy_order_data_info.buyPrice) - diff_buy_spot > 0){
                                                                    // console.log("buy_follow should start:");
                                                                    // await buy_follow(indexBot,diff_buy_spot);
                                                                    if (clientOrderIdBS.includes(new_buy_order_data_info.buyOrderId)){
                                                                        await buy_follow(indexBot,diff_buy_spot,new_buy_order_data_info);

                                                                    }else {
                                                                        //console.log('clientOrderIdBS has not' + '' + new_buy_order_data_info.buyOrderId);
                                                                    } 
                                                                }

                                                            }else{
                                                                //console.log('475:can not found corresId with bot id=',selectedBot.id);
                                                            }
                                                            
                                                        
                                                        }
                                                    } else if(botList[indexBot]['filled_buy_order']>= botList[indexBot]['MO'] ){
                                                        //console.log('27:filled_buy_order=' + (botList[indexBot]['filled_buy_order']) + '>max_order=' + botList[indexBot]['MO']);
                
                                                    }
            
                                                }
                                                //console.log(botList[indexBot]['sym']+':'+ 'botList[indexBot]["price"]: ' + botList[indexBot]["price"]+'         '+'  filled_buy_order=' + (botList[indexBot]['filled_buy_order']) + '   ' + 'max_order=' +botList[indexBot]['MO']);
                                            }else if(botList[indexBot]['price']>botList[indexBot]['closeUpCheckCandle']){
                                                //console.log('842:buy follow is not done:(SpotPrice='+botList[indexBot]['price']+')>(closeUpCheckCandle='+botList[indexBot]['closeUpCheckCandle'])
                                            }

                                        }
                                        
                                        
                                    } else if (botList[indexBot]['buy_order_is_done'] == false && botList[indexBot]['delete_buttom']==true ) {
                                        
                                        this._ws.close();
                                        //console.log('72:'+botList[indexBot]['sym']+':delete_buttom=' + botList[indexBot]['delete_buttom']);
                                    };
                                    
                                }else{
                                    this._ws.close();
                                    //console.log('65:'+idBot+' '+'can not be fond....maybe it was ereased');
                                }
                                
                            }
                            
                            
                        } catch (e) {
                            //console.log('Fail parse message', e);
                        }
                    }
                }

                request_public(method, ch, params = {}) {
                    if (this._ws.readyState === WebSocket.OPEN) {
                        return new Promise((resolve, reject) => {
                            const requestId = ++this._id;
                            this._promises.set(requestId, { resolve, reject });
                            const msg = JSON.stringify({ method, ch, params, id: requestId });
                            this._ws.send(msg);
                            setTimeout(() => {
                                if (this._promises.has(requestId)) {
                                    this._promises.delete(requestId);
                                    startBot=true;
                                    console.log('005:startBot='+startBot)
                                    reject(new Error('Timeout'));
                                }
                            }, 10000);
                        });
                    } else {
                        return Promise.reject(new Error('WebSocket connection not established'))
                    }
                }
            }
            //  ***************************************
            // ==================start of socketApi Functions=====================

            //console.log('Start application');
            // ==========================================
            // ------------------------------------------------
            const socketApi_public = new SocketClient_public(async () => {
                try {
                    if (botList[indexBot]['delete_buttom']==true && botList[indexBot]['buy_order_is_done'] == false){
                        //console.log('18:delete_buttom='+botList[indexBot]['delete_buttom'] +'&& buy_order_is_done='+ 'botList[indexBot]["buy_order_is_done"]= '+botList[indexBot]['buy_order_is_done']);
                    }else{
                        await socketApi_public.request_public('subscribe', 'candles/' + (selectedBot.tCC), { symbols: [sym], limit: (selectedBot.nCC+1) });
                    }
                    
                } catch (e) {
                    //console.log(e);
                    alertErrorBot.push({id: uuid.v4(), msg: 'socketApi_public erorr:'+e});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }
            });
            // -------------------------------------------------
            const socketApi = new SocketClient(async () => {
                
                try {
                    await socketApi.request('login', {"type": "Basic","api_key": Logged_User.key1, "secret_key": Logged_User.key2});
                    // -------------------------------------------------
                    // //console.log('31:filled_buy_order='+botList[indexBot]['filled_buy_order']);
                    // //console.log('32:botList[indexBot]["MO"]='+botList[indexBot]['MO']);
                    if(botList[indexBot]['dead']==true){
                        await socketApi.request('spot_subscribe');
                        //console.log('31:botList['+indexBot+']["dead"]='+botList[indexBot]['dead'])
                        if (new_buy_order_info.buyOrderId !='NoId') {
                            // ------start of neededQuantity calculation-------
                            let mathIDPB=Math.pow((1+botList[indexBot]['IDPB']/100),botList[indexBot]['filled_buy_order']);
                            let DPB_coeff=botList[indexBot]['DPB']*mathIDPB;
                            if(botList[indexBot]['softBuy']==true){
                                DPB_coeff=(botList[indexBot]['DPB']+botList[indexBot]['SDPB'])*mathIDPB;
                            }
                            let mathIQ=Math.pow((1+botList[indexBot]['IQ']/100),botList[indexBot]['filled_buy_order']);
                            let buyQuantity=botList[indexBot]['FirstQuantity']*mathIQ;
                            let RDPB=1-(DPB_coeff)/100;
                            let neededQuantity=buyQuantity*(RDPB*botList[indexBot]['price']);
                            // -----end of neededQuantity calculation----------
                            
                            // await socketApi.request('spot_unsubscribe');
                            
                            await cancel_order(new_buy_order_info.buyOrderId,indexBot);
                            //console.log('60:order concelled')
                            await BuyOrder(new_buy_order_info.buyPrice, new_buy_order_info.buyQuantityBase,indexBot,neededQuantity);
                            // await socketApi.request('spot_subscribe');
                        };
                        if (new_all_sell_orders_info.length>0){
                            for (const sellOrderInfo of new_all_sell_orders_info){
                                // let indexSellOrder=new_all_sell_orders_info.indexOf(sellOrderInfo);
                                await cancel_order(sellOrderInfo.sellOrderId,indexBot);
                                // await SellOrder(sellOrderInfo.sellPrice, sellOrderInfo.sellQuantityBase, sym,indexBot);
                                // await ReplaceSellOrder(sellOrderInfo.sellOrderId, sellOrderInfo.sellPrice, sellOrderInfo.sellQuantityBase,indexBot);
                                // await socketApi.request('spot_subscribe');
                            }

                        }
                        botList[indexBot]['dead']=false
                    }else{
                        if(botList[indexBot]['add_buttom']==true){
                            console.log('851:startBot=',startBot)
                            if (startBot){
                                //console.log('713:startBot-spot_subscribe RUN=',startBot);
                                await socketApi.request('spot_subscribe');
                                startBot=false;
                                //console.log('714:startBot=',startBot);
                            }
                            if ((botList[indexBot]['filled_buy_order']) <= botList[indexBot]['MO']) {
                                //console.log('botList[indexBot]["price"]='+botList[indexBot]['price']);
                                // if (SpotPrice==0){
                                //     SpotPrice=selectedBot.price;
                                //     //console.log('SpotPrice1='+SpotPrice);
                                // }
                                
                                //console.log('16:'+":buy_order_is_done="+':'+botList[indexBot]['buy_order_is_done']);
                                if (botList[indexBot]['buy_order_is_done']==false) {
                                    await douwn_percent_order_buy(indexBot);
                                    botList[indexBot]['add_buttom']=false;
                                    //await stramWriteFunc(pathFile_botList,botList);;
                                }
                            };
                        }else if (botList[indexBot]['edit_buttom'] == true) {
                        if (botList[indexBot]['buy_order_is_done'] == false && botList[indexBot]['filled_buy_order']< botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false) {
                                // //console.log('filled_buy_order='+(botList[indexBot]['filled_buy_order']));
                                // //console.log('max_order='+botList[indexBot]['MO']);
                                //console.log('botList[indexBot]["price"]='+botList[indexBot]['price']);
                                // if (SpotPrice==0){
                                //     SpotPrice=selectedBot.price;
                                //     // SpotPrice=botList[indexBot]['price'];
                                //     //console.log('selectedBot.price='+selectedBot.price);
                                //     // //console.log("botList[indexBot]['price']="+botList[indexBot]['price'])
                                    
                                //     //console.log('SpotPrice1='+SpotPrice);
                                // }
                                await douwn_percent_order_buy(indexBot);
                                // (botList[indexBot]['filled_buy_order'])++
                            
                            };
                            if (botList[indexBot]['buy_order_is_done'] == true && botList[indexBot]['filled_buy_order']>= botList[indexBot]['MO'] && botList[indexBot]['stop_buttom'] == false ){
                                //console.log('77:new_buy_order_info.buyOrderId=',new_buy_order_info.buyOrderId);
                                if (new_buy_order_info.buyOrderId !='NoId') await cancel_order(new_buy_order_info.buyOrderId,indexBot);
                                
                            }
                            // await socketApi.request('spot_subscribe');
                            
                            botList[indexBot]['edit_buttom'] = false;
                            //await stramWriteFunc(pathFile_botList,botList);;
                            // //console.log('41:botList[indexBot]["edit_buttom"] = '+botList[indexBot]['edit_buttom']);
                        } else if (botList[indexBot]['stop_buttom'] == true) {
                            if (new_buy_order_info.buyOrderId !='NoId') {
                                await cancel_order(new_buy_order_info.buyOrderId,indexBot);
                                // await socketApi.request('spot_subscribe');
                            }
                        }else if (botList[indexBot]['delete_buttom']){
                            if (new_buy_order_info.buyOrderId !='NoId') {
                                await cancel_order(new_buy_order_info.buyOrderId,indexBot);
                                botList[indexBot]['buy_order_is_done'] = false;
                                //await stramWriteFunc(pathFile_botList,botList);;
                            }
                            // await socketApi.request('spot_subscribe');
                            // let indexClient=clientOrderIdBS.indexOf(new_buy_order_info.buyOrderId)
                            // clientOrderIdBS.splice(indexClient,1);
                            // fs.writeFileSync('./StorageData/clientOrderIdBS.json', JSON.stringify(clientOrderIdBS));
                            
        
                        }
                    }
                    
                    // -------------------------------------------------


                    


                    // await socketApi.request('subscribeCandles', {symbol: 'TRXUSD', period: 'M1', limit: '21'});
                    // await socketApi.request('spot_subscribe');
                    // await BuyOrder(BuyPrice,symQuantity,sym);
                    // await socketApi.request('newOrder', {clientOrderId: generateRandom(), symbol: 'TRXUSD', side: 'sell', price: '0.3', quantity: '20'});

                    // await socketApi.request('subscribeReports');

                    // // =======================================
                    // //console.log('START');
                    // await BuyOrder(BuyPrice,symQuantity,sym);
                    // await balance_update_symR();
                    // //console.log('END');
                    // // =====================================

                    // ======================================

                    // place order

                    // await socketApi.request('spot_new_order', {symbol: 'TRXUSDT', side: 'sell', price: '0.3', quantity: '100'});


                } catch (e) {
                    //console.log(e);
                    alertErrorBot.push({id: uuid.v4(), msg: 'SocketClient erorr:'+e});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }
            });
            // -------------------------------------------------
            // ==============================END of socketApi Functions============
            //  ****************************************************************
            // =========================start of trading Functions==============
            // ---------------------------------------------------------
            // =====BuyOrder Function=============================
            async function BuyOrder(BSprice, symQuantity,indexBot_trading,neededQuantity) {
                let sym=botList[indexBot_trading]['sym']
                //console.log('41:'+sym+':BuyOrder input Price=',BSprice);
                let roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
                // //console.log('414:symQuantity=',symQuantity);
                // //console.log('415:quantity_increment=',symInfo[sym].quantity_increment);
                //console.log('22:roundQuantity='+roundQuantity);
                symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
                //console.log('41:'+sym+':BuyOrder input Quantity=',symQuantity);

                let diff_buy_spot = botList[indexBot_trading]['price'] - BSprice;
                //console.log('diff_buy_spot=',diff_buy_spot)
                if (diff_buy_spot<=0){
                    //console.log('diff_buy_spot<=0');
                    botList[indexBot_trading]['price']=0.9*botList[indexBot_trading]['price'];
                    //await stramWriteFunc(pathFile_botList,botList);;
                    BSprice=botList[indexBot_trading]['price'];
                    diff_buy_spot = botList[indexBot_trading]['price'] - BSprice;
                    //console.log('NewBSprice=',BSprice)
                    alertErrorBot.push({id: uuid.v4(), msg:'Warning(01:Your first price is higher than Spot Price of)'+' '+ sym+'(we put the buy order price 0.1% lower than spot price)'}); 
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    
                }
                let client_order_id_buy_sell = generateRandom();
                try {
                    clientOrderIdBS.push(client_order_id_buy_sell);
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                    //console.log('173:clientOrderIdBS=',clientOrderIdBS)
                    corres_order_info[indexBot_trading]='19:'+sym+'new buy:'+client_order_id_buy_sell;
                    //console.log('174:corres_order_info[indexBot_trading]='+corres_order_info[indexBot_trading]);
                    // botList[indexBot_trading]['corres_order_info']=corres_order_info;
                    //   ---------------------------------------------------
                    let foundBot=corresBotId.some(bot => ((bot.BotId === botList[indexBot_trading]['id']) && (bot.statusBuy=='new')));
                    if (foundBot){
                        let corresId=corresBotId.find(bot => ((bot.BotId === botList[indexBot_trading]['id']) && (bot.statusBuy=='new')));
                        //console.log('512:foundBot=',corresId);
                        let indexCorresId=corresBotId.indexOf(corresId);
                        corresBotId.splice(indexCorresId, 1,{'BotId':botList[indexBot_trading]['id'],'client_order_id_buy':client_order_id_buy_sell,'statusBuy':'new','diff_buy_spot':diff_buy_spot,'client_order_id_sell':'','statusSell':''}); 
                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                    }else{
                        corresBotId.push({'BotId':botList[indexBot_trading]['id'],'client_order_id_buy':client_order_id_buy_sell,'statusBuy':'new','diff_buy_spot':diff_buy_spot,'client_order_id_sell':'','statusSell':''});
                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                    }
                    //console.log( '213:corresBotId1=', corresBotId);
                    // -----------------------------------
                    // //console.log('42:'+sym+'client_order_id_buy='+client_order_id_buy_sell);
                    botList[indexBot_trading]['buy_order_is_done'] = true; 
                    //await stramWriteFunc(pathFile_botList,botList);;
                    await socketApi.request('spot_new_order', { client_order_id: client_order_id_buy_sell, symbol: sym, side: 'buy', price: BSprice, quantity: symQuantity });
                } catch (err) {
                    botList[indexBot_trading]['buy_order_is_done'] = false;
                    //await stramWriteFunc(pathFile_botList,botList);;
                    //console.log('6:',err);
                    //console.log(err.code);
                    alertErrorBot.push({id: uuid.v4(), msg: 'buyOrder Eror code: '+err.code+' '+' '+sym+'  '+'BotId='+botList[indexBot_trading]['id']});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    if (err.code == '20001' || err.code == '2011'){
                        if (err.code == '20001'){
                            // //console.log( '12:client_order_id_buy_sell=', client_order_id_buy_sell);
                            let corresId=corresBotId.filter(order => order.client_order_id_buy === client_order_id_buy_sell)[0];
                            let index=corresBotId.indexOf(corresId);
                            corresBotId.splice(index, 1); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                            //console.log( '214:corresBotId0=', corresBotId);
                            let indexClient=clientOrderIdBS.indexOf(client_order_id_buy_sell)
                            clientOrderIdBS.splice(indexClient,1);
                            ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                            let Free_fund=await balance_update_symR();
                            // let DPB_coeff=botList[indexBot_trading]['DPB'];
                            // if(botList[indexBot_trading]['softBuy']==true){
                            //     DPB_coeff=botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB'];
                            // }
                            // let RDPB=1-(DPB_coeff)/100;
                            // let new_buyQuantity=Free_fund/(RDPB*botList[indexBot_trading]['price']);
                            let new_buyQuantity=Free_fund/(BSprice);
                            let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                            //console.log('21:new_roundQuantity='+new_roundQuantity);
                            let new_symQuantity=(new_roundQuantity)*(symInfo[sym].quantity_increment);
                            if (new_roundQuantity<2){
                                erorFoundingCode='2011';
                                let lowQuantity_botId=botList[indexBot_trading]['id']
                                await checking_funds(erorFoundingCode,lowQuantity_botId);
                                return;
                            }else{
                                if (new_roundQuantity>=roundQuantity){
                                    new_symQuantity=(roundQuantity-1)*(symInfo[sym].quantity_increment);
                                }
                                //console.log('14:'+sym+':FirstQuantity='+botList[indexBot_trading]['quantity'])
                                //console.log('15:'+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund+'  '+'lower than '+' '+ neededQuantity);
                                alertErrorBot.push({id: uuid.v4(), msg:'Warning(20001:Insufficient funds)'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund+'  '+'lower than '+' '+ neededQuantity}); 
                                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                await BuyOrder(BSprice, new_symQuantity,indexBot_trading,neededQuantity);
                            }
                        }else{
                            // -------------
                            let corresId=corresBotId.filter(order => order.client_order_id_buy === client_order_id_buy_sell)[0];
                            let index=corresBotId.indexOf(corresId);
                            corresBotId.splice(index, 1); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                            //console.log( '214:corresBotId0=', corresBotId);
                            let indexClient=clientOrderIdBS.indexOf(client_order_id_buy_sell)
                            clientOrderIdBS.splice(indexClient,1);
                            ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                            // ------------------
                            erorFoundingCode=err.code;
                            let lowQuantity_botId=botList[indexBot_trading]['id']
                            await checking_funds(erorFoundingCode,lowQuantity_botId);
                            return;
                        }
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
                    clientOrderIdBS.push(client_order_id_buy_sell); 
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                    // //console.log('client_order_id_buy_sell=' + client_order_id_buy_sell);
                    // -------------------------------------
                    let foundBotId=corresBotId.some(order => order.BotId === botList[indexBot_trading]['id'] && order.statusBuy==='filled' && order.client_order_id_sell==='');
                    if (foundBotId){
                        let foundBotId=corresBotId.filter(order => order.BotId === botList[indexBot_trading]['id'] && order.statusBuy==='filled' && order.client_order_id_sell==='')[0];
                        let index=corresBotId.indexOf(foundBotId);
                        corres_order_info[indexBot_trading]='20:'+sym+'new sell:'+'old buy id:'+foundBotId.client_order_id_buy
                        // botList[indexBot_trading]['corres_order_info']=corres_order_info;
                        // //console.log('foundBotId0=',foundBotId)
                        // //console.log('corresBotId0=',corresBotId)
                        corresBotId.splice(index, 1, {'BotId':foundBotId.BotId,'client_order_id_buy':foundBotId.client_order_id_buy, 'statusBuy':foundBotId.statusBuy,'diff_buy_spot':foundBotId.diff_buy_spot, 'client_order_id_sell':client_order_id_buy_sell,'statusSell':'' }); 
                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                        // //console.log('corresBotId1=',corresBotId)
                    }else{
                        //console.log('can not found BotId of sell order');
                        //console.log('87:corresBotId=',corresBotId);
                        corres_order_info[indexBot_trading]='21:'+sym+'new sell:'+'old buy id:'+'con not found';
                        // botList[indexBot_trading]['corres_order_info']=corres_order_info;
                        alertErrorBot.push({id: uuid.v4(), msg:'can not found BotId of sell order'}); 
                        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    }
                    // -----------------------------------
                    // correspondingBuySellOrderId.add(client_order_id_buy_sell);
                    await socketApi.request('spot_new_order', { client_order_id: client_order_id_buy_sell, symbol: sym, side: 'sell', price: BSprice, quantity: symQuantity });
                } catch (err) {
                    //console.log("SellOrder Eror");
                    //console.log('7:',err);
                    alertErrorBot.push({id: uuid.v4(), msg: 'SellOrder Eror code: '+err.code+' '+' '+sym+'  '+'BotId='+botList[indexBot_trading]['id']});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    
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
                //console.log('22:client_order_id_buy_sell='+client_order_id_buy_sell)
                roundQuantity=Math.floor(symQuantity/(symInfo[sym].quantity_increment));
                let corressOldId=corresBotId.find(order => order.client_order_id_buy === old_claient_order_id);
                try {
                    clientOrderIdBS.push(client_order_id_buy_sell); 
                    
                    // --------------------
                    if (clientOrderIdBS.includes(old_claient_order_id)){
                        let indexClient=clientOrderIdBS.indexOf(old_claient_order_id);
                        clientOrderIdBS.splice(indexClient,1); 
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        //console.log('35:clientOrderIdBS=',clientOrderIdBS);
                        corres_order_info[indexBot]='21:'+sym+'Replace buy:'+'old buy id:'+old_claient_order_id;
                        // botList[indexBot]['corres_order_info']=corres_order_info;
                        //console.log( '73;corresBotId0=', corresBotId);
                        //console.log( '73:old_claient_order_id=', old_claient_order_id);
                        let corresId=corresBotId.filter(order => order.client_order_id_buy === old_claient_order_id)[0];
                        let index=corresBotId.indexOf(corresId);
                        // //console.log( 'corresBotId0=', corresBotId);
                        if (botList[indexBot]['softBuy']==false){
                            corresBotId.splice(index, 1, {'BotId':botList[indexBot]['id'],'client_order_id_buy':client_order_id_buy_sell,'statusBuy':'new','diff_buy_spot':corresId.diff_buy_spot,'client_order_id_sell':'','statusSell':''}); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                        }else{
                            let diff_buy_spot=botList[indexBot]['price'] - BSprice;
                            corresBotId.splice(index, 1, {'BotId':botList[indexBot]['id'],'client_order_id_buy':client_order_id_buy_sell,'statusBuy':'new','diff_buy_spot':diff_buy_spot,'client_order_id_sell':'','statusSell':''}); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                        }
                        
                        // //console.log( 'corresBotId1=', corresBotId); 
                        //console.log('28:old_claient_order_id='+old_claient_order_id);
                        let ReplaceBuyOrderInfo=await socketApi.request('spot_replace_order', { client_order_id: old_claient_order_id, new_client_order_id: client_order_id_buy_sell, price: BSprice, quantity: symQuantity });
                        //console.log('77:ReplaceBuyOrderInfo=',ReplaceBuyOrderInfo);
                        if (ReplaceBuyOrderInfo.report_type=='canceled'){
                            //console.log('78:ReplaceBuyOrderInfo=',ReplaceBuyOrderInfo.report_type);
                            // ----------------
                            // let corresId=corresBotId.filter(order => order.client_order_id_buy === client_order_id_buy_sell)[0];
                            // let index=corresBotId.indexOf(corresId);
                            // corresBotId.splice(index, 1); 
                            // fs.writeFileSync('./StorageData/corresBotId.json', JSON.stringify(corresBotId));
                            // // //console.log( 'corresBotId0=', corresBotId);
                            // //console.log('59:client_order_id_buy_sell='+client_order_id_buy_sell);
                            // let indexClient=clientOrderIdBS.indexOf(client_order_id_buy_sell)
                            // clientOrderIdBS.splice(indexClient,1);
                            // fs.writeFileSync('./StorageData/clientOrderIdBS.json', JSON.stringify(clientOrderIdBS));
                            // ---------------
                            let Free_fund=await balance_update_symR();
                            // let DPB_coeff=botList[indexBot]['DPB'];
                            // if(botList[indexBot]['softBuy']==true){
                            //     DPB_coeff=botList[indexBot]['DPB']+botList[indexBot]['SDPB'];
                            // }
                            // let RDPB=1-(DPB_coeff)/100;
                            let new_buyQuantity=Free_fund/(BSprice);
                            let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                            //console.log('25: Replace Buy order-new_roundQuantity='+new_roundQuantity);
                            let new_symQuantity=(roundQuantity-1)*(symInfo[sym].quantity_increment)
                            //console.log('16:'+sym+':FirstQuantity='+botList[indexBot]['quantity'])
                            //console.log('17:(in Replace Buy order) '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                            alertErrorBot.push({id: uuid.v4(), msg:'Warning(20001:Insufficient funds in Replace Buy order)'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund}); 
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            //console.log('88:old_claient_order_id=' + old_claient_order_id);
                            // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
                            neededQuantity=null;
                            await BuyOrder(BSprice, new_symQuantity,indexBot,neededQuantity)
                            // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
                        }

                    }else{
                        //console.log('225:Replace buy order is not done:clientOrderIdBS has not' + '' + old_claient_order_id);

                    }
                    
                } catch (err) {
                    console.log('817:',err);
                    
                    //console.log("ReplaceBuyOrder Eror");
                    //console.log('old_claient_order_id=' + old_claient_order_id);
                    //console.log('BSprice=' + BSprice);
                    //console.log('symQuantity=' + symQuantity);
                    alertErrorBot.push({id: uuid.v4(), msg: 'Replace buy Eror code: '+err.code+' '+' '+sym+'  '+'BotId='+botList[indexBot]['id']+'  '+'old_claient_order_id='+old_claient_order_id});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    if (err.code == '20001'){
                        // //console.log( '12:client_order_id_buy_sell=', client_order_id_buy_sell);
                        // ------------------
                        let corresId=corresBotId.filter(order => order.client_order_id_buy === client_order_id_buy_sell)[0];
                        let index=corresBotId.indexOf(corresId);
                        corresBotId.splice(index, 1); 
                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                        // //console.log( 'corresBotId0=', corresBotId);
                        //console.log('59:client_order_id_buy_sell='+client_order_id_buy_sell);
                        let indexClient=clientOrderIdBS.indexOf(client_order_id_buy_sell)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        // -------------------
                        let Free_fund=await balance_update_symR();
                        let new_buyQuantity=Free_fund/(BSprice);
                        let new_roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                        //console.log('24: Replace Buy order-new_roundQuantity='+new_roundQuantity);
                        let new_symQuantity=(new_roundQuantity)*(symInfo[sym].quantity_increment)
                        if (new_roundQuantity<2){
                            erorFoundingCode='2011';
                            let lowQuantity_botId=botList[indexBot]['id']
                            await checking_funds(erorFoundingCode,lowQuantity_botId);
                            return;
                        }else{
                            if (new_roundQuantity>=roundQuantity){
                                new_symQuantity=(roundQuantity-1)*(symInfo[sym].quantity_increment)
                            }
                            //console.log('14:'+sym+':FirstQuantity='+botList[indexBot]['quantity'])
                            //console.log('15:(in Replace Buy order) '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                            alertErrorBot.push({id: uuid.v4(), msg:'Warning(20001:Insufficient funds in Replace Buy order)'+' '+ sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund}); 
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            //console.log('84:old_claient_order_id=' + old_claient_order_id);
                            // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
                            neededQuantity=null;
                            await BuyOrder(BSprice, new_symQuantity,indexBot,neededQuantity)
                            // await ReplaceBuyOrder(old_claient_order_id, BSprice, new_symQuantity,indexBot)
                        }
                        return
                    }else if(err.code != '2011') {
                        // ------------------
                        // corre_client(old_claient_order_id,corressOldId,client_order_id_buy_sell);
                        // -------------------
                    }
                    // if(err.code == '20002'){
                        
                    //     let foundBot=outPutData.some(bot => bot.BotId === corressOldId.BotId);
                    //     if(foundBot){
                    //         let resaultBot=outPutData.find(bot => bot.BotId === corressOldId.BotId);
                    //         let indexBot=outPutData.indexOf(resaultBot);
                    //         let buySellData=resaultBot.buySellData;
                    //         let foundOrder= buySellData.some(order => ((order.buyStatus === 'new') && (order.buyOrderId === old_claient_order_id)));
                    //         if(foundOrder){
                    //             let OldBuyOrder=buySellData.find(order => (order.buyStatus === 'new') && (order.buyOrderId === old_claient_order_id));
                    //             let indexOrder=buySellData.indexOf(OldBuyOrder);
                    //             OldBuyOrder.buyStatus='Lost Order';
                    //             buySellData.splice(indexOrder, 1, OldBuyOrder);
                    //             resaultBot.buySellData=buySellData;
                    //             outPutData.splice(indexBot, 1, resaultBot);
                    //             botList[indexBot_trading]['new_buy_order_info']={};
                    //             fs.writeFileSync('./StorageData/botList.json', JSON.stringify(botList));
                    //             let foundClientId=clientOrderIdBS.some(client_order_id => client_order_id === old_claient_order_id);
                    //             if(foundClientId){
                    //                 let indexClient=clientOrderIdBS.indexOf(old_claient_order_id)
                    //                 clientOrderIdBS.splice(indexClient,1);
                    //                 //console.log('54:clientOrderIdBS=',clientOrderIdBS)
                    //                 fs.writeFileSync('./StorageData/clientOrderIdBS.json', JSON.stringify(clientOrderIdBS));
                    //             }
                    //         }

                    //     }

                    // }
                    
                    
                }
            }
            // ====================End of ReplaceSellOrder Function=======
            // ---------------------------------------------------------
            // =====ReplaceSellOrder Function=============================
            async function ReplaceSellOrder(old_claient_order_id_sell, BSprice, symQuantity,indexBot_trading) {
                let sym=botList[indexBot_trading]['sym'];
                let client_order_id_buy_sell = generateRandom();
                let corressOldId=corresBotId.find(order => order.client_order_id_buy === old_claient_order_id_sell);
                
                try {
                    let corresId=corresBotId.filter(order => order.client_order_id_sell === old_claient_order_id_sell)[0];
                    if (corresId.statusSell !='filled'){
                        clientOrderIdBS.push(client_order_id_buy_sell); 
                        let indexClient=clientOrderIdBS.indexOf(old_claient_order_id_sell)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);

                        corres_order_info[indexBot_trading]='22:'+sym+'Replace sell:'+'old sell id:'+old_claient_order_id_sell;
                        let index=corresBotId.indexOf(corresId);
                        corresBotId.splice(index, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':corresId.statusBuy,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':client_order_id_buy_sell }); 
                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                        // //console.log( 'corresBotId1=', corresBotId);
                        // -----------------------------------
                        // //console.log('client_order_id_buy_sell=' + client_order_id_buy_sell);
                        
                        let ReplaceSellOrderInfo=await socketApi.request('spot_replace_order', { client_order_id: old_claient_order_id_sell, new_client_order_id: client_order_id_buy_sell, price: BSprice, quantity: symQuantity });
                        //console.log('79:ReplaceSellOrderInfo=',ReplaceSellOrderInfo);
                        // if (ReplaceSellOrderInfo.report_type=='canceled'){
                        //     //console.log('80:ReplaceSellOrderInfo=',ReplaceSellOrderInfo.report_type);
                        //     await SellOrder(BSprice, symQuantity,indexBot_trading)
                        // }

                    }else{
                        //console.log('226:Replace sell order is not done:statusSell of corresId is' + '' + corresId.statusSell);

                    }
                    
                } catch (err) {
                    console.log("9:ReplaceSellOrder Eror:",err);
                    // dataSell[ClientOrderId] = await socketApi.request('spot_new_order', { symbol: sym, side: 'sell', price: BSprice, quantity: symQuantity });
                    alertErrorBot.push({id: uuid.v4(), msg: 'Replace sell Eror code: '+err.code+' '+' '+sym+'  '+'BotId='+botList[indexBot_trading]['id']+'  '+'old_claient_order_id_sell='+old_claient_order_id_sell});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    // ------------------
                    // corre_client(old_claient_order_id_sell,corressOldId,client_order_id_buy_sell);
                    // -------------------
                    // if (err.code == '20002'){
                    //     //console.log('45:indexBot_trading='+indexBot_trading);
                    //     //console.log('46:old_claient_order_id_sell='+old_claient_order_id_sell);
                    //     let foundBot=outPutData.some(bot => bot.BotId === corressOldId.BotId);
                    //     if(foundBot){
                    //         let resaultBot=outPutData.find(bot => bot.BotId === corressOldId.BotId);
                    //         let indexBot=outPutData.indexOf(resaultBot);
                    //         let buySellData=resaultBot.buySellData;
                    //         let foundOrder= buySellData.some(order => ((order.sellStatus === 'new') && (order.sellOrderId === old_claient_order_id)));
                    //         if(foundOrder){
                    //             let OldSellOrder=buySellData.find(order => (order.sellStatus === 'new') && (order.sellOrderId === old_claient_order_id));
                    //             let indexOrder=buySellData.indexOf(OldSellOrder);
                    //             OldSellOrder.buyStatus='Lost Order';
                    //             buySellData.splice(indexOrder, 1, OldSellOrder);
                    //             resaultBot.buySellData=buySellData;
                    //             outPutData.splice(indexBot, 1, resaultBot);
                    //             let foundClientId=clientOrderIdBS.some(client_order_id => client_order_id === old_claient_order_id);
                    //             if(foundClientId){
                    //                 let indexClient=clientOrderIdBS.indexOf(old_claient_order_id);
                    //                 clientOrderIdBS.splice(indexClient,1);
                    //                 //console.log('54:clientOrderIdBS=',clientOrderIdBS)
                    //                 fs.writeFileSync('./StorageData/clientOrderIdBS.json', JSON.stringify(clientOrderIdBS));
                    //             }
                    //         }

                    //     }
        
                    // }
                    if (err.code == '20009'){
                        // ------------------------------
                        let activ_orders_Info=await socketApi.request('spot_get_orders');
                        let sell_Order_Info=activ_orders_Info.find(order => order.client_order_id === old_claient_order_id_sell);
                        //console.log('88:sell_Order_Info=',sell_Order_Info);
                        if (sell_Order_Info.status=='filled'){
                            let corresId=corresBotId.filter(order => order.client_order_id_sell === client_order_id_buy_sell)[0];
                            let indexcorresId=corresBotId.indexOf(corresId);
                            corresBotId.splice(indexcorresId, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':corresId.statusBuy,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':old_claient_order_id_sell }); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                            
                            // ----------------------
                            let IranDate = new Date(Date.parse(sell_Order_Info.updated_at) +12600000);
                            let outPutData_Order_Quantity=(sell_Order_Info.quantity)*(sell_Order_Info.price);     
                            let resaultBot=outPutData.find(bot => bot.BotId === corresId.BotId);
                            let indexBot=outPutData.indexOf(resaultBot);
                            let buySellData=resaultBot.buySellData;
                            let filledSellOrder=buySellData.filter(order => order.buyOrderId === corresId.client_order_id_buy)[0];
                            let indexOrder=buySellData.indexOf(filledSellOrder);
                            filledSellOrder.sellOrderId=sell_Order_Info.client_order_id;
                            filledSellOrder.sellTime=IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes() + ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds();
                            filledSellOrder.sellPrice=sell_Order_Info.price;
                            filledSellOrder.sellQuantityBase=sell_Order_Info.quantity;
                            filledSellOrder.sellQuantity=outPutData_Order_Quantity;
                            filledSellOrder.sellStatus=sell_Order_Info.status;
                            filledSellOrder.sellExchangeId=sell_Order_Info.id;
                            filledSellOrder.profit=(sell_Order_Info.price-filledSellOrder.buyPrice)/filledSellOrder.buyPrice*100;
                            //console.log('filledSellOrder=',filledSellOrder);
                            buySellData.splice(indexOrder, 1, filledSellOrder);
                            resaultBot.buySellData=buySellData;
                            // //console.log('18:corresBotId0=',corresBotId);
                            corresBotId.splice(indexcorresId, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':corresId.statusBuy,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':corresId.client_order_id_sell, 'statusSell':filledSellOrder.sellStatus}); 
                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                            // //console.log('19:corresBotId1=',corresBotId);
                            outPutData.splice(indexBot, 1, resaultBot);
                            //await stramWriteFunc(pathFile_outPutData,outPutData)
                            // //console.log('resaultBot1=',resaultBot);
                            // //console.log('outPutData1=',outPutData);
                            // ---------------------
                            return;
                        }
                        
                        // ------------------------------
                    }
                    // console.info("client_order_id_sell: " + dataSell[ClientOrderId]['client_order_id']);
                }
            }
            // ====================End of ReplaceSellOrder Function=======
            // ---------------------------------------------------------
            // ---------------------------------------------------------
            // =====cancel_order Function=============================
            async function cancel_order(old_claient_order_id,indexBot) {
                try {
                    await socketApi.request('spot_cancel_order', { client_order_id: old_claient_order_id });
                } catch (err) {
                    //console.log(err.code);
                    alertErrorBot.push({id: uuid.v4(), msg: 'cancel_order Eror: '+err.code+':'+' '+botList[indexBot]['sym']+'&&'+'old_claient_order_id='+old_claient_order_id });
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    if (err.code == '20002'){
                        
                        //console.log('46:old_claient_order_id='+old_claient_order_id);
                        //console.log('53:clientOrderIdBS=',clientOrderIdBS)
                        // let indexClient=clientOrderIdBS.indexOf(old_claient_order_id)
                        // clientOrderIdBS.splice(indexClient,1);
                        // //console.log('54:clientOrderIdBS=',clientOrderIdBS)
                        // fs.writeFileSync('./StorageData/clientOrderIdBS.json', JSON.stringify(clientOrderIdBS));
                        
                    }
                    
                    //console.log("cancel_order Eror");
                }
            }
            // ====================End of cancel order =======
            // ---------------------------------------------------------
            // ========Start of Generat client_ord_id Function==================
            // function generateRandom() {
            //     let d = Date.now();
            //     return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            //         let r = (d + Math.random() * 16) % 16 | 0;
            //         d = Math.floor(d / 16);
            //         return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            //     });
            // }
            // ==============End of Generat client_ord_id Function===========
            // -------------------------------------------------------
            // =====balance update Function=======================
            async function balance_update_symR() {
                let Free_fund
                balance = await socketApi.request('spot_balances');
                let obj = balance.filter(b => b.currency == symR);
                if (obj.length != 0){
                    Free_fund = parseFloat(obj[0].available);
                    //console.log('35:Free_fund00='+Free_fund);
                } 
                else Free_fund = 0;
                return Free_fund
            }
            // ======End of balance update Function========================
            // ------------------------------------------------------------
            // ======star of Bolinger/mincheckCandel/spotPric Function======
            function min_check_candle_bolinger(message,indexBot) {
                let tick_snapshot
                let SpotPrice=0;
                let sym=botList[indexBot]['sym'];
                // let openPrice=botList[indexBot]['openPrice'];
                // let closePrice=botList[indexBot]['closePrice'];
                let lowPrice=botList[indexBot]['lowPrice'];
                // let highPrice=botList[indexBot]['highPrice'];
                // let timeStep=botList[indexBot]['timeStep'];
                let openPrice=new Array();
                let closePrice=new Array();
                // let lowPrice=new Array();
                let highPrice=new Array();
                let timeStep=null;
                let nCandel=botList[indexBot]['nCC']+1;
                if (message.snapshot != null) {
                    tick_snapshot = message.snapshot[sym];
                    // //console.log('41:'+sym+'tick_snapshot=',tick_snapshot);
                    // botList[indexBot]['tick_snapshot']=tick_snapshot
                    timeStep = parseFloat(tick_snapshot[nCandel - 1].t);
                    // botList[indexBot]['timeStep']=timeStep;
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
                    // botList[indexBot]['openPrice']=openPrice;
                    // botList[indexBot]['closePrice']=closePrice;
                    botList[indexBot]['lowPrice']=lowPrice;
                    // botList[indexBot]['highPrice']=highPrice;
                    // //await stramWriteFunc(pathFile_botList,botList);;

                } else {
                    var tick_update = message.update[sym];

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
                        // botList[indexBot]['timeStep']=timeStep;
                        // //await stramWriteFunc(pathFile_botList,botList);;
                    }
                    openPrice[nCandel - 1] = parseFloat(tick_update[0].o);
                    closePrice[nCandel - 1] = parseFloat(tick_update[0].c);
                    lowPrice[nCandel - 1] = parseFloat(tick_update[0].l);
                    highPrice[nCandel - 1] = parseFloat(tick_update[0].h);
                    // botList[indexBot]['openPrice']=openPrice;
                    // botList[indexBot]['closePrice']=closePrice;
                    botList[indexBot]['lowPrice']=lowPrice;
                    // botList[indexBot]['highPrice']=highPrice;
                    // //await stramWriteFunc(pathFile_botList,botList);;
                }
                
                
                // =================bolinger coding==============
                // min_check_candle(indexBot);
                
                close_up_check_candle(indexBot,closePrice)
                if(nCandel== 21){
                    bolinger(nCandel,closePrice,lowPrice,highPrice);
                }
                
            }
            // =========END of Bolinger/mincheckCandel/spotPric Function========
            // ---------------------------------------------------------------
            // ===========start douwn_percent_order_buy()====================
            async function douwn_percent_order_buy(indexBot_trading) {
                //console.log('3:'+":indexBot_trading="+':'+indexBot_trading);
                //console.log('4:'+":botList[indexBot_trading]="+':'+botList[indexBot_trading]['sym']);

                if (botList[indexBot_trading]['buy_order_is_done'] == false){
                    let BuyPriceQuantity=BP_calculation(indexBot_trading);
                    //console.log('449:BuyPriceQuantity=',BuyPriceQuantity)
                    await BuyOrder(BuyPriceQuantity.price, BuyPriceQuantity.quantity,indexBot_trading,BuyPriceQuantity.quantity)
                } else {
                    //console.log('buy_order_is_done=', botList[indexBot_trading]['buy_order_is_done'])
                }
                //console.log('45:'+botList[indexBot_trading]['sym']+":douwn_percent_order_buy finished");
            }
            // ===========End douwn_percent_order_buy()======================
            // --------------------------------------------------------------
            // ------------------------------------------------------------------
            
            // ===========start up_percent_order_sell()====================
            async function up_percent_order_sell(data_UPS1,indexBot_trading) {
                // //console.log('data_UPS1.quantity='+data_UPS1.quantity);
                // //console.log('data_UPS1.quantity_cumulative='+data_UPS1.quantity_cumulative);
                // //console.log('data_UPS1.quantity_res='+data_UPS1.quantity_res);
                let symQuantitySell
                if(data_UPS1.status==='filled'){
                    symQuantitySell=data_UPS1.quantity
                    //console.log("213:symQuantitySell for status filled=" + data_UPS1.quantity);
                }else if(data_UPS1.status==='canceled'){
                    symQuantitySell=data_UPS1.quantity_res
                    //console.log("214:symQuantitySell for status cancelled=" + data_UPS1.quantity_res);
                }
                
                let Sellprice = Math.ceil((1 + (botList[indexBot_trading]['UPS0']+botList[indexBot_trading]['UPS1']) / 100) *(botList[indexBot_trading]['price'])* botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                //console.log("745:Sellprice=" + Sellprice);
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
                
                let orderInfo = {};
                if(message.method ==='spot_order'){
                    let NewOrder = message.params;
                    // -----------------------------
                    // if (NewOrder.status==='partiallyFilled'){
                    //     orderInfo.type = message.method;
                    //     orderInfo.symbol = NewOrder.symbol;
                    //     orderInfo.price = NewOrder.price;
                    //     orderInfo.quantity = NewOrder.quantity;
                    //     orderInfo.quantity_cumulative=NewOrder.quantity_cumulative;
                    //     orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
                    //     orderInfo.side = NewOrder.side;
                    //     orderInfo.orderType = NewOrder.type;
                    //     orderInfo.orderId = NewOrder.id;
                    //     orderInfo.client_order_id = NewOrder.client_order_id;
                    //     orderInfo.status = NewOrder.status;
                    //     orderInfo.updated_at=NewOrder.updated_at;
                    //     orderInfo.OldNew='Old';
                    // }else{
                    //     orderInfo.type = message.method;
                    //     orderInfo.symbol = NewOrder.symbol;
                    //     orderInfo.price = NewOrder.price;
                    //     orderInfo.quantity = NewOrder.quantity;
                    //     orderInfo.side = NewOrder.side;
                    //     orderInfo.orderType = NewOrder.type;
                    //     orderInfo.orderId = NewOrder.id;
                    //     orderInfo.client_order_id = NewOrder.client_order_id;
                    //     orderInfo.status = NewOrder.status;
                    //     orderInfo.updated_at=NewOrder.updated_at;
                    //     orderInfo.OldNew='Old';
                    // }
                    // ------------------------
                    orderInfo.type = message.method;
                    orderInfo.symbol = NewOrder.symbol;
                    orderInfo.price = NewOrder.price;
                    orderInfo.quantity = NewOrder.quantity;
                    orderInfo.quantity_cumulative=NewOrder.quantity_cumulative;
                    orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
                    orderInfo.side = NewOrder.side;
                    orderInfo.orderType = NewOrder.type;
                    orderInfo.orderId = NewOrder.id;
                    orderInfo.client_order_id = NewOrder.client_order_id;
                    orderInfo.status = NewOrder.status;
                    orderInfo.updated_at=NewOrder.updated_at;
                    orderInfo.OldNew='Old';
                    if ((NewOrder.status === 'filled') || (NewOrder.status === 'partiallyFilled')){
                        orderInfo.trade_id=NewOrder.trade_id;
                        orderInfo.trade_quantity=NewOrder.trade_quantity;
                        orderInfo.trade_price=NewOrder.trade_price;
                        orderInfo.trade_fee=NewOrder.trade_fee;
                    }
                    
                                                    
                }else if (message.method ==='spot_orders'){
                    let orders = message.params;
                    let NewOrder=orders[0];
                    let date_order=NewOrder.updated_at
                    let date = Date.now();
                    // //console.log('NewOrder.updated_at=',Date.parse(date_order));
                    // //console.log(typeof(Date.parse(date_order)));
                    // //console.log(typeof(date));

                    
                    let minTime=date-Date.parse(date_order);
                    // //console.log('date',date)
                    // //console.log('minTime=',minTime)
                    let newClientOrderId=NewOrder.client_order_id;
                    // //console.log('newClientOrderId0=',newClientOrderId)

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
                    // ----------------------------------------
                    // if (NewOrder.status==='partiallyFilled'){
                    //     orderInfo.type = message.method;
                    //     orderInfo.symbol = NewOrder.symbol;
                    //     orderInfo.price = NewOrder.price;
                    //     orderInfo.quantity = NewOrder.quantity;
                    //     orderInfo.quantity_cumulative=NewOrder.quantity_cumulative;
                    //     orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
                    //     orderInfo.side = NewOrder.side;
                    //     orderInfo.orderType = NewOrder.type;
                    //     orderInfo.orderId = NewOrder.id;
                    //     orderInfo.client_order_id = NewOrder.client_order_id;
                    //     orderInfo.status = NewOrder.status;
                    //     orderInfo.updated_at=NewOrder.updated_at;
                    //     orderInfo.OldNew='Old';
                    // }else{
                    //     orderInfo.type = message.method;
                    //     orderInfo.symbol = NewOrder.symbol;
                    //     orderInfo.price = NewOrder.price;
                    //     orderInfo.quantity = NewOrder.quantity;
                    //     orderInfo.side = NewOrder.side;
                    //     orderInfo.orderType = NewOrder.type;
                    //     orderInfo.orderId = NewOrder.id;
                    //     orderInfo.client_order_id = NewOrder.client_order_id;
                    //     orderInfo.status = NewOrder.status;
                    //     orderInfo.updated_at=NewOrder.updated_at;
                    //     orderInfo.OldNew='Old';
                    // }
                    // --------------------------
                    orderInfo.type = message.method;
                    orderInfo.symbol = NewOrder.symbol;
                    orderInfo.price = NewOrder.price;
                    orderInfo.quantity = NewOrder.quantity;
                    orderInfo.quantity_cumulative=NewOrder.quantity_cumulative;
                    orderInfo.quantity_res=orderInfo.quantity-orderInfo.quantity_cumulative;
                    orderInfo.side = NewOrder.side;
                    orderInfo.orderType = NewOrder.type;
                    orderInfo.orderId = NewOrder.id;
                    orderInfo.client_order_id = NewOrder.client_order_id;
                    orderInfo.status = NewOrder.status;
                    orderInfo.updated_at=NewOrder.updated_at;
                    orderInfo.OldNew='Old';
                    if ((NewOrder.status === 'filled') || (NewOrder.status === 'partiallyFilled')){
                        orderInfo.trade_id=NewOrder.trade_id;
                        orderInfo.trade_quantity=NewOrder.trade_quantity;
                        orderInfo.trade_price=NewOrder.trade_price;
                        orderInfo.trade_fee=NewOrder.trade_fee;
                    }
                }else{
                    //console.log("message.method is not 'spot_order' and neither 'spot_orders' ");
                    alertErrorBot.push({id: uuid.v4(), msg:"message.method is not 'spot_order' and neither 'spot_orders' "});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }
                // ------------------
                //console.log('34:clientOrderIdBS=',clientOrderIdBS);
                // --------------------
                //console.log('86:orderInfo=',orderInfo);
                if (Object.keys(Old_Order_Info).length === 0){
                    await order_info_execute(orderInfo);
                }else{
                    let diff_update_time=Date.parse(orderInfo.updated_at)-Date.parse(Old_Order_Info.updated_at);
                    // console.log('55:diff_update_time=',diff_update_time)
                    if(diff_update_time <=0 && Old_Order_Info.client_order_id===orderInfo.client_order_id && Old_Order_Info.status===orderInfo.status ){
                        // console.log('38:same orderInfo');
                    }else{
                        await order_info_execute(orderInfo);
                    }
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
                let indexBot_trading
                if (clientOrderIdBS.includes(orderInfo.client_order_id)){
                    // console.log('87:orderInfo=',orderInfo)
                    indexBot_trading= finding_indexBot_trading(orderInfo);
                    //console.log('88:'+botList[indexBot_trading]["sym"]+':indexBot_trading='+indexBot_trading);
                    // console.log('43:indexBot_trading=',indexBot_trading);
                }
                // ----------------------------------------------------------------
                outPutData_update(orderInfo,indexBot_trading);
                //await stramWriteFunc(pathFile_outPutData,outPutData);
                //await stramWriteFunc(pathFile_outPutFilledData,outPutFilledData);
                // ----------------------------------------------------------------
                outPutManualData_update(orderInfo);
                //await stramWriteFunc(pathFile_outPutManualData,outPutManualData);
                
                // -----------------------------print trade info------------------------------------
                if (clientOrderIdBS.includes(orderInfo.client_order_id) && orderInfo.OldNew==='New'){
                    
                    let IranDate = new Date(Date.parse(orderInfo.updated_at) +12600000); 
                    console.log('======================================start of  execution_update_order_sell============ ');
                    console.log("--------------------------------------------------------------------");
                    console.log(IranDate);
                    console.log(orderInfo.symbol + " " + orderInfo.side + " " + orderInfo.orderType + ' ' + 'client_order_id:' + orderInfo.client_order_id + '(' + orderInfo.status + ')');
                    console.log("...orderId: " + orderInfo.orderId);
                    if (orderInfo.status !== 'filled' && orderInfo.status !=='canceled' ){
                        console.log(corres_order_info[indexBot_trading])
                    }
                    console.log("...price: " + orderInfo.price + ", quantity: " + orderInfo.quantity);
                    console.log("--------------------------------------------------------------------");

                }
                // //console.log('94:'+sym+'indexBot_='+indexBot);
                // -------------------------------------end of print trade info------------------------
                if(clientOrderIdBS.includes(orderInfo.client_order_id) && botList[indexBot_trading]['delete_buttom'] == true){
                    let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id)
                    clientOrderIdBS.splice(indexClient,1);
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                    
                }

                //// ----------------end of activeBot properties of botlist importing------------------- 
                // -----------------------------------------------------------------
                // --------------------------------------------------------------------------------
                if (clientOrderIdBS.includes(orderInfo.client_order_id) && orderInfo.OldNew==='New') {
                    // //console.log('indexBot_trading='+indexBot_trading)
                    // //console.log('90:'+(botList[indexBot_trading]['sym'])+'indexBot_trading='+indexBot_trading)
                    if (orderInfo.status == "REJECTED") {
                        //console.log("Order Failed! Reason: " + message.r);
                        return;
                    }
                    if (orderInfo.status == 'canceled' && orderInfo.side == 'buy') {
                        //console.log('55:order cancelled')
                        let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        botList[indexBot_trading]['buy_order_is_done'] = false;
                        botList[indexBot_trading]['softBuy'] = true;
                        await foud_LowQuantity_bot_func();
                        if (botList[indexBot_trading]['dead']==false){
                            if (botList[indexBot_trading]['filled_buy_order']< botList[indexBot_trading]['MO'] && botList[indexBot_trading]['stop_buttom'] == false ) {   
                                await douwn_percent_order_buy(indexBot_trading);
                            }
                        }
                        
                        
                    }

                    if (orderInfo.status == 'canceled' && orderInfo.side == 'sell') {
                        let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        
                        if(botList[indexBot_trading]['dead']==true){
                            await SellOrder(orderInfo.price, orderInfo.quantity,indexBot_trading)
                        }else{
                            await up_percent_order_sell(orderInfo,indexBot_trading);
                        } 
                    }
                
                    if ((orderInfo.status === 'new' || orderInfo.status === 'partiallyFilled') && orderInfo.side == 'buy' && botList[indexBot_trading]['stop_buttom'] == false) {
                        if (botList[indexBot_trading]['buy_order_is_done'] == false){
                            botList[indexBot_trading]['buy_order_is_done']=true;
                            //await stramWriteFunc(pathFile_botList,botList);;
                        }
                        if (botList[indexBot_trading]['softBuy']==true){
                            let data_buy = orderInfo;
                            let soft_buy_follow_botId=botList[indexBot_trading]['id'];
                            // -----------------------
                            let mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order']);
                            let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
                            let newBuyPrice = (1 - DPB_coeff/ 100) * botList[indexBot_trading]['price'];
                            let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            // ---------------------
                            //console.log('714:data_buy.price=',parseFloat(data_buy.price));
                            //console.log('715:new_down_BuyPrice=',new_down_BuyPrice);
                            if(data_buy.price<new_down_BuyPrice && botList[indexBot_trading]['SBF']>=0.1 && botList[indexBot_trading]['SDPB']>0 && botList[indexBot_trading]['TBF']>0){
                                setTimeout(function () { soft_buy_follow(data_buy,soft_buy_follow_botId) }, (botList[indexBot_trading]['TBF']) * 1000);
                            }else{
                                botList[indexBot_trading]['softBuy']=false;
                                //await stramWriteFunc(pathFile_botList,botList);;
                                //console.log('347:botList[indexBot_trading]["softBuy"]=',botList[indexBot_trading]['softBuy']);
                            }

                        }
                        
                        
                    }

                    if (orderInfo.status == 'filled' && orderInfo.side == 'buy') {
                        let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        botList[indexBot_trading]['buy_order_is_done'] = false;
                        botList[indexBot_trading]['softBuy'] = true;
                        //await stramWriteFunc(pathFile_botList,botList);;
                        let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                        filled_buy_order++;
                        botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                        //await stramWriteFunc(pathFile_botList,botList);;
                        //console.log('buy filled , filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                        
                        await up_percent_order_sell(orderInfo, indexBot_trading);
                        if ((botList[indexBot_trading]['filled_buy_order']) < botList[indexBot_trading]['MO'] && botList[indexBot_trading]['stop_buttom'] == false) {
                            //console.log('35:'+botList[indexBot_trading]['sym']+':'+'max_order=' + botList[indexBot_trading]['MO']);
                            //console.log('36:'+botList[indexBot_trading]['sym']+':'+'filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                            await douwn_percent_order_buy(indexBot_trading);
                        }
                    }
                    if ((orderInfo.status === 'new' || orderInfo.status === 'partiallyFilled') && orderInfo.side == 'sell') {
                        // data_sell.add(orderInfo);
                        let data_sell = orderInfo;
                        // //console.log('data_sell-befor sell_follow',data_sell)
                        let sell_follow_botId=botList[indexBot_trading]['id'];
                        // ---------------------
                        let resaultBot=outPutData.find(bot => bot.BotId === sell_follow_botId);
                        let buySellData=resaultBot.buySellData;
                        let fonudOrder=buySellData.find(order => order.sellOrderId === data_sell.client_order_id);
                        let buyPrice=fonudOrder.buyPrice;
                        //console.log("753:buyPrice=" + buyPrice);
                        // -----------------------------------
                        let coffFilled
                        coffFilledCal();
                        function coffFilledCal(){
                            if((botList[indexBot_trading]['IntBot'] === 1) || (botList[indexBot_trading]['IntBot'] === 3) ){
                                if(parseInt(botList[indexBot_trading]['filled_buy_order']) === 1){
                                    coffFilled=1;
                                }else{
                                    coffFilled=1+(Math.pow(2,botList[indexBot_trading]['filled_buy_order']-1)/40);
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
                        
                        let diffSellprice=Math.abs((Sellprice0-data_sell.price)/(data_sell.price)*100);
                        if(diffSellprice<0.1){
                            //console.log('871:diffSellprice=',diffSellprice)
                            Sellprice0=SellpriceCal(Sellprice0,data_sell,diffSellprice,botList[indexBot_trading]['SSF0'],coffDiff,coffFilled,botList[indexBot_trading]['roundPricePow']);
                        }
                        function SellpriceCal (Sellprice,data_sell,diffSellprice,SSF,coffDiff,coffFilled,roundPricePow){
                            
                            while(diffSellprice<.1){
                                // alertErrorBot.push({id: uuid.v4(), msg: '1:sell_follow is not Done:diffSellprice<.001'});
                                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                let oldSellPrice=Sellprice
                            
                                // ---------------------
                                coffDiffCal(oldSellPrice);
                                // ---------------------
                                Sellprice = Math.ceil((oldSellPrice)*(1-coffDiff*coffFilled*SSF/100) * roundPricePow) / roundPricePow;
                                diffSellprice=Math.abs((Sellprice-data_sell.price)/(data_sell.price)*100);
                                // //console.log('Sellprice=',Sellprice);
                                // //console.log('diffSellprice=',diffSellprice);
                            }
                            return Sellprice
                            

                        }
                            
                        // let NewUpPercentageSell = (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1'])- botList[indexBot_trading]['SSF0'];
                        // let NewCoeffUPS = (1 + NewUpPercentageSell / 100) / (1 + (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1']) / 100);
                        // let Sellprice0 = Math.ceil(NewCoeffUPS * data_sell.price * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                        // ---------------------
                        let Sellprice1 = Math.ceil((1 + (botList[indexBot_trading]['UPS1']) / 100) *(buyPrice)* botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                        //console.log("754:Sellprice0=" + Sellprice0);
                        //console.log("754:Sellprice1=" + Sellprice1);
                        //console.log("756:data_sell.price=" + data_sell.price);
                        //console.log("785:price=" + botList[indexBot_trading]['price']);
                        //console.log("786:UPS0=" + botList[indexBot_trading]['UPS0']);
                        //console.log("787:UPS1=" + botList[indexBot_trading]['UPS1']);
                        //console.log("788:roundPricePow=" + botList[indexBot_trading]['roundPricePow']);
                        
                        // --------------------
                        if(Sellprice0>Sellprice1 && botList[indexBot_trading]['SSF0']>=0.1 && botList[indexBot_trading]['TSF0']>0){
                            //console.log("789:indexBot_trading=",indexBot_trading);
                            let SSF0=botList[indexBot_trading]['SSF0'];
                            let TSF0=botList[indexBot_trading]['TSF0'];
                            let Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF0/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            let diff_SP_BP=Math.abs((Sellprice-buyPrice)/(buyPrice)*100);
                            if((diff_SP_BP<.3) || Sellprice<buyPrice){
                                coffDiff=1;
                                Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF0/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            }
                            setTimeout(function () { sell_follow(data_sell,sell_follow_botId,Sellprice) }, (TSF0) * 1000);
                        }else if(Sellprice0<=Sellprice1 && botList[indexBot_trading]['SSF1']>=0.1 && botList[indexBot_trading]['TSF1']>0){
                            let SSF1=botList[indexBot_trading]['SSF1'];
                            let TSF1=parseInt(botList[indexBot_trading]['TSF1']/(coffFilled));
                            //console.log('674:TSF1=',TSF1)
                            let Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF1/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            diffSellprice=Math.abs((Sellprice-data_sell.price)/(data_sell.price)*100);
                            if(diffSellprice<0.1){
                                Sellprice0=SellpriceCal(Sellprice0,data_sell,diffSellprice,SSF1,coffDiff,coffFilled,botList[indexBot_trading]['roundPricePow']);
                            }
                            let diff_SP_BP=Math.abs((Sellprice-buyPrice)/(buyPrice)*100);
                            if((diff_SP_BP<.3) || Sellprice<buyPrice){
                                coffDiff=1;
                                Sellprice = Math.ceil((data_sell.price)*(1-coffDiff*coffFilled*SSF1/100) * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            }
                            setTimeout(function () { sell_follow(data_sell,sell_follow_botId,Sellprice) }, (TSF1) * 1000);
                        }
                    }
                    if (orderInfo.status == 'filled' && orderInfo.side == 'sell') {
                        let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                        await foud_LowQuantity_bot_func();
                        if (botList[indexBot_trading]['stop_buttom'] == false){
                            
                            if ((botList[indexBot_trading]['filled_buy_order']) < (botList[indexBot_trading]['MO'])){
                                // -------------------
                                let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                                filled_buy_order--;
                                botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                                //await stramWriteFunc(pathFile_botList,botList);;
                                //console.log('sell filled, filled_buy_order=' +botList[indexBot_trading]['filled_buy_order']);
                                // -------------
                                if(botList[indexBot_trading]['buy_order_is_done'] == false && erorFoundingCode=='2011'){
                                    //console.log('filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                                    //console.log('max_order=' + botList[indexBot_trading]['MO'])
                                    await douwn_percent_order_buy(indexBot_trading);
                                    return;
                                }else if(botList[indexBot_trading]['buy_order_is_done'] == true){
                                    // let new_buy_order_data_info={};
                                    // new_buy_order_data_info.buyOrderId='NoId';
                                    // let new_buy_order_info=botList[indexBot_trading]['new_buy_order_info'];
                                     let new_buy_order_info=newBuyOrderDataInfo(indexBot_trading);
                                    //console.log('185:new_buy_order_info=',new_buy_order_info);
                                    if(clientOrderIdBS.includes(new_buy_order_info.buyOrderId) && new_buy_order_info.buyStatus === 'new'){
                                        //await stramWriteFunc(pathFile_botList,botList);;
                                        let BuyPriceQuantity=BP_calculation(indexBot_trading);
                                        let sym=botList[indexBot_trading]['sym'];
                                        let roundQuantity=Math.floor(BuyPriceQuantity.quantity/(symInfo[sym].quantity_increment));
                                        //console.log('22:roundQuantity='+roundQuantity);
                                        symQuantity=(roundQuantity)*(symInfo[sym].quantity_increment);
                                        //console.log('41:'+sym+':BuyOrder input Quantity=',symQuantity);
                                        await ReplaceBuyOrder(new_buy_order_info.buyOrderId, BuyPriceQuantity.price, symQuantity,indexBot_trading);
                                        //console.log('81:filled sell checked:'+botList[indexBot_trading]['sym']+"ReplaceBuyOrder was Done");
                                        // await cancel_order(new_buy_order_info.buyOrderId,indexBot_trading);
                                        // fs.writeFileSync('./StorageData/botList.json', JSON.stringify(botList));
                                        return;
                                    }else{
                                        if(new_buy_order_info.buyStatus === 'new'){
                                            //console.log('226:cancel order is not done:clientOrderIdBS has not :' + '' + new_buy_order_info.buyOrderId);
                                        }else{
                                            //console.log('227:cancel order is not done:buyStatus in new_buy_order_info is not new(may be is partiallyFilled)');
                                        }
                                    }
                                }
                                return;

                            }else if ((botList[indexBot_trading]['filled_buy_order']) == botList[indexBot_trading]['MO'] && botList[indexBot_trading]['buy_order_is_done'] == false) {
                                // -------------------
                                let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                                filled_buy_order--;
                                botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                                //await stramWriteFunc(pathFile_botList,botList);;
                                //console.log('sell filled, filled_buy_order=' +botList[indexBot_trading]['filled_buy_order']);
                                // -------------
                                // //console.log('filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                                //console.log('max_order=' + botList[indexBot_trading]['MO'])
                                await douwn_percent_order_buy(indexBot_trading);
                                return;
                            }else if ((botList[indexBot_trading]['filled_buy_order']) > botList[indexBot_trading]['MO']) {
                                // -------------------
                                let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                                filled_buy_order--;
                                botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                                //await stramWriteFunc(pathFile_botList,botList);;
                                //console.log('sell filled, filled_buy_order=' +botList[indexBot_trading]['filled_buy_order']);
                                // -------------
                                // //console.log('filled_buy_order=' + (botList[indexBot_trading]['filled_buy_order']));
                                //console.log('max_order=' + botList[indexBot_trading]['MO'])
                                // await douwn_percent_order_buy(indexBot_trading);
                                return;
                            }
                        }else{
                            // -------------------
                            let filled_buy_order=botList[indexBot_trading]['filled_buy_order']
                            filled_buy_order--;
                            botList[indexBot_trading]['filled_buy_order']=filled_buy_order;
                            if(botList[indexBot_trading]['filled_buy_order'] == 0){
                                botList[indexBot_trading]['delete_buttom'] =true;
                                botList[indexBot_trading]['stop_buttom'] =false;
                            }
                            //await stramWriteFunc(pathFile_botList,botList);;
                            //console.log('sell filled, filled_buy_order=' +botList[indexBot_trading]['filled_buy_order']);
                            // -------------
                        }
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
                // //console.log('78:new_diff_buy_spot='+new_diff_buy_spot);
                // //console.log('79:diff_buy_spot='+diff_buy_spot);
                let diff_spot_buy_percent = Math.abs((new_diff_buy_spot - diff_buy_spot) / diff_buy_spot * 100);
                // //console.log('80:'+sym+':diff_spot_buy_percent=' + diff_spot_buy_percent);
                
                if(diff_spot_buy_percent > 0.1){
                    let new_buy_price
                    new_buy_price = Math.ceil((botList[indexBot]['price'] - diff_buy_spot) * botList[indexBot]['roundPricePow']) / botList[indexBot]['roundPricePow'];
                    await ReplaceBuyOrder(new_buy_order_data_info.buyOrderId, new_buy_price, new_buy_order_data_info.buyQuantityBase,indexBot);
                    //console.log('82:diff_spot_buy_percent>0.1:'+botList[indexBot]['sym']+"ReplaceBuyOrder was Done");
                    return
                }else{
                    console.log('diff_spot_buy_percent<0.1');
                }

            }
            // ======================================
            // ===========End buy_follow()======================
            // -----------------------------------------------------------------
            // -----------------------------------------------------------------
            // ===========start soft_buy_follow()====================
            // =======================================   
            async function soft_buy_follow(data_buy,BotId) {
                let foundBot=botList.some(bot => bot.id === BotId);
                if(foundBot){
                    let selectedBot=botList.filter(bot => bot.id === BotId )[0];
                    let indexBot_trading=botList.indexOf(selectedBot);
                    if (botList[indexBot_trading]['delete_buttom']==false) {
                        //console.log('soft_buy_follow_is start');
                        if (clientOrderIdBS.includes(data_buy.client_order_id)) {
                            // -----------------------
                            let mathIDPB;
                            let filled_buy_order_coff=(botList[indexBot_trading]['filled_buy_order']+1)/3-Math.floor((botList[indexBot_trading]['filled_buy_order']+1)/3);
                            // console.log('842:filled_buy_order_coff=',filled_buy_order_coff)
                            if((botList[indexBot_trading]['IntBot'] === 4) && (botList[indexBot_trading]['filled_buy_order'] > 0) && (filled_buy_order_coff === 0)){
                                mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order'])*(botList[indexBot_trading]['filled_buy_order']);
                                // console.log('843:mathIDPB=',mathIDPB)
                            }else{
                                mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order']);
                                // console.log('844:mathIDPB=',mathIDPB)
                            }
                            let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
                            let newBuyPrice = (1 - DPB_coeff/ 100) * botList[indexBot_trading]['price'];
                            let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            // --------------------
                            NewUpPercentageBuy = (botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB'])+ botList[indexBot_trading]['SBF'];
                            // //console.log('UPS1=' + botList[indexBot_trading]['UPS1']);
                            let NewCoeff = (1 + NewUpPercentageBuy / 100) / (1 + (botList[indexBot_trading]['DPB']+botList[indexBot_trading]['SDPB']) / 100);
                            let new_soft_buy_price = Math.ceil(NewCoeff*data_buy.price * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            //console.log("new_soft_buy_price=" + new_soft_buy_price);
                            
                            if(new_soft_buy_price<new_down_BuyPrice){
                                // --------------------------------------------------
                                let mathIQ=Math.pow((1+botList[indexBot_trading]['IQ']/100),botList[indexBot_trading]['filled_buy_order']);
                                let neededQuantity=(botList[indexBot_trading]['quantity'])*mathIQ/(new_soft_buy_price);
                                //console.log('379:neededQuantity='+neededQuantity);
                                if(data_buy.status=='partiallyFilled'){
                                    neededQuantity=data_buy.quantity;
                                    //console.log('380:neededQuantity='+neededQuantity);
                                    //console.log('759:partiallyFilled in softBuy for id=',data_buy.client_order_id)
                                }
                                // ---------------------
                                // let mathIDPB=Math.pow((1+inputData.IDPB/100),inputData.filled_buy_order);
                                // let DPB_coeff=(inputData.DPB+inputData.SDPB)*mathIDPB;
                                // let RDPB=1-(DPB_coeff)/100;
                                // // //console.log('122:RDPB=',RDPB);
                                // inputData.FirstQuantity=String((inputData.quantity)/(RDPB*(inputData.price)));
                                // ---------------------
                                await ReplaceBuyOrder(data_buy.client_order_id, new_soft_buy_price, neededQuantity,indexBot_trading);
                            }else{
                                botList[indexBot_trading]['softBuy']=false;
                                //await stramWriteFunc(pathFile_botList,botList);;
                                //console.log('347:botList[indexBot_trading]["softBuy"]=',botList[indexBot_trading]['softBuy']);
                            }
                            
                            // //console.log('28:'+"ReplaceSellOrder was Done");

                        }else {
                            let found=corresBotId.some(order => order.client_order_id_buy === data_buy.client_order_id);
                            if (found){
                                let corresId=corresBotId.find(order => order.client_order_id_buy === data_buy.client_order_id);
                                let indexcorresId=corresBotId.indexOf(corresId);
                                let statusBuy=corresId.statusBuy;
                                if (statusBuy=='filled'){
                                    //console.log('soft_buy_follow is not Done:' + '' + data_buy.client_order_id + ' ' + 'is' + 'filled');
                                    alertErrorBot.push({id: uuid.v4(), msg: '1:soft_buy_follow is not Done:' + '' + data_buy.client_order_id + ' ' + 'is' + 'filled'});
                                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                    // corresBotId.splice(indexcorresId, 1); 
                                    // fs.writeFileSync('./StorageData/corresBotId.json', JSON.stringify(corresBotId));
                                }else{
                                    //console.log('soft_buy_follow is not Done:' + '' + data_buy.client_order_id + ' ' + 'is' + statusBuy);
                                    alertErrorBot.push({id: uuid.v4(), msg: '2:soft_buy_follow is not Done:' + '' + data_buy.client_order_id + ' ' + 'is' + statusBuy});
                                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)


                                }

                            }else{
                                //console.log('28:soft_buy_follow is not Done: order of (' + '' + data_buy.client_order_id + ') ' + 'may be was cancelled' );
                                alertErrorBot.push({id: uuid.v4(), msg: '28:soft_buy_follow is not Done: order of (' + '' + data_buy.client_order_id + ') ' + 'may be was cancelled'});
                                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)


                            }
                            
                        }
                    }else if (clientOrderIdBS.includes(data_buy.client_order_id)){ 
                        let indexClient=clientOrderIdBS.indexOf(data_buy.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);       
                        //console.log('17:'+botList[indexBot_trading]['sym']+':soft-buy of (+'+data_buy.client_order_id+') is not done, since delete_buttom=' + botList[indexBot_trading]['delete_buttom']);
                        alertErrorBot.push({id: uuid.v4(), msg: '17:'+botList[indexBot_trading]['sym']+':soft-buy of (+'+data_buy.client_order_id+') is not done, since delete_buttom=' + botList[indexBot_trading]['delete_buttom']});
                        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    };
                }else if (clientOrderIdBS.includes(data_buy.client_order_id)){
                    let indexClient=clientOrderIdBS.indexOf(data_buy.client_order_id)
                    clientOrderIdBS.splice(indexClient,1); 
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                    //console.log('18:soft-buy of (+'+data_buy.client_order_id+') is not done, the bot id (' + BotId+') maybe was ereased');
                    alertErrorBot.push({id: uuid.v4(), msg: '18:soft-buy of (+'+data_buy.client_order_id+') is not done, the bot id (' + BotId+') maybe was ereased'});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }          

            }
            // ==================================================
            // ===========End soft_buy_follow()======================
            // -----------------------------------------------------------------
            // -----------------------------------------------------------------
            // ===========start sell_follow()====================
            // =======================================   
            async function sell_follow(data_sell,BotId,Sellprice) {
                let foundBot=botList.some(bot => bot.id === BotId);
                if(foundBot){
                    let selectedBot=botList.filter(bot => bot.id === BotId )[0];
                    let indexBot_trading=botList.indexOf(selectedBot);
                    if (botList[indexBot_trading]['delete_buttom']==false) {
                        //console.log('sell_follow_is start');
                        if (clientOrderIdBS.includes(data_sell.client_order_id)) {
                            // let NewUpPercentageSell = (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1'])- SSF;
                            // let NewCoeffUPS = (1 + NewUpPercentageSell / 100) / (1 + (botList[indexBot_trading]['UPS0']+ botList[indexBot_trading]['UPS1']) / 100);
                            // let new_sell_price = Math.ceil(NewCoeffUPS * data_sell.price * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                            //console.log("new_sell_price=" + Sellprice);
                            await ReplaceSellOrder(data_sell.client_order_id, Sellprice, data_sell.quantity,indexBot_trading); 
                                                
                            // //console.log('28:'+"ReplaceSellOrder was Done");

                        }else {
                            let found=corresBotId.some(order => order.client_order_id_sell === data_sell.client_order_id);
                            if (found){
                                let corresId=corresBotId.find(order => order.client_order_id_sell === data_sell.client_order_id);
                                let indexcorresId=corresBotId.indexOf(corresId);
                                let statusSell=corresId.statusSell;
                                if (statusSell=='filled'){
                                    //console.log('sell_follow is not Done:' + '' + data_sell.client_order_id + ' ' + 'is' + 'filled');
                                    alertErrorBot.push({id: uuid.v4(), msg: data_sell.symbol+':'+ data_sell.client_order_id + 'sellOrder is filled'});
                                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                    corresBotId.splice(indexcorresId, 1); 
                                    ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                }else{
                                    //console.log('sell_follow is not Done:' + '' + data_sell.client_order_id + ' ' + 'is' + statusSell);
                                    alertErrorBot.push({id: uuid.v4(), msg: '2:sell_follow is not Done:' + data_sell.symbol+':'+ data_sell.client_order_id + ' ' + 'is' + statusSell});
                                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                }

                            }else{
                                //console.log('28:sell_follow is not Done: order of (' + '' + data_sell.symbol+':'+ data_sell.client_order_id + ') ' + 'may be was cancelled' );
                                alertErrorBot.push({id: uuid.v4(), msg: '28:sell_follow is not Done: order of (' + '' + data_sell.symbol+':'+ data_sell.client_order_id + ') ' + 'may be was cancelled'});
                                ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)


                            }
                            
                        }
                    }else if (clientOrderIdBS.includes(data_sell.client_order_id)){ 
                        let indexClient=clientOrderIdBS.indexOf(data_sell.client_order_id)
                        clientOrderIdBS.splice(indexClient,1);
                        ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);       
                        //console.log('17:'+botList[indexBot_trading]['sym']+':sell follow of (+'+data_sell.client_order_id+') is not done, since delete_buttom=' + botList[indexBot_trading]['delete_buttom']);
                        alertErrorBot.push({id: uuid.v4(), msg: '17:'+botList[indexBot_trading]['sym']+':sell follow of (+'+data_sell.symbol+':'+ data_sell.client_order_id+') is not done, since delete_buttom=' + botList[indexBot_trading]['delete_buttom']});
                        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    };
                }else if (clientOrderIdBS.includes(data_sell.client_order_id)){
                    let indexClient=clientOrderIdBS.indexOf(data_sell.client_order_id)
                    clientOrderIdBS.splice(indexClient,1); 
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                    //console.log('18:sell follow of (+'+data_sell.symbol+':'+ data_sell.client_order_id+') is not done, the bot id (' + BotId+') maybe was ereased');
                    alertErrorBot.push({id: uuid.v4(), msg: '18:sell follow of (+'+data_sell.symbol+':'+ data_sell.client_order_id+') is not done, the bot id (' + BotId+') maybe was ereased'});
                    ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                }          

            }
            // ==================================================
            // ===========End sell_follow()======================
            // -----------------------------------------------------------------
            // ===========start insufficient_funds()====================
            // // =======================================
            async function checking_funds(erorFoundingCode,BotId){
                let foundBot=botList.some(bot => bot.id === BotId);
                if(foundBot){
                    let selectedBot=botList.filter(bot => bot.id === BotId )[0];
                    let indexBot_trading=botList.indexOf(selectedBot);
                    let sym=botList[indexBot_trading]['sym'];
                    if (botList[indexBot_trading]['delete_buttom']==false &&  botList[indexBot_trading]['stop_buttom']==false && botList[indexBot_trading]['filled_buy_order']< botList[indexBot_trading]['MO'] && botList[indexBot_trading]['buy_order_is_done']==false){
                        
                        let Free_fund=await balance_update_symR();
                        let new_buyQuantity=Free_fund/botList[indexBot_trading]['price'];
                        let roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                        //console.log('23:roundQuantity='+roundQuantity);
                        if (roundQuantity<2){
                            //console.log('Warning:'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                            alertErrorBot.push({id: uuid.v4(), msg: 'Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund});
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            let QuantityTooLow=erorFoundingCode;
                            botList[indexBot_trading]['quantity_low']=true;
                            setTimeout(function(){checking_funds(QuantityTooLow,BotId)},43200*1000);
                        }else if (botList[indexBot_trading]['quantity_low']){
                            erorFoundingCode='';
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
            // -----------------------------------------------------------------
            // ==============Start of outPutData_update on active bot========
            function outPutData_update(orderInfo,indexBot_trading){
                try { 
                    // let IranDate = new Date(Date.now()+12600000);
                    // let UTCdate=new Date(Date.parse(orderInfo.updated_at))
                    let IranDate = new Date(Date.parse(orderInfo.updated_at) +12600000); 
                    let outPutData_Order_Quantity=(orderInfo.quantity)*(orderInfo.price);          
                    if (clientOrderIdBS.includes(orderInfo.client_order_id)){
                        // //console.log( 'corresBotId11111=', corresBotId); 
                        
                        if (orderInfo.side=='buy'){
                            // //console.log('corresBotId=',corresBotId)
                            let corresId=corresBotId.filter(bot => bot.client_order_id_buy === orderInfo.client_order_id)[0];
                            let indexBotCorresId=corresBotId.indexOf(corresId);
                            // //console.log('corresId=',corresId)
                            let foundBotId=corresId.BotId;
                            // //console.log('foundBotId=',foundBotId)
                            let foundBot= outPutData.some(bot => bot.BotId === foundBotId);
                            // //console.log('foundBot=',foundBot)
                            if (foundBot){
                                let resaultBot=outPutData.filter(bot => bot.BotId === foundBotId)[0];
                                let indexBot=outPutData.indexOf(resaultBot);
                                if(orderInfo.status=='new'){
                                    let buySellData=resaultBot.buySellData;
                                    // //console.log('buySellData000=',buySellData)
                                    let foundOldOrderNew=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.buyStatus==='new'));
                                    let foundOldOrderFilled=buySellData.some(order => (Date.parse(order.updated_at) >= Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.buyStatus==='filled'));
                                    if (foundOldOrderNew == true && orderInfo.status=='new' && orderInfo.side == 'buy'){
                                        //console.log('147:old order is found which was new');
                                        orderInfo.OldNew='Old';
                                    }else if(foundOldOrderFilled == true && orderInfo.status=='new' && orderInfo.side =='buy'){
                                        //console.log('148:old order is found which was filled');
                                        orderInfo.OldNew='Old';
                                        
                                    }else{
                                        let foundOrder= buySellData.some(order => order.buyStatus === 'new');
                                        // //console.log('foundOrder=',foundOrder)
                                        if (foundOrder){
                                            let OldBuyOrder=buySellData.filter(order => order.buyStatus === 'new')[0];
                                            let indexOrder=buySellData.indexOf(OldBuyOrder);
                                            let newBuyOrder={
                                                buyOrderId:orderInfo.client_order_id,
                                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                                buyTime:IranDate,
                                                buyPrice:orderInfo.price,
                                                buyQuantityBase:orderInfo.quantity,
                                                buyQuantity:outPutData_Order_Quantity,
                                                buyStatus:orderInfo.status,
                                                buyExchangeId:orderInfo.orderId,
                                                sellOrderId:null,
                                                sellTime:'',
                                                sellPrice:'',
                                                sellQuantityBase:'',
                                                sellQuantity:'',
                                                sellStatus:'',
                                                sellExchangeId:'',
                                                updated_at:orderInfo.updated_at,
                                            };
                                            buySellData.splice(indexOrder, 1, newBuyOrder);
                                            // botList[indexBot_trading]['new_buy_order_info']=newBuyOrder;
                                            // //await stramWriteFunc(pathFile_botList,botList);;
                
                                        }else{
                                            let buyData={
                                                buyOrderId:orderInfo.client_order_id,
                                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                                buyTime:IranDate,
                                                buyPrice:orderInfo.price,
                                                buyQuantityBase:orderInfo.quantity,
                                                buyQuantity:outPutData_Order_Quantity,
                                                buyStatus:orderInfo.status,
                                                buyExchangeId:orderInfo.orderId,
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
                                            buySellData.unshift(buyData);  
                                            // botList[indexBot_trading]['new_buy_order_info']=buyData;
                                            // //await stramWriteFunc(pathFile_botList,botList);;               
                                        }
                                        resaultBot.buySellData=buySellData;
                                        orderInfo.OldNew='New';
                                    }
                                    
                                }else if(orderInfo.status=='canceled'){
                                    let buySellData=resaultBot.buySellData;
                                    // //console.log('buySellData000=',buySellData);
                                    let foundOrder= buySellData.some(order => (((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled'))  && order.buyOrderId === corresId.client_order_id_buy));
                                    if (foundOrder){
                                        let OldBuyOrder=buySellData.filter(order => (((order.buyStatus === 'new') || (order.buyStatus === 'partiallyFilled')) && order.buyOrderId === corresId.client_order_id_buy))[0];
                                        let indexOrder=buySellData.indexOf(OldBuyOrder);
                                        buySellData.splice(indexOrder, 1);
                                        // botList[indexBot_trading]['new_buy_order_info']={};
                                        // //await stramWriteFunc(pathFile_botList,botList);;
                                        // -------------------------------------
                                        corresBotId.splice(indexBotCorresId, 1); 
                                        ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                        //console.log('corresBotId22222=',corresBotId);
                                        // -----------------------------------
                                        orderInfo.OldNew='New';
            
                                    }else{
                                        //console.log('can not found the buy-cancelled order with order id: '+orderInfo.client_order_id+ ' '+'in the buySellData to remove from outPutData ')
                                        alertErrorBot.push({id: uuid.v4(), msg:'can not found the buy-cancelled order with order id: '+orderInfo.client_order_id+ ' '+'in the buySellData to remove from outPutData '}); 
                                        ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                        //console.log('148: may be there is old order which was cancelled early');   
                                        orderInfo.OldNew='Old';      
                                    }
                                    resaultBot.buySellData=buySellData;

                                }else if(orderInfo.status=='partiallyFilled'){
                                    let buySellData=resaultBot.buySellData;
                                    // //console.log('buySellData000=',buySellData)
                                    let foundOldOrderPartiallyFilled=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.quantity_cumulative===orderInfo.quantity_cumulative && order.buyStatus==='partiallyFilled'));
                                    if (foundOldOrderPartiallyFilled==true && orderInfo.status=='partiallyFilled' && orderInfo.side ==='buy'){
                                        //console.log('146:old order is found which was partiallyFilled and same quantity_cumulative');
                                        orderInfo.OldNew='Old';
                                    }else{
                                        let foundOrder= buySellData.some(order => ((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')));
                                        //console.log('178:foundOrder='+foundOrder)
                                        if (foundOrder){
                                            let OldBuyOrder=buySellData.filter(order => ((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')))[0];
                                            let indexOrder=buySellData.indexOf(OldBuyOrder);
                                            let new_PartiallyFilled_BuyOrder={
                                                buyOrderId:orderInfo.client_order_id,
                                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                                buyTime:IranDate,
                                                buyPrice:orderInfo.price,
                                                buyQuantityBase:orderInfo.quantity,
                                                buyQuantity:outPutData_Order_Quantity,
                                                buy_quantity_cumulative:orderInfo.quantity_cumulative,
                                                buyStatus:orderInfo.status,
                                                buyExchangeId:orderInfo.orderId,
                                                sellOrderId:null,
                                                sellTime:'',
                                                sellPrice:'',
                                                sellQuantityBase:'',
                                                sellQuantity:'',
                                                sellStatus:'',
                                                sellExchangeId:'',
                                                updated_at:orderInfo.updated_at,
                                            };
                                            // ------start of tradeProb Array definition---
                                            let tradePropObj={};
                                            tradePropObj.buyTradeQuantity=orderInfo.trade_quantity;
                                            tradePropObj.buyTradePrice=orderInfo.trade_price;
                                            tradePropObj.buyTradeFee=orderInfo.trade_fee;
                                            console.log('885:buyOrderId=',new_PartiallyFilled_BuyOrder.buyOrderId)
                                            console.log('886:tradePropObj=',tradePropObj)
                                            if(Object.keys(tradePropObj).length > 0){
                                                if (OldBuyOrder.buyStatus === 'new'){
                                                    let tradeProb=new Array();
                                                    tradeProb.push(tradePropObj);
                                                    //console.log('880:tradePropObj=',tradePropObj)
                                                    new_PartiallyFilled_BuyOrder.buytradeProb=tradeProb;
                                                }else if (OldBuyOrder.buyStatus === 'partiallyFilled'){
                                                    let oldBuytradeProb=OldBuyOrder.buytradeProb
                                                    oldBuytradeProb.push(tradePropObj)
                                                    new_PartiallyFilled_BuyOrder.buytradeProb=oldBuytradeProb
                                                    //console.log('881:oldBuytradeProb=',oldBuytradeProb)
                                                }
                                            }
                                            
                                            // ------end of tradeProb Array definition---
                                            //console.log('441:buySellData[indexOrder]=',buySellData[indexOrder]);
                                            buySellData.splice(indexOrder, 1, new_PartiallyFilled_BuyOrder);
                                            //console.log('442:buySellData[indexOrder]=',buySellData[indexOrder]);
                                            let corresId=corresBotId.filter(bot => bot.client_order_id_buy === new_PartiallyFilled_BuyOrder.buyOrderId)[0];
                                            let index=corresBotId.indexOf(corresId);
                                            // //console.log( 'corresBotId0=', corresBotId);
                                            corresBotId.splice(index, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':new_PartiallyFilled_BuyOrder.buyStatus,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':'' }); 
                                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                            // botList[indexBot_trading]['new_buy_order_info']=new_PartiallyFilled_BuyOrder;
                                            // //await stramWriteFunc(pathFile_botList,botList);;
                                            //console.log( '281:new_PartiallyFilled_BuyOrder=', new_PartiallyFilled_BuyOrder);
                                        }else{
                                            //console.log('159:there is no buySellData with status (PartiallyFilled or new) which is new_PartiallyFilled_BuyOrder');
                                            //console.log('buySellData=',buySellData);
                                            
                                            alertErrorBot.push({id: uuid.v4(), msg:'159:there is no buySellData with status (PartiallyFilled or new) which is new_PartiallyFilled_BuyOrder'});   
                                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)                 
                                        }
                                        // //console.log('foundOrder=',foundOrder)
                                        resaultBot.buySellData=buySellData;
                                        orderInfo.OldNew='New';       
                                    }
                                    
                                }else if(orderInfo.status=='filled'){
                                    let buySellData=resaultBot.buySellData;
                                    // //console.log('buySellData2222=',buySellData)
                                    let foundOldOrder=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId===orderInfo.client_order_id && order.buyStatus==='filled'));
                                    if (foundOldOrder== true && orderInfo.status=='filled' && orderInfo.side=='buy'){
                                        //console.log('149:old buy order is found which was filled');
                                        orderInfo.OldNew='Old';
                                    }else{
                                        let foundOrder= buySellData.some(order => order.buyOrderId === orderInfo.client_order_id);
                                        if (foundOrder){
                                            let OldBuyOrder=buySellData.filter(order => order.buyOrderId === orderInfo.client_order_id)[0];
                                            let indexOrder=buySellData.indexOf(OldBuyOrder);
                                            let filledBuyOrder={
                                                buyOrderId:orderInfo.client_order_id,
                                                // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                                buyTime:IranDate,
                                                buyPrice:orderInfo.price,
                                                buyQuantityBase:orderInfo.quantity,
                                                buyQuantity:outPutData_Order_Quantity,
                                                buyStatus:orderInfo.status,
                                                buyExchangeId:orderInfo.orderId,
                                                sellOrderId:null,
                                                sellTime:'',
                                                sellPrice:'',
                                                sellQuantityBase:'',
                                                sellQuantity:'',
                                                sellStatus:'',
                                                sellExchangeId:'',
                                                updated_at:orderInfo.updated_at,
                                            };
                                            // ------start of tradeProb Array definition---
                                            let tradePropObj={};
                                            tradePropObj.buyTradeQuantity=orderInfo.trade_quantity;
                                            tradePropObj.buyTradePrice=orderInfo.trade_price;
                                            tradePropObj.buyTradeFee=orderInfo.trade_fee;
                                            console.log('887:buyOrderId=',filledBuyOrder.buyOrderId)
                                            console.log('888:tradePropObj=',tradePropObj)
                                            if(Object.keys(tradePropObj).length > 0){
                                                if (OldBuyOrder.buyStatus === 'new'){
                                                    let tradeProb=new Array();
                                                    tradeProb.push(tradePropObj);
                                                    //console.log('880:tradePropObj=',tradePropObj)
                                                    filledBuyOrder.buytradeProb=tradeProb;
                                                }else if (OldBuyOrder.buyStatus === 'partiallyFilled'){
                                                    let oldBuytradeProb=OldBuyOrder.buytradeProb;
                                                    oldBuytradeProb.push(tradePropObj)
                                                    filledBuyOrder.buytradeProb=oldBuytradeProb;
                                                    //console.log('882:oldBuytradeProb=',oldBuytradeProb)
                                                }

                                            }
                                            // ------end of tradeProb Array definition---
                                            buySellData.splice(indexOrder, 1, filledBuyOrder);
                                            let foundOldOrder= buySellData.some(order => ((order.buyOrderId === orderInfo.client_order_id) && (order.buyStatus === 'partiallyFilled') ));
                                            if (foundOldOrder){
                                                let secondOldBuyOrder=buySellData.filter(order => ((order.buyOrderId === orderInfo.client_order_id) && (order.buyStatus === 'partiallyFilled') ))[0];
                                                let secondIndexOrder=buySellData.indexOf(secondOldBuyOrder);
                                                //console.log('444:foundOldOrder='+secondOldBuyOrder)
                                                buySellData.splice(secondIndexOrder, 1);
                                            }
                                            let corresId=corresBotId.filter(bot => bot.client_order_id_buy === filledBuyOrder.buyOrderId)[0];
                                            let index=corresBotId.indexOf(corresId);
                                            // //console.log( 'corresBotId0=', corresBotId);
                                            corresBotId.splice(index, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':filledBuyOrder.buyStatus,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':'' }); 
                                            ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                            // botList[indexBot_trading]['new_buy_order_info']={};
                                            // //await stramWriteFunc(pathFile_botList,botList);;
                                        }else{
                                            //console.log('158:there is no buySellData with status (new) which is filled');
                                            //console.log('buySellData=',buySellData);
                                            
                                            alertErrorBot.push({id: uuid.v4(), msg:'158:there is no buySellData with status (new) which is filled'});   
                                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)                 
                                        }
                                        // //console.log('foundOrder=',foundOrder)
                                        resaultBot.buySellData=buySellData;
                                        orderInfo.OldNew='New';       
                                    }
                                    
                                }
                                outPutData.splice(indexBot, 1, resaultBot);
                                // //await stramWriteFunc(pathFile_outPutData,outPutData)
                                // //console.log('resaultBot1=',resaultBot);
                                // //console.log('outPutData1=',outPutData);
                            
                            }else{
                                // //console.log('corresBotId=',corresBotId)
                                let corresId=corresBotId.filter(bot => bot.client_order_id_buy === orderInfo.client_order_id)[0];
                                let foundBotId=corresId.BotId;
                                // //console.log(corresBotId);
                                let foundBot=botList.filter(bot => bot.id === foundBotId)[0];
                                let resaultBot={
                                    BotId: foundBot.id,
                                    sym: foundBot.sym,
                                }
                                let resaultFilledBot={
                                    BotId: resaultBot.BotId,
                                    sym: resaultBot.sym,
                                }
                                if(orderInfo.status=='new'){
                                    let buyData={
                                        buyOrderId:orderInfo.client_order_id,
                                        // buyTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDate()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        buyTime:IranDate,
                                        buyPrice:orderInfo.price,
                                        buyQuantityBase:orderInfo.quantity,
                                        buyQuantity:outPutData_Order_Quantity,
                                        buyStatus:orderInfo.status,
                                        buyExchangeId:orderInfo.orderId,
                                        sellOrderId:null,
                                        sellTime:'',
                                        sellPrice:'',
                                        sellQuantityBase:'',
                                        sellQuantity:'',
                                        sellStatus:'',
                                        sellExchangeId:'',
                                        updated_at:orderInfo.updated_at,
                                    };
                                    // //console.log('buyData2222=',buyData)
                                    resaultBot.buySellData=[buyData];
                                    resaultFilledBot.buySellFilledData=[];
                                    // console.log('918:indexBot_trading=',indexBot_trading);
                                    // console.log('919:botList=',botList);
                                    // console.log('920:botList0=',botList[indexBot_trading]);
                                    // console.log('921:botList1=',botList[indexBot_trading]['new_buy_order_info']);
                                    // botList[indexBot_trading]['new_buy_order_info']=buyData;
                                    // //await stramWriteFunc(pathFile_botList,botList);;
                                }
                                outPutData.push(resaultBot);
                                // //await stramWriteFunc(pathFile_outPutData,outPutData)
                                outPutFilledData.push(resaultFilledBot);
                                // //await stramWriteFunc(pathFile_outPutFilledData,outPutFilledData)
                                orderInfo.OldNew='New';
                                // console.log('880:resaultBot2=',resaultBot);
                                // console.log('881:outPutData2[0]=',outPutData[0]);
                            }
                            
                        }
                        if (orderInfo.side ==='sell'){
                            // //console.log('10:corresBotId=',corresBotId)
                            let corresId=corresBotId.filter(bot => bot.client_order_id_sell === orderInfo.client_order_id)[0];
                            let indexcorresId=corresBotId.indexOf(corresId);
                            // //console.log('11:corresId=',corresId)
                            let foundBotId=corresId.BotId;
                            // //console.log('12:foundBot=',foundBotId);
                            let resaultBot=outPutData.filter(bot => bot.BotId === foundBotId)[0];
                            let indexBot=outPutData.indexOf(resaultBot);
                            // //console.log('resaultBot=',resaultBot);
                            if(orderInfo.status=='new'){
                                let buySellData=resaultBot.buySellData;
                                // //console.log('buySellData000=',buySellData)
                                let foundOldOrderNew=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.sellStatus==='new'));
                                let foundOldOrderFilled=buySellData.some(order => (Date.parse(order.updated_at) >= Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.sellStatus==='filled'));
                                
                                if (foundOldOrderNew==true && orderInfo.status=='new' && orderInfo.side ==='sell'){
                                    //console.log('150:old order is found which was new sell');
                                    orderInfo.OldNew='Old';

                                }else if (foundOldOrderFilled==true && orderInfo.status=='new' && orderInfo.side ==='sell'){
                                    //console.log('150:old order is found which was filled sell');
                                    orderInfo.OldNew='Old';

                                }
                                else{
                                    let OldBuySellOrder=buySellData.filter(order => order.buyOrderId === corresId.client_order_id_buy)[0];
                                    let indexOrder=buySellData.indexOf(OldBuySellOrder);
                                    let newSellOrder={
                                        buyOrderId:OldBuySellOrder.buyOrderId,
                                        buyTime:OldBuySellOrder.buyTime,
                                        buyPrice:OldBuySellOrder.buyPrice,
                                        buyQuantityBase:OldBuySellOrder.buyQuantityBase,
                                        buyQuantity:OldBuySellOrder.buyQuantity,
                                        buyStatus:OldBuySellOrder.buyStatus,
                                        buyExchangeId:OldBuySellOrder.buyExchangeId,
                                        buytradeProb:OldBuySellOrder.buytradeProb,
                                        sellOrderId:orderInfo.client_order_id,
                                        // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        sellTime:IranDate,
                                        sellPrice:orderInfo.price,
                                        sellQuantityBase:orderInfo.quantity,
                                        sellQuantity:outPutData_Order_Quantity,
                                        sellStatus:orderInfo.status,
                                        sellExchangeId:orderInfo.orderId,
                                        updated_at:orderInfo.updated_at,
                                    };
                                    buySellData.splice(indexOrder, 1, newSellOrder);
                                    resaultBot.buySellData=buySellData;
                                    orderInfo.OldNew='New'; 
                                }
                                
                            }else if(orderInfo.status=='canceled'){
                                let buySellData=resaultBot.buySellData;
                                // //console.log('buySellData000=',buySellData)
                                let foundOldOrder=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.buyOrderId === corresId.client_order_id_buy && order.sellStatus==='canceled'));
                                if (foundOldOrder==true && orderInfo.status =='canceled' && orderInfo.side ==='sell'){
                                    //console.log('151:old order is found which was canceled sell');
                                    orderInfo.OldNew='Old';

                                }else{
                                    let OldBuySellOrder=buySellData.filter(order => order.buyOrderId === corresId.client_order_id_buy)[0];
                                    let indexOrder=buySellData.indexOf(OldBuySellOrder);
                                    let newSellOrder={
                                        buyOrderId:OldBuySellOrder.buyOrderId,
                                        buyTime:OldBuySellOrder.buyTime,
                                        buyPrice:OldBuySellOrder.buyPrice,
                                        buyQuantityBase:OldBuySellOrder.buyQuantityBase,
                                        buyQuantity:OldBuySellOrder.buyQuantity,
                                        buyStatus:OldBuySellOrder.buyStatus,
                                        buyExchangeId:OldBuySellOrder.buyExchangeId,
                                        buytradeProb:OldBuySellOrder.buytradeProb,
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
                                    buySellData.splice(indexOrder, 1, newSellOrder);
                                    resaultBot.buySellData=buySellData;
                                    corresBotId.splice(indexcorresId, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':corresId.statusBuy,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':''}); 
                                    ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                    // //console.log('foundOrder=',foundOrder)
                                    orderInfo.OldNew='New'; 
                                }
                            }if(orderInfo.status=='partiallyFilled'){
                                let buySellData=resaultBot.buySellData;
                                // //console.log('buySellData000=',buySellData)
                                let foundOldOrderPartiallyFilled=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.sellOrderId===orderInfo.client_order_id && order.quantity_cumulative===orderInfo.quantity_cumulative && order.sellStatus==='partiallyFilled'));
                                
                                if (foundOldOrderPartiallyFilled==true && orderInfo.status=='partiallyFilled' && orderInfo.side ==='sell'){
                                    //console.log('154:old order is found which was partiallyFilled and same quantity_cumulative');
                                    orderInfo.OldNew='Old';
                                }
                                else{
                                    let OldBuySellOrder=buySellData.filter(order => order.buyOrderId === corresId.client_order_id_buy)[0];
                                    let indexOrder=buySellData.indexOf(OldBuySellOrder);
                                    let new_PartiallyFilled_SellOrder={
                                        buyOrderId:OldBuySellOrder.buyOrderId,
                                        buyTime:OldBuySellOrder.buyTime,
                                        buyPrice:OldBuySellOrder.buyPrice,
                                        buyQuantityBase:OldBuySellOrder.buyQuantityBase,
                                        buyQuantity:OldBuySellOrder.buyQuantity,
                                        buyStatus:OldBuySellOrder.buyStatus,
                                        buyExchangeId:OldBuySellOrder.buyExchangeId,
                                        buytradeProb:OldBuySellOrder.buytradeProb,
                                        sellOrderId:orderInfo.client_order_id,
                                        // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        sellTime:IranDate,
                                        sellPrice:orderInfo.price,
                                        sellQuantityBase:orderInfo.quantity,
                                        sellQuantity:outPutData_Order_Quantity,
                                        sell_quantity_cumulative:orderInfo.quantity_cumulative,
                                        sellStatus:orderInfo.status,
                                        sellExchangeId:orderInfo.orderId,
                                        updated_at:orderInfo.updated_at,
                                    };
                                    // ------start of tradeProb Array definition---
                                    let tradePropObj={};
                                    tradePropObj.sellTradeQuantity=orderInfo.trade_quantity;
                                    tradePropObj.sellTradePrice=orderInfo.trade_price;
                                    tradePropObj.sellTradeFee=orderInfo.trade_fee;
                                    console.log('879:sellOrderId=',new_PartiallyFilled_SellOrder.sellOrderId)
                                    console.log('880:tradePropObj=',tradePropObj);
                                    if(orderInfo.trade_price === undefined){
                                        console.log("881:orderInfo=",orderInfo);
                                    }
                                    if(Object.keys(tradePropObj).length > 0){
                                        if (OldBuySellOrder.sellStatus === 'new'){
                                            let tradeProb=new Array();
                                            tradeProb.push(tradePropObj);
                                            // console.log('880:tradePropObj=',tradePropObj)
                                            new_PartiallyFilled_SellOrder.selltradeProb=tradeProb;
                                        }else if (OldBuySellOrder.sellStatus === 'partiallyFilled'){
                                            let oldSelltradeProb=OldBuySellOrder.selltradeProb
                                            oldSelltradeProb.push(tradePropObj)
                                            new_PartiallyFilled_SellOrder.selltradeProb=oldSelltradeProb
                                            // console.log('883:oldSelltradeProb=',oldSelltradeProb)
                                        }
                                    }
                                    // ------end of tradeProb Array definition---
                                    // profitCalculation(new_PartiallyFilled_SellOrder);


                                    // let profitPercent=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee)/(filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity)*100;
                                    // new_PartiallyFilled_SellOrder.profitPercent=profitPercent;
                                    // let profitValue=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee);
                                    // new_PartiallyFilled_SellOrder.profitValue=profitValue;
                                    buySellData.splice(indexOrder, 1, new_PartiallyFilled_SellOrder);
                                    resaultBot.buySellData=buySellData;
                                    orderInfo.OldNew='New'; 
                                }
                                
                            }else if(orderInfo.status=='filled'){
                                let buySellData=resaultBot.buySellData;
                                let foundOldOrder=buySellData.some(order => (Date.parse(order.updated_at) === Date.parse(orderInfo.updated_at) && order.sellOrderId === orderInfo.client_order_id && order.sellStatus ==='filled'));
                                if (foundOldOrder==true && orderInfo.status=='filled' && orderInfo.side ==='sell'){
                                    //console.log('152:old order is found which was filled');
                                    orderInfo.OldNew='Old';

                                }else{
                                    let resaultFilledBot=outPutFilledData.filter(bot => bot.BotId === foundBotId)[0];
                                    let indexFilledBot=outPutFilledData.indexOf(resaultFilledBot);
                                    let buySellFilledData=resaultFilledBot.buySellFilledData;
                                    let OldBuySellOrder=buySellData.filter(order => order.buyOrderId === corresId.client_order_id_buy)[0];
                                    let indexOrder=buySellData.indexOf(OldBuySellOrder);
                                    let filledSellOrder={
                                        buyOrderId:OldBuySellOrder.buyOrderId,
                                        buyTime:OldBuySellOrder.buyTime,
                                        buyPrice:OldBuySellOrder.buyPrice,
                                        buyQuantityBase:OldBuySellOrder.buyQuantityBase,
                                        buyQuantity:OldBuySellOrder.buyQuantity,
                                        buyStatus:OldBuySellOrder.buyStatus,
                                        buyExchangeId:OldBuySellOrder.buyExchangeId,
                                        buytradeProb:OldBuySellOrder.buytradeProb,
                                        sellOrderId:orderInfo.client_order_id,
                                        // sellTime:'('+UTCdate.getYear()+'-'+UTCdate.getUTCMonth()+'-'+ UTCdate.getUTCDay()+') '+IranDate.getUTCHours() + ':' + IranDate.getUTCMinutes()+ ':' + IranDate.getUTCSeconds() + ':' + IranDate.getUTCMilliseconds(),
                                        sellTime:IranDate,
                                        sellPrice:orderInfo.price,
                                        sellQuantityBase:orderInfo.quantity,
                                        sellQuantity:outPutData_Order_Quantity,
                                        sellStatus:orderInfo.status,
                                        sellExchangeId:orderInfo.orderId,
                                        // profit:(orderInfo.price-OldBuySellOrder.buyPrice)/OldBuySellOrder.buyPrice*100,
                                        updated_at:orderInfo.updated_at,
                                    };
                                    // ------start of tradeProb Array definition---
                                    let tradePropObj={};
                                    tradePropObj.sellTradeQuantity=orderInfo.trade_quantity;
                                    tradePropObj.sellTradePrice=orderInfo.trade_price;
                                    tradePropObj.sellTradeFee=orderInfo.trade_fee;
                                    console.log('881:sellOrderId=',filledSellOrder.sellOrderId)
                                    console.log('882:tradePropObj=',tradePropObj);
                                    if(orderInfo.trade_price === undefined){
                                        console.log("883:orderInfo=",orderInfo);
                                    }
                                    if(Object.keys(tradePropObj).length > 0){
                                        if (OldBuySellOrder.sellStatus === 'new'){
                                            let tradeProb=new Array();
                                            tradeProb.push(tradePropObj);
                                            //console.log('880:tradePropObj=',tradePropObj)
                                            filledSellOrder.selltradeProb=tradeProb;
                                        }else if (OldBuySellOrder.sellStatus === 'partiallyFilled'){
                                            let oldSelltradeProb=OldBuySellOrder.selltradeProb;
                                            oldSelltradeProb.push(tradePropObj);
                                            filledSellOrder.selltradeProb=oldSelltradeProb;
                                            //console.log('884:oldSelltradeProb=',oldSelltradeProb)
                                        }

                                    }
                                    // ------end of tradeProb Array definition---
                                    profitCalculation(filledSellOrder);
                                    // let profitPercent=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee)/(filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity)*100;
                                    // filledSellOrder.profitPercent=profitPercent;
                                    // let profitValue=(filledSellOrder.sellTradePrice*filledSellOrder.sellTradeQuantity-filledSellOrder.buyTradePrice*filledSellOrder.buyTradeQuantity-filledSellOrder.buyTradeFee-filledSellOrder.sellTradeFee);
                                    // filledSellOrder.profitValue=profitValue;

                                    // //console.log('filledSellOrder=',filledSellOrder);
                                    buySellData.splice(indexOrder, 1);
                                    // buySellData.splice(indexOrder, 1, filledSellOrder);
                                    resaultBot.buySellData=buySellData;
                                    // //console.log('18:corresBotId0=',corresBotId);
                                    corresBotId.splice(indexcorresId, 1, {'BotId':corresId.BotId,'client_order_id_buy':corresId.client_order_id_buy, 'statusBuy':corresId.statusBuy,'diff_buy_spot':corresId.diff_buy_spot, 'client_order_id_sell':corresId.client_order_id_sell, 'statusSell':filledSellOrder.sellStatus}); 
                                    ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                                    // //console.log('19:corresBotId1=',corresBotId);
                                    buySellFilledData.unshift(filledSellOrder);
                                    if (buySellFilledData.length>100){
                                        //console.log('buySellFilledData.length=',buySellFilledData.length)
                                        buySellFilledData.pop();
                                    }
                                    resaultFilledBot.buySellFilledData=buySellFilledData;
                                    outPutFilledData.splice(indexFilledBot, 1, resaultFilledBot);
                                    // //await stramWriteFunc(pathFile_outPutFilledData,outPutFilledData)
                                    orderInfo.OldNew='New'; 
                                }
                                
                            }
                            outPutData.splice(indexBot, 1, resaultBot);
                            // //await stramWriteFunc(pathFile_outPutData,outPutData)
                            
                            // //console.log('resaultBot1=',resaultBot);
                            // //console.log('outPutData1=',outPutData);  
                            
                        }
                    }else{
                        //console.log('49:'+orderInfo.client_order_id+' '+'has not or deleted from clientOrderIdBS  ');
                        return;
                    }
                } catch (error) {
                    console.log("811:outPutData_update:",error);
                    console.log("812:orderInfo:",orderInfo);
                    console.log("813:indexBot_trading:",indexBot_trading);
                    alertErrorBot.push({id: uuid.v4(), msg:"outPutData_update:",error});
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
                        let corresBotId=manualOrder.botId;
                        let outPutManualData_botFilter=outPutManualData.filter(order=>((order.botId === corresBotId) && (order.status === 'filled')) );
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
                }
            }
            // ==============End of outPutData_update on active bot========
            // -------------------------------------------------------------------------
            // -----------------------------------------------------------------
            // ==============Start of finding_indexBot_trading on active bot========
            function finding_indexBot_trading(orderInfo){
                try {  
                    if (clientOrderIdBS.includes(orderInfo.client_order_id)){
                        if (orderInfo.side=='buy'){
                            let found=corresBotId.some(order => order.client_order_id_buy === orderInfo.client_order_id);
                            //console.log('119:found='+found);
                            //console.log('120:found=',orderInfo.client_order_id);
                            if(found){
                                //console.log('121:corresBotId=',corresBotId)
                                let corresId=corresBotId.filter(order => order.client_order_id_buy === orderInfo.client_order_id)[0];
                                //console.log('122:corresId=',corresId);
                                let foundBotId=corresId.BotId;
                                //console.log('123:foundBotId=',foundBotId)
                                let resaultBot=botList.filter(bot => bot.id === foundBotId)[0];
                                //console.log('124:botList.indexOf(resaultBot)='+botList.indexOf(resaultBot));
                                return botList.indexOf(resaultBot);      
                            }else{
                                //console.log('136:the Order id: '+orderInfo.client_order_id+' '+'con not found');
                                //console.log('137:corresBotId=',corresBotId);
                                //console.log('142:the orderInfo: ', orderInfo);
                                alertErrorBot.push({id: uuid.v4(), msg:'36:the Order id: '+orderInfo.client_order_id+' '+'con not found'});
                                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                //console.log('38:EROR found: '+found);
                                let indexClient=clientOrderIdBS.indexOf(orderInfo.client_order_id);
                                clientOrderIdBS.splice(indexClient,1); 
                                // ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                            }               
                        }
                        if (orderInfo.side ==='sell'){
                            let found=corresBotId.some(bot => bot.client_order_id_sell === orderInfo.client_order_id);
                            // //console.log('10:corresBotId=',corresBotId)
                            if(found){
                                let corresId=corresBotId.filter(bot => bot.client_order_id_sell === orderInfo.client_order_id)[0];
                                // //console.log('11:corresId=',corresId)
                                let foundBotId=corresId.BotId;
                                // //console.log('12:foundBot=',foundBotId);
                                let resaultBot=botList.filter(bot => bot.id === foundBotId)[0];
                                // //console.log('resaultBot=',resaultBot);
                                return botList.indexOf(resaultBot);
                            }else{
                                //console.log('39:the Order id: '+orderInfo.client_order_id+' '+'con not found');
                                //console.log('40:corresBotId=',corresBotId);
                                //console.log('42:the orderInfo: ', orderInfo);
                                alertErrorBot.push({id: uuid.v4(), msg:'39:the Order id: '+orderInfo.client_order_id+' '+'con not found'});
                                // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                                //console.log('41:ERROR found: '+found);

                            } 
                            
                        }
                    } 
                    
                } catch (error) {
                    //console.log("41:finding_indexBot_trading:",error);
                    alertErrorBot.push({id: uuid.v4(), msg:"41:finding_indexBot_trading:",error});
                    // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    
                }  
            }
            // ==============End of finding_indexBot_trading on active bot========
            // -------------------------------------------------------------------------
            // -----------------------------------------------------------------
            // ==============Start of min_check_candle========
            function min_check_candle(indexBot){
                let lowPrice=botList[indexBot]['lowPrice'];
                if (botList[indexBot]['nCC'] > 0) {
                    //console.log('458:nCC=',typeof(botList[indexBot]['nCC']));
                    let index1 = lowPrice.length - (botList[indexBot]['nCC'] + 1);
                    let minCheckCandlePrice = lowPrice[index1];
                    // //console.log('333:lowPrice[index1]='+lowPrice[index1]);
                    for (let i = 1; i < botList[indexBot]['nCC']; i++) {
                        let index2 = index1 + i;
                        if (minCheckCandlePrice > lowPrice[index2]) {
                            minCheckCandlePrice = lowPrice[index2];
                        }
                    }
                    botList[indexBot]['minCheckCandlePrice']=minCheckCandlePrice;
                    // //await stramWriteFunc(pathFile_botList,botList);;

                }
                //console.log('400:minCheckCandlePrice='+botList[indexBot]['minCheckCandlePrice']);
            }
            // ==============end of min_check_candle==========
            // --------------------------------------------------
            // -----------------------------------------------------------------
            // ==============Start of close_up_check_candle========
           function close_up_check_candle(indexBot,closePrice){
                //console.log('333:nCC='+botList[indexBot]['nCC']);
                if (botList[indexBot]['nCC'] > 0) {
                    // let closePrice=botList[indexBot]['closePrice'];
                    let index1 = closePrice.length - (botList[indexBot]['nCC'] + 1);
                    let closeUpCheckCandle = closePrice[index1];
                    // //console.log('343:closePrice[index1]='+closePrice[index1]);
                    for (let i = 1; i < botList[indexBot]['nCC']; i++) {
                        let index2 = index1 + i;
                        if (closeUpCheckCandle < closePrice[index2]) {
                            closeUpCheckCandle = closePrice[index2];
                        }
                    }
                    botList[indexBot]['closeUpCheckCandle']=closeUpCheckCandle;
                    // //await stramWriteFunc(pathFile_botList,botList);;

                }else{
                    botList[indexBot]['closeUpCheckCandle']=null;
                }
                //console.log('401:closeUpCheckCandle='+botList[indexBot]['closeUpCheckCandle']);
            }
            // ==============end of close_up_check_candle==========
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
            // --------------------------------------------------
            // ==============Start of BP_calculation========
            function BP_calculation(indexBot_trading){
                let BuyPriceQuantity={};
                // -------------------------------------------------
                // //console.log('3:'+":DPB="+':'+botList[indexBot_trading]['DPB']);
                let mathIDPB
                let filled_buy_order_coff=(botList[indexBot_trading]['filled_buy_order']+1)/3-Math.floor((botList[indexBot_trading]['filled_buy_order']+1)/3);
                console.log('852:filled_buy_order_coff=',filled_buy_order_coff)
                if((botList[indexBot_trading]['IntBot'] === 4) && (botList[indexBot_trading]['filled_buy_order'] > 0) && (filled_buy_order_coff === 0)){
                    mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order'])*(botList[indexBot_trading]['filled_buy_order']);
                    console.log('853:mathIDPB=',mathIDPB)
                }else{
                    mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order']);
                    console.log('854:mathIDPB=',mathIDPB)
                }
                // let mathIDPB=Math.pow((1+botList[indexBot_trading]['IDPB']/100),botList[indexBot_trading]['filled_buy_order']);
                let DPB_coeff=botList[indexBot_trading]['DPB']*mathIDPB;
                if(botList[indexBot_trading]['softBuy']==true){
                    DPB_coeff=(botList[indexBot_trading]['DPB'])*mathIDPB+botList[indexBot_trading]['SDPB'];
                    //console.log('457:softBuy=',botList[indexBot_trading]['softBuy'])
                }
                //console.log('80:mathIDPB='+mathIDPB);
                //console.log('80:DPB_coeff='+DPB_coeff);
                let newBuyPrice = (1 - DPB_coeff/ 100) * botList[indexBot_trading]['price'];
                //console.log('40:'+sym+":newBuyPrice="+newBuyPrice);
                let new_down_BuyPrice = Math.floor(newBuyPrice * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                //console.log('172:botList['+indexBot_trading+']["price"]=',botList[indexBot_trading]['price']);
                //console.log('173:new_down_BuyPrice=',new_down_BuyPrice);
                // --------------------------------------------------
                // --------------------------------------------------
                //console.log('457:nCC=',typeof(botList[indexBot_trading]['nCC']));
                if(botList[indexBot_trading]['nCC'] > 0){
                    min_check_candle(indexBot_trading);
                    if (botList[indexBot_trading]['minCheckCandlePrice'] < new_down_BuyPrice) {
                        //console.log('171:min_check_candle option apply=');
                        new_down_BuyPrice = Math.floor(botList[indexBot_trading]['minCheckCandlePrice'] * botList[indexBot_trading]['roundPricePow']) / botList[indexBot_trading]['roundPricePow'];
                        //console.log('174:botList['+indexBot_trading+']["price"]=',botList[indexBot_trading]['price']);
                        //console.log('175:new_down_BuyPrice_mincheck=',new_down_BuyPrice);
                    }
                }
                // --------------------------------------------------
                let mathIQ=Math.pow((1+botList[indexBot_trading]['IQ']/100),botList[indexBot_trading]['filled_buy_order']);
                // let buyQuantity=botList[indexBot_trading]['FirstQuantity']*mathIQ;
                // let RDPB=1-(DPB_coeff)/100;
                // let neededQuantity=buyQuantity*(RDPB*botList[indexBot_trading]['price']);
                let neededQuantity=(botList[indexBot_trading]['quantity'])*mathIQ/(new_down_BuyPrice);
                //console.log('418:neededQuantity0=',neededQuantity);
                //console.log('419:neededQuantity1=',(botList[indexBot_trading]['quantity'])*mathIQ/(new_down_BuyPrice));
                BuyPriceQuantity.price=new_down_BuyPrice;
                BuyPriceQuantity.quantity=neededQuantity
                //console.log('448:BuyPriceQuantity=',BuyPriceQuantity)
                return BuyPriceQuantity;

            }
            // ===================end of BP_calculation================
            // ---------------------------------
            // ==============Start of corre_client========
           async function corre_client(old_claient_order_id,corressOldId,client_order_id_buy_sell){
                let corresId=corresBotId.filter(order => order.client_order_id_buy === client_order_id_buy_sell)[0];
                let index=corresBotId.indexOf(corresId);
                corresBotId.splice(index, 1,corressOldId); 
                ////await stramWriteFunc(pathFile_corresBotId,corresBotId);
                // //console.log( 'corresBotId0=', corresBotId);
                //console.log('59:client_order_id_buy_sell='+client_order_id_buy_sell);
                let found=clientOrderIdBS.some(client => client === client_order_id_buy_sell);
                if(found){
                    let indexClient=clientOrderIdBS.indexOf(client_order_id_buy_sell);
                    clientOrderIdBS.splice(indexClient,1,old_claient_order_id);
                    ////await stramWriteFunc(pathFile_clientOrderIdBS,clientOrderIdBS);
                }           
            }
            // ===================end of corre_client================
            // ---------------------------------
            // ==============Start of foud_LowQuantity_bot_func========
            async function foud_LowQuantity_bot_func(){
                await Promise.all(botList.map(async (bot) =>  {if(bot.quantity_low){
                    //console.log('814:'+bot.sym+':quantity_low='+bot.quantity_low);
                    let indexBot_trading=botList.indexOf(bot);
                    let sym=bot.sym;
                    if((botList[indexBot_trading]['delete_buttom'] == false) &&(botList[indexBot_trading]['stop_buttom'] == false) && ((botList[indexBot_trading]['filled_buy_order']) < (botList[indexBot_trading]['MO']))){
                        //console.log('815:'+bot.sym+':indexBot_trading=',indexBot_trading);
                        // botList[indexBot_trading]['quantity_low']=false;
                        // await douwn_percent_order_buy(indexBot_trading);
                        // //console.log('816:'+bot.sym+':quantity_low='+bot.quantity_low);
                        let Free_fund=await balance_update_symR();
                        let new_buyQuantity=Free_fund/botList[indexBot_trading]['price'];
                        let roundQuantity=Math.floor(new_buyQuantity/(symInfo[sym].quantity_increment));
                        //console.log('258:roundQuantity='+roundQuantity);
                        if (roundQuantity<2){
                            //console.log('482:Warning:'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund);
                            alertErrorBot.push({id: uuid.v4(), msg: 'Warning(2011:Quantity too low	):'+' '+sym+':'+'Your Free_fund of'+' '+symR +' '+'is:'+ Free_fund});
                            ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                            return;
                        }else{
                            //console.log('815:'+bot.sym+':quantity_low='+bot.quantity_low);
                            botList[indexBot_trading]['quantity_low']=false;
                            await douwn_percent_order_buy(indexBot_trading);
                        }
                    }
                }} ))
            }
            // ==========================================
            // ---------------------------------
            // ==============start of profit caculation========
            function profitCalculation(filledSellOrder){
                filledSellOrder.buySumTradeQuantity= null;
                filledSellOrder.buySumTradeFee= null;
                filledSellOrder.sellSumTradeQuantity= null;
                filledSellOrder.sellSumTradeFee= null;
                console.log('839:BuyOrderId=',filledSellOrder.buyOrderId);
                console.log('840:SellOrderId=',filledSellOrder.sellOrderId);
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
                        alertErrorBot.push({id: uuid.v4(), msg:"emty tradePropObj(buyOrderId):",id});
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
                        alertErrorBot.push({id: uuid.v4(), msg:"emty tradePropObj(sellOrderId):",id});
                        // ////await stramWriteFunc(pathFile_alertErrorBot,alertErrorBot)
                    }
                });
                let profitValue=(filledSellOrder.sellSumTradeQuantity-filledSellOrder.buySumTradeQuantity-filledSellOrder.buySumTradeFee-filledSellOrder.sellSumTradeFee);
                filledSellOrder.profitValue=profitValue;
                let profitPercent=(filledSellOrder.sellSumTradeQuantity-filledSellOrder.buySumTradeQuantity-filledSellOrder.buySumTradeFee-filledSellOrder.sellSumTradeFee)/(filledSellOrder.buySumTradeQuantity+filledSellOrder.buySumTradeFee+filledSellOrder.sellSumTradeFee)*100;
                filledSellOrder.profitPercent=profitPercent;
            }
            // ==============end of profit caculation========
             // ---------------------------------
            // ==============start of newBuyOrderDataInfo========
            function newBuyOrderDataInfo(indexBot){
                
                try{
                    let new_buy_order_data_info={};
                    let id=botList[indexBot]["id"];
                    // console.log('785:id=',id)
                    let foundBot= outPutData.some(bot => bot.BotId === id);
                    if (foundBot){
                        let resaultBot=outPutData.find(bot => bot.BotId === id);
                        let buySellData=resaultBot.buySellData;
                        // console.log('785:buySellData=',buySellData)
                        let foundBuyOrder= buySellData.some(order => ((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')));
                        if (foundBuyOrder){
                            new_buy_order_data_info= buySellData.find(order => ((order.buyStatus === 'new')|| (order.buyStatus === 'partiallyFilled')));
                            return new_buy_order_data_info
                        }
                    }else{
                        return new_buy_order_data_info
                    }

                }catch(e){
                    console.log("759=",e)
                }
                

            }
                                         
            // ==============end of newBuyOrderDataInfo========
            
                                                        
            

        }
        // ==========================end of function ws_socket_V3()=======
        // ---------------------------
        // -----------memory of node js exploring----------------------
        // const used = process.memoryUsage().heapUsed / 1024 / 1024;
        // console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
        // ---------------------------------------------
        
    }
    // =======================End of BOT=====================
    // *************************************
    // ------end of Functions--------------
    // ====================================
        
}



module.exports = router;
