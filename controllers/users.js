const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User =  require('../models/User')
const mongoose = require('mongoose')

// @desc  Get all users 
//@route  GET/api/v1/auth/users
//@access Private/admin
exports.getUsers = asyncHandler(async (req,res,next)=>{
     const users = await User.find()
     res.status(200).json({
      success:true,
      data:users
    })
})



// @desc  Get single user
//@route  GET/api/v1/auth/users/:id
//@access Private/admin
exports.getUser = asyncHandler(async (req,res,next)=>{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  const user = await User.findById(req.params.id)
  
  if(!user) {return next(new ErrorResponse (`User not found with id of ${req.params.id}`,404))}

  res.status(200).json({
   success:true,
   data:user
 })
})


// @desc  Create user
//@route  POST/api/v1/auth/users
//@access Private/admin
exports.createUser = asyncHandler(async (req,res,next)=>{
  const user = await User.create(req.body)
  res.status(201).json({
   success:true,
   data:user
 })
})



// @desc  Update user
//@route  PUT/api/v1/auth/users/:id
//@access Private/admin
exports.updateUser = asyncHandler(async (req,res,next)=>{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
  
  if(!user) {return next(new ErrorResponse (`User not found with id of ${req.params.id}`,404))}

  res.status(200).json({
   success:true,
   data:user
 })
})




// @desc  Delete User
//@route  DELETE/api/v1/auth/users/:id
//@access Private/admin
exports.deleteUser = asyncHandler(async (req,res,next)=>{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  const user = await User.findByIdAndDelete(req.params.id)
  
  if(!user) {return next(new ErrorResponse (`User not found with id of ${req.params.id}`,404))}

  res.status(200).json({
   success:true,
   data:{}
 })
})
