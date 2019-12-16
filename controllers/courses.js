const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const mongoose = require('mongoose')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

// @desc  Get Courses
//@route  GET/api/v1/courses
//@route  GET/api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses = asyncHandler(async(req,res,next)=>{

    let query

    if (req.params.bootcampId){
      if(!mongoose.Types.ObjectId.isValid(req.params.bootcampId)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.bootcampId}`,404))}
      query =  Course.find({bootcamp:req.params.bootcampId})
    }else{
      query =  Course.find()
    }

    query.populate({
      path:'bootcamp',
      select:'name description'
      
    })

    const courses =  await query 

    res.status(200).json({
      success:true,
      count:courses.length,
      data:courses

    })
})


// @desc  Get Singe Courses
//@route  GET/api/v1/course/:id
//@access Public
exports.getCourse = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

   const course = await Course.findById(req.params.id).populate({
     path:'bootcamp',
     select:'name description'
   })

   if(!course) {
     return next(new ErrorResponse(`No Course with the id of ${req.params.id}`,404))
   }

    res.status(200).json({
      success:true,
      data:course

    })
})



// @desc  Add a Course
//@route  POST/api/v1/bootcamps/:bootcampId/courses
//@access Private
exports.addCourse = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.bootcampId)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.bootcampId}`,404))}

   const bootcamp = await Bootcamp.findById(req.params.bootcampId)

   if(!bootcamp) { 
     return next(new ErrorResponse(`No Bootcamp with the id of ${req.params.bootcampId}`,404))
   }

   req.body.bootcamp = req.params.bootcampId
   req.body.user = req.user.id

      // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse (`User ${req.user.id} is not autorized to add a course to the bootcamp`,401))
    }
    

   const course =  await Course.create(req.body)

    res.status(200).json({
      success:true,
      data:course

    })
})


// @desc  Update a Course
//@route  PUT/api/v1/courses/:id
//@access Private
exports.updateCourse = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  let course =  await Course.findById(req.params.id)

  if(!course) {
    return next(new ErrorResponse(`No Course with the id of ${req.params.id}`,404))
  }

    // Make sure user is bootcamp owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse (`User ${req.user.id} is not autorized to update this course`,401))
    }
 
  course = await Course.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})

    res.status(200).json({
      success:true,
      data:course

    })
})





// @desc  Delete a Course
//@route  PUT/api/v1/courses/:id
//@access Private
exports.deleteCourse = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}

  const course =  await Course.findById(req.params.id)

  if(!course) {
    return next(new ErrorResponse(`No Course with the id of ${req.params.id}`,404))
  }
 
   // Make sure user is bootcamp owner
   if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse (`User ${req.user.id} is not autorized to delete this course`,401))
  }

    await course.remove()

    res.status(200).json({
      success:true,
      data:{}

    })
})