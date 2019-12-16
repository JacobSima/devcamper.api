const Bootcamp = require('../models/Bootcamp')
const mongoose = require('mongoose')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const path = require('path')


// @desc  Get all bootcamps 
//@route  GET/api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async(req,res,next)=>{

   let query
   // copy req.query
   const reqQuery = {...req.query}
   
   // Fields to exclude
   const removeFields =  ['select','sort','page','limit']

   // loop over removeFields and delete them from reQuery
   removeFields.forEach(param => delete reqQuery[param])

   // Create query string
   let queryStr = JSON.stringify(reqQuery)

   // Create operators ($gt,$gte,lt,lte,in)
   queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`)

   // Finding resource
   query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')
   
   // Select Fields
   if(req.query.select){
     // convert select = name,description, etc.. into select = name description
      const fields = req.query.select.split(',').join(' ')
      query.select(fields)
   }

   // Sort
   if(req.query.sort){
     const sortBy =  req.query.sort.split(',').join(' ')
     query.sort(sortBy)
   }else{
     query.sort('-createdAt')  //descending
   }

    // project to add
    const entries = await query

   // Pagination
   const page = parseInt(req.query.page,10) || 1
   const limit =  parseInt(req.query.limit,10) || 25
   const startIndex = (page-1)*limit
   const endIndex = page * limit
   const total = await Bootcamp.countDocuments()   // gives the total document 
   
  
 

   query.skip(startIndex).limit(limit)

   // Executing query
    const bootcamps = await query
    
  // pagination result
  let pagination = {}

  if(endIndex < total){
    pagination.next ={
      page:page + 1,
      limit
    }
  }

  if(startIndex > 0 ){
    pagination.prev ={
      page: page - 1,
      limit
    }
  }

    res.status(200).json({
      success:true,
      data:bootcamps,
      count:bootcamps.length,
      pagination
    })
})


// @desc  Get single bootcamps
//@route  GET/api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async(req,res,next)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses')

    if(!bootcamp) {return next(new ErrorResponse (`Bootcamp not found with id of ${req.params.id}`,404))}

    res.status(200).json({
      success:true,
      data:bootcamp
    }) 
})



// @desc  Create new  bootcamp
//@route  POST/api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async(req,res,next)=>{ 

   // Add user to req.body
    req.body.user = req.user.id

  //check for published bootcamp
  // find bootcamp published by this user
  const publishedBootcamp = await Bootcamp.findOne({user:req.user.id})

  // if the user is not an admin can only add one bootcamp

  if(publishedBootcamp && req.user.role !== 'admin'){
    return next(new ErrorResponse(`the user with ID ${req.user.id} has already published a bootcamp`))
  }


    const bootcamp =  await Bootcamp.create(req.body)
    
    res.status(201).json({
      succes:true,
      data:bootcamp
    })    
})


// @desc  Update bootcamp
//@route  PUT/api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async(req,res,next)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

    let bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp) {return next(new ErrorResponse (`Bootcamp not found with id of ${req.params.id}`,404))}

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse (`User ${req.params.id} is not autorized to update this bootcamp`,401))
    }

   // update here
     bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true
    })

    res.status(200).json({success:true,data:bootcamp})
})

// @desc  Delete bootcamp
//@route  DELETE/api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async(req,res,next)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

    const bootcamp =  await Bootcamp.findById(req.params.id)

    if(!bootcamp) {return next(new ErrorResponse (`Bootcamp not found with id of ${req.params.id}`,404))}

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse (`User ${req.params.id} is not autorized to delete this bootcamp`,401))
    }

    await bootcamp.remove()

    res.status(200).json({
      success:true,data:{}
    })
    
})


// @desc  GET bootcamp within a radius
//@route  GET/api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampInRadius = asyncHandler(async(req,res,next)=>{
 const {zipcode,distance} = req.params

// get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude
 //calculate radius using radians
 // Divide distance by radius of Earth
 // earth radius  = 3,963 miles/6,378 km

 const radius = distance/3963

 const bootcamps = await Bootcamp.find({
   location:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
 })
 res.status(200).json({
   success:true,
   count:bootcamps.length,
   data:bootcamps
 })
})


// @desc  upload photo for bootcamp
//@route  PUT/api/v1/bootcamps/:id/photo
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async(req,res,next)=>{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  const bootcamp =  await Bootcamp.findById(req.params.id)

  if(!bootcamp) {return next(new ErrorResponse (`Bootcamp not found with id of ${req.params.id}`,404))}

  // Make sure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse (`User ${req.params.id} is not autorized to update this bootcamp`,401))
  }
 
  if(!req.files){return next(new ErrorResponse (`Please upload a file`,400))}


  const file = req.files.file

  // Make sure the image is a photo
  if(!file.mimetype.startsWith('image')){
    {return next(new ErrorResponse (`Please upload an image file`,400))}
  }

  // check file size
  if(file.size > process.env.MAX_FILE_UPLOAD){
    {return next(new ErrorResponse (`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400))}
  }

  //create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  // upload the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=>{
    if(err){console.log(err);return next(new ErrorResponse (`problem with file upload`,500))}

    // insert the file name into DB
    await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name})
    res.status(200).json({
      success:true,data:file.name
    })
    
  })

 
})