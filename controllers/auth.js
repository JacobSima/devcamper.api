const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User =  require('../models/User')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')


// @desc  Register User 
//@route  POST/api/v1/auth/register
//@access Public
exports.register = asyncHandler(async (req,res,next)=>{
   const {name,email,password,role} = req.body

   //create user
   const user = await User.create({name,email,password,role})

   // create token
   sendTokenResponse(user,200,res)
})


// @desc  Login User 
//@route  POST/api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req,res,next)=>{
  const {email,password} = req.body

  // Validate email and password 
  if(!email || !password) {return next(new ErrorResponse('Please provide an email and password',400))}

  // check for the user
  const user =  await User.findOne({email}).select('+password')

  if(!user){return next(new ErrorResponse('Invalid credentials',401))}

  // check if password matches
  const isMatch = await user.matchPassword(password)

  if(!isMatch){return next(new ErrorResponse('Invalid credentials',401))}
 
  sendTokenResponse(user,200,res)
})



// @desc  logout and clear cookies, this is used only when cookies is enable in the auth middleware
//@route  get/api/v1/auth/logout
//@access Private
exports.logout = asyncHandler(async(req,res,next)=>{

  res.cookie('token','none',{
    expires:new Date(Date.now()+10*1000),
    httpOnly:true
  })

  res.status(200).json({
    success:true,
    data:{}
  })
})




// @desc  Get Current logged User 
//@route  POST/api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.user._id)

  res.status(200).json({
    success:true,
    data:user
  })
})




// @desc  Update user details
//@route  PUT/api/v1/auth/updatedetails
//@access Private
exports.updateDetails = asyncHandler(async(req,res,next)=>{
// user can only update his name and email
  const fieldsToUpdate ={
    name:req.body.name,
    email:req.body.email
  }


  const user = await User.findByIdAndUpdate(req.user._id,fieldsToUpdate,{new:true,runValidators:true})


  res.status(200).json({
    success:true,
    data:user
  })
})



// @desc  Update password 
//@route  PUT/api/v1/auth/updatepassword
//@access Private
exports.updatePassword = asyncHandler(async(req,res,next)=>{
  let user = await User.findById(req.user._id).select('+password')

  // check if password matches
  const isMatch = await user.matchPassword(req.body.currentPassword)

  if(!isMatch){return next(new ErrorResponse('Password is invalid',401))}

  user.password = req.body.newPassword

  await user.save()

  sendTokenResponse(user,200,res)
})






// @desc  Forgot password 
//@route  POST/api/v1/auth/forgotpassword
//@access Public
exports.forgotpassword = asyncHandler(async(req,res,next)=>{

  const user = await User.findOne({email:req.body.email})

  if(!user){
    return next(new ErrorResponse(`There is not user with that email`,404))  // not found
  }

  // get reset token

  const resetToken = user.getResetPasswordToken()

  await user.save()

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`

  // create message to send
  const message = `
    You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to : \n\n ${resetUrl}
  `
  try {
     await sendEmail({
       email: user.email,
       subject:'Password reset Token',
       message
     })
     res.status(200).json({
      success:true,
      data:'Email sent'
    })
  } catch (error) {
     console.log(error)
     user.resetPasswordToken = undefined
     user.resetPasswordExpire = undefined

     await user.save({validateBeforeSave:false})
     return next(new ErrorResponse('Email could not be sent',500))
  }
   
})



// @desc  Reset Password 
//@route  PUT/api/v1/auth/resetpassword/:resetToken
//@access Public
exports.resetPassword = asyncHandler(async(req,res,next)=>{

  // get hashed token
   const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

  const user = await User.findOne({resetPasswordToken})

  if(!user){
    return next(new ErrorResponse(`Invalid Token`,400))
  }

  // Set the new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  // save th user
  await user.save()

  sendTokenResponse(user,200,res) 
})






// get token from model and create cookie and send response
const sendTokenResponse = (user,statusCode,res)=>{
  // Create toke
  const token =  user.getSignedJWToken()
  const options = {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
    httpOnly:true
  }
 
 if(process.env.NODE_ENV === 'production'){
   options.secure =true
 }
 
  res
   .status(statusCode)
   .cookie('token',token,options)
   .json({success:true,token})
 
 }