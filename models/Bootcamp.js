const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify =  require('slugify')
const geocoder =  require('../utils/geocoder')

const  BootcampSchema =  new Schema({
  
  name:{                     // From req.body
    type:String,
    required:[true,'Please add a name'],
    unique:true,
    trim:true,
    maxlength:[50,'Name cannot be more than 50 characters']
  },
  slug:String,               // generate from mongoose middleware function 
  description: {            // From req.body
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  website: {                // From req.body
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  phone: {                 // From req.body
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {                // From req.body
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  address: {             // From req.body
    type: String,
    required: [true, 'Please add an address']
  },
  location:{             // generate from mongoose middleware function 
     // GeoJSON Point
     type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress:String,
    street:String,
    city:String,
    state:String,
    zipcode:String,
    country:String,

  },
  careers: {             // From req.body
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {        // generate from mongoose middleware function  
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must can not be more than 10']
  },
  averageCost: Number,    // generate from mongoose middleware function
  photo: {                // if not photo sent, then a default of 'no-photo.jpg' is sent as photo data
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {              // From req.body
    type: Boolean,
    default: false
  },
  jobAssistance: {        // From req.body
    type: Boolean,
    default: false
  },
  jobGuarantee: {         // From req.body      
    type: Boolean,
    default: false
  },
  acceptGi: {             // From req.body
    type: Boolean,
    default: false
  },
  createdAt: {           // to be create automatically
    type: Date,
    default: Date.now
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  }


},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})


// Create bootcam slug from the name

BootcampSchema.pre('save',async function(next){
  this.slug = slugify(this.name,{lower:true})
  // next()
})

// Geocode & Create location field
BootcampSchema.pre('save',async function(next){
  const loc = await geocoder.geocode(this.address)
  this.location ={
    type:'Point',
    coordinates:[loc[0].longitude,loc[0].latitude],
    formattedAddress:loc[0].formattedAddress,
    street:loc[0].streetName,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipcode,
    country:loc[0].countryCode, 
  }
  // Do not save address in DB
  this.address = undefined // do not save address in data base since we put it inside the location as formattedAddress
  // next()
})


// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove',async function(){
  await this.model('Course').deleteMany({bootcamp:this._id})
})



// Reverse populate with virtuals
// schema virtual takes two things
// first is the field you want to add as virtual on the bootcamp model, here we call it courses
// second some options: 
// 1- ref: 
BootcampSchema.virtual('courses',{       
  ref:'Course',  //  model to use or model that you want to pull data
  localField:'_id',   // Find people where `localField`
  foreignField: 'bootcamp',  // the field in the ref model that we want to pull data
  justOne:false  // we want to get an array of all courses related to this bootcamp
})

module.exports = mongoose.model('Bootcamp',BootcampSchema)