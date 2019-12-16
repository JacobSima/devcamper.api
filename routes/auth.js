const express = require('express')
const router =  express.Router()
const {register,login,getMe,forgotpassword,resetPassword,updateDetails,updatePassword,logout} =require('../controllers/auth')
const {protect} = require('../middleware/auth')

router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',protect,getMe) 
router.post('/forgotpassword',forgotpassword)
router.put('/resetPassword/:resetToken',resetPassword)
router.put('/updatedetails',protect,updateDetails)
router.put('/updatepassword',protect,updatePassword)
  

 
module.exports = router