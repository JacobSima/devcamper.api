const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseSchema = new Schema({

  title :{
    type:String,
    trim:true,
    required:[true,'Please add a course title']
  },
  description:{
    type:String,
    required:[true,'Please add a description']
  },
  weeks:{
    type:String,
    required:[true,'Please add a number of week']
  },
  tuition:{
    type:Number,
    required:[true,'Please add a tuition cost']
  },
  minimumSkill:{
    type:String,
    required:[true,'Please add a minimum skill'],
    enum:['beginner','intermediate','advanced']   // it has to be one of these, that what enum does
  },
  scholarshipAvailable:{
    type:Boolean,
    default:false
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


// Static  method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){

   const obj = await this.aggregate([
      {
       $match:{bootcamp:bootcampId}    // return an array with the documents that macthes this query
     },
      {
        $group:{
          _id:'$bootcamp',    // group them by bootcamp Id
          averageCost:{$avg:'$tuition'}  // return average cost of this bootcamp
        }
      }
   ])

   // update the averageCost if exists, if does not exist then create one
   try {
     await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
       averageCost:Math.ceil(obj[0].averageCost/10)*10   // to give us just an interger 
     })
   } catch (error) {
     console.log(err)
   }
}


// Call getAverageCost after save
CourseSchema.post('save',async function(){
  this.constructor.getAverageCost(this.bootcamp)
})


// Call getAverageCost before remove
CourseSchema.pre('remove',async function(){
  this.constructor.getAverageCost(this.bootcamp)
})



module.exports = mongoose.model('Course',CourseSchema)