const express = require('express')
const Mongoose = require('mongoose')
const dotenv = require('dotenv')
const connectDB  = require('./config/db')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')
dotenv.config({path: './config/config.env'})


require('./config/passport')(passport)

connectDB()

const app = express()

app.use(express.urlencoded({ extended: false}))
app.use(express.json())

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'))
}

const { formatDate,editIcon,select} = require('./helpers/hbs')

app.engine('.hbs', exphbs.engine({
  helpers:{
    formatDate,
    editIcon,
    select

  },
  defaultLayout:'main',extname: '.hbs'
}));
app.set('view engine', '.hbs');
// app.set('views', './views');


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    })
  }))

app.use(passport.initialize())
app.use(passport.session())

app.use(function(req,res,next){
  res.locals.user = req.user || null
  next()
})


const PORT = process.env.PORT||3000

app.use(express.static(path.join(__dirname,'public')) )

app.use('/',require('./routes/routes.js'))
app.use('/auth',require('./routes/auth.js'))
app.use('/stories',require('./routes/stories'))



app.listen(PORT, console.log(`Server  is running in ${process.env.NODE_ENV} mode on port ${PORT}`))