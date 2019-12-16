const express = require('express')
const router = express.Router()
const Bootcamp = require('../models/Bootcamp')

const {getUser,getUsers,updateUser,createUser,deleteUser} = require('../controllers/users')

const {protect,authorize } = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))

router
  .route('/')
  .get(getUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser) 
  .put(updateUser)
  .delete(deleteUser)

module.exports = router