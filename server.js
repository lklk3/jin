const express = require('express')
const router=require('./router.js')
var mongoose=require('mongoose')
const passport = require('passport');
const bodyParser = require('body-parser')
const app = express()

const db=require('./config/keys').mongoURI;

mongoose.connect(db).then(()=>console.log("mongoDB Connected")).catch(err=>console.log(err))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize());
require ('./config/passport')(passport)

app.use(router)

app.listen(3000, () => console.log('Example app listening on port 3000!'))