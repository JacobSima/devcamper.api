const express = require('express')
const dotenv =  require('dotenv')

// Load env vars
dotenv.config({path:'./config/config.env'})  // provide the path of the config file since we put it at a specific location

const app = express()



const PORT = process.env.PORT || 5000
app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))