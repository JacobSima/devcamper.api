const mongoose = require('mongoose')
const Schema =  mongoose.Schema
const bcrypt =  require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema =  new Schema({
  name:{
    type:String,
    required:[true,'please add a name']
  },
  email: {    
    type: String,
    required:[true,'Please add an email'],
    unique:true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role:{
    type:String,
    enum:['user','publisher'],
    default:'user'
  },
  password:{
    type:String,
    required:[true,'Please add a password'],
    minlength:6,
    select:false,    // select to false, meaning when we get a user password wont be in the query
  },
  resetPasswordToken:String,
  resetPasswordExpire:Date,
  createdAt:{
    type:Date,
    default:Date.now
  }

})


// Encryp password using bcrypt
userSchema.pre('save',async function(next){

  // skip the hashing of the password during saving the passwordResetToken
  if(!this.isModified('password')){
     next()
  }

  const salt =  await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password,salt)
})

// Sign JWT and return
userSchema.methods.getSignedJWToken = function(){
  return jwt.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE
  })
}

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword){
  return await  bcrypt.compare(enteredPassword,this.password)
}

// generate and hash password token
userSchema.methods.getResetPasswordToken = function(){
   // generate token
   const resetToken = crypto.randomBytes(20).toString('hex')   // generate random data, with 20 bytes, this need to be formatted as string since we get back a buffer

   // hash token and set to resetpasswordtoken field
   this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
 
  // set the expire for 10 min
  this.resetPasswordExpire = Date.now() + 10 +60 + 1000

  return resetToken
}

module.exports = mongoose.model('User',userSchema)