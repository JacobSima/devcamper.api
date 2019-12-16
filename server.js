const express = require('express')
const logger = require('./middleware/logger')
const morgan = require('morgan')
const connectDB = require('./config/db')
const colors = require('colors')
const errorHandler = require('./middleware/error')
const fileupload = require('express-fileupload')
const path =  require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xss = require('xss-clean')    // this is not working
const rateLimit = require("express-rate-limit")
const hpp = require('hpp')
// const cors = require('cors')
// Load env vars
const dotenv =  require('dotenv')
dotenv.config({path:'./config/config.env'})  // provide the path of the config file since we put it at a specific location


/******************** Connect to DB *************************************** */
connectDB()


/******************** load routes*************************************** */
const bootcamps =  require('./routes/bootcamps')
const courses =  require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/user')
const reviews = require('./routes/reviews')


/******************** start express app*************************************** */
const app = express()


/******************** Use Middlewares *************************************** */

/****** Middlewares packages ***************** */
// Set security headers
//It's best to use Helmet early in your middleware stack so that its headers are sure to be set.
app.use(helmet())  


// prevent XSS attacks
//make sure this comes before any routes 
app.use(xss())

// Rate limiting
const limiter =  rateLimit({
  windowMs: 10*60*1000,  // 10 minutes
  max:100
})
app.use(limiter)

// Prevent http param pollution
app.use(hpp())

// Enable cors
// app.use(cors)

// morgan middleware
if(process.env.NODE_ENV= 'development'){
  app.use(morgan('dev'))
}

// File upload middleware
app.use(cookieParser())

app.use(fileupload())

app.use(express.static(path.join(__dirname,'public')))

app.use(express.json())

// Sanitize data
// this needs to be use right after the expressjson middleware since it is sanitizing the req.body,req.query and req.params that are accessible through expressjson
app.use(mongoSanitize()); 
/****** Customs packages ***************** */
// app.use(logger)


/******************** Use Routes******************************************** */
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users)
app.use('/api/v1/reviews',reviews)




/******************** ERROR HANDLER *************************************** */

app.use(errorHandler)

/******************** Listern To server *************************************** */
const PORT = process.env.PORT || 5000


const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

// handle Unhandled promise rejection
process.on('unhandledRejection',(err,promise)=>{console.log(`Unhandled Rejection: ${err.message}`.red)
 //closed server & exit process
 server.close(()=> process.exit(1))

})