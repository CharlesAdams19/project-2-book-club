import serverless from 'serverless-http'
import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import 'dotenv/config'
import methodOverride from 'method-override'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passUserToView from '../../middleware/passUserToView.js'
import passErrorToView from '../../middleware/passErrorToView.js'
import bodyParser from '../../middleware/bodyParser.js'

// Routers
import bookReviewsRouter from '../../controllers/bookreviews.js'
import authController from '../../controllers/auth.js'
import userRouter from '../../controllers/users.js'

const app = express()

// Middleware
app.use(methodOverride('_method'))
app.use(bodyParser) // Similar to express.json(), this middleware instead captures urlencoded body types (forms) on requests and transforms the data onto the req.body key
app.use(morgan('dev'))
app.use(express.static('public')) // This line serves static files to the client (CSS/JS/Images etc)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}))

app.use(passUserToView)
app.use(passErrorToView)

// Routes

// Home page
app.get('/', (req,res) => {
  return res.render('index.ejs')
})

// Routers
app.use('/', bookReviewsRouter)
app.use('/', authController)
app.use('/', userRouter)

// 404 handler
app.use('/{*any}', (req, res) =>{
  return res.status(404).render('not-found.ejs')
})


// ! Listen
async function startServers(){
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log(`🔒 Database connection established`)
  } catch (error) {
    console.log(error)
  }
}
startServers()

export const handler = serverless(app)