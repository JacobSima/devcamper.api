const Bootcamp = require('../models/Bootcamp')
const mongoose = require('mongoose')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')

// @desc  Get reviews
//@route  GET/api/v1/reviews
//@route GET/api/v1/bootcamps/:bootcampId/reviews
//@access Public
exports.getReviews = asyncHandler(async(req,res,next)=>{
 
  let query

  if(req.params.bootcampId){
    if(!mongoose.Types.ObjectId.isValid(req.params.bootcampId)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.bootcampId}`,404))}
     query = Review.find({bootcamp:req.params.bootcampId})
   }else{
      query = Review.find({})
   }

   const reviews = await query
    res.status(200).json({
      success:true,
      data:reviews

    })
})





// @desc  Get Single review
//@route  GET/api/v1/reviews/:id
//@access Public
exports.getReview = asyncHandler(async(req,res,next)=>{
 
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}
   
      const review = await Review.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
      })

      if(!review){return next(new ErrorResponse (`Not review found with the id of: ${req.params.id}`,404))}

      res.status(200).json({
      success:true,
      data:review
     })
})




// @desc  Add reviews
//@route  POST/api/v1/bootcamps/:bootcampId/reviews
//@access Private
exports.createReview = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.bootcampId)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.bootcampId}`,404))}
 
   req.body.bootcamp = req.params.bootcampId
   req.body.user = req.user._id

   const bootcamp = await Bootcamp.findById(req.params.bootcampId)

   if(!bootcamp){return next(new ErrorResponse (`Not bootcamp found for the id of : ${req.params.bootcampId}`,404))}


   const review = await Review.create(req.body)

    res.status(201).json({
      success:true,
      data:review
    })
})






// @desc  Update reviews
//@route  PUT/api/v1/reviews/:id
//@access Private
exports.updateReview = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}
 
   let review = await Review.findById(req.params.id)

   if(!review){return next(new ErrorResponse (`Not bootcamp found for the id of : ${req.params.id}`,404))}

   // make sure review belongs to user or user is an admin
   if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){return next(new ErrorResponse (`Not authorize to update review : ${req.params.id}`,401))}



    review = await Review.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})


    res.status(200).json({
      success:true,
      data:review
    })
})




// @desc  Delete review
//@route  DELETE/api/v1/reviews/:id
//@access Private
exports.deleteReview = asyncHandler(async(req,res,next)=>{

  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {return next(new ErrorResponse (`Invalid Object Id : ${req.params.id}`,404))}
 
   let review = await Review.findById(req.params.id)

   if(!review){return next(new ErrorResponse (`Not bootcamp found for the id of : ${req.params.id}`,404))}

   // make sure review belongs to user or user is an admin
   if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){return next(new ErrorResponse (`Not authorize to update review : ${req.params.id}`,401))}

    await review.remove()

    res.status(200).json({
      success:true,
      data:{}
    })
})



