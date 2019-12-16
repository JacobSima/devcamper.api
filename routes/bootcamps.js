const express = require('express')
const router = express.Router()
const {getBootcamp,getBootcamps,createBootcamp,updateBootcamp,deleteBootcamp,getBootcampInRadius,bootcampPhotoUpload} = require('../controllers/bootcamps')
const {protect,authorize } = require('../middleware/auth')

//include other resources routers
const courseRouter = require('./courses')
const reviewsRouter = require('./reviews')

// Re-route into other resources router
router.use('/:bootcampId/courses',courseRouter)
router.use('/:bootcampId/reviews',reviewsRouter)


router
  .route('/')
  .get(getBootcamps)
  .post(protect,authorize('publisher','admin'),createBootcamp)

router
  .route('/:id')
  .get(getBootcamp) 
  .put(protect,authorize('publisher','admin'),updateBootcamp)
  .delete(protect,authorize('publisher','admin'),deleteBootcamp) 
router
  .route('/:id/photo')
  .put(protect, authorize('publisher','admin'),bootcampPhotoUpload)
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampInRadius)

module.exports = router