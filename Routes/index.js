const express=require('express');
const router=express.Router();
const {ensureAuth}=require('../config/auth');
const cors=require('cors');

// index Page:
// router.get("/",(req,res)=>{
//     res.render('index');
// });

module.exports=router;


