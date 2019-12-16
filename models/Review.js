const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({

  title :{
    type:String,
    trim:true,
    required:[true,'Please add a course title for the review'],
    maxlength:100
  },
  text:{
    type:String,
    required:[true,'Please add some text']
  },
  rating:{
    type:Number,
    min:1,
    max:10,
    required:[true,'Please add a rating between one and ten']
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  bootcamp:{
    type:mongoose.Schema.ObjectId,  // create a relation between the course a bootcamp, here is the bootcamp id where the course is created
    ref:'Bootcamp',  // ref looks at which model to create relation with, in this Bootcamp model
    required:true
  },
  user:{
    type:mongoose.Schema.ObjectId,  // create a relation between the course a user, here is the bootcamp id where the course is created
    ref:'User',  // ref looks at which model to create relation with, in this user model
    required:true
  }
})

// prevent user  from submitting more than one review per bootcamp
// this is not working gotta try it myself
ReviewSchema.index({bootcamp:1,user:1},{unique:true})



// Static  method to get average of ratings and save
ReviewSchema.statics.getAverageRating = async function(bootcampId){

  const obj = await this.aggregate([
     {
      $match:{bootcamp:bootcampId}    // return an array with the documents that macthes this query
    },
     {
       $group:{
         _id:'$bootcamp',    // group them by bootcamp Id
         averageRating:{$avg:'$rating'}  // return average rating of this bootcamp
       }
     }
  ])

  // update the averageCost if exists, if does not exist then create one
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
      averageRating:obj[0].averageRating  // to give us just an interger 
    })
  } catch (error) {
    console.log(err)
  }
}


// Call getAverageRating after save
ReviewSchema.post('save',async function(){
 this.constructor.getAverageRating(this.bootcamp)
})


// Call getAverageRating before remove
ReviewSchema.pre('remove',async function(){
 this.constructor.getAverageRating(this.bootcamp)
})


module.exports = mongoose.model('Review',ReviewSchema)