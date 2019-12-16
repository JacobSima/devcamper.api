const jwt = require('jsonwebtoken')
const asyncHandler= require('./async')
const errorResponse = require('../utils/errorResponse')
const User  = require('../models/User')

//protect routes

exports.protect = asyncHandler(async (req,res,next)=>{
   let  token
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
     token = req.headers.authorization.split(' ')[1]
   }
 
  
   // for cookies
  //  else if(req.cookies.token){
  //    token = req.cookies.token
  //  }

  // make sure token exists
  if(!token){
    return next(new errorResponse('Not authorize to access this route',401))
  }

  try {
    // verify
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    if(!decoded){return next(new errorResponse('Not authorize to access this route',401))}
    req.user = await User.findById(decoded.id)
    
  } catch (error) {
    return next(new errorResponse('Not authorize to access this route',401))
  }

  next()
})

//grant acces to specific role
exports.authorize = (...roles)=>{

  return (req,res,next) =>{
    if(!roles.includes(req.user.role)){
      return next(new errorResponse(`User role ${req.user.role} is not autorized`,403))  //403 forbidden error
    }
    next()
  }
}