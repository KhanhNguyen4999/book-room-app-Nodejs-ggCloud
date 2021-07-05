const express = require('express')
const multer = require('multer')
var path = require('path')
var bodyParser = require('body-parser')
require('dotenv').config()


productRoute = require('./routes/product.routes')
userRoute = require('./routes/user.routes')

app = express()

const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})

app.use(multerMid.array('image', 10)) // That use multer like the middleware 
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname));
app.use(express.json());
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


app.use('/product', productRoute)
app.use('/user', userRoute)
// Export the api to Firebase Cloud Functions
app.listen(process.env.PORT, function () {
    console.log("Server listen on port ", process.env.PORT)
})
