const express = require('express')
var path = require('path')
var bodyParser =  require('body-parser')
require('dotenv').config()
const multer = require('multer')

app = express()
app.use(express.json());
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// app.set("view options", {layout: false});
// app.use(express.static(__dirname + '/views'));
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

const helpers = require('./helpers/helpers')

app.disable('x-powered-by')
const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  })
app.use(multerMid.single('image')) // That use multer like the middleware 

//----------------------------------------------------------Config firestore and cloud storage
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    // keyFilename: path.join(__dirname, 'key.json'),
    keyFilename: "key.json"
});




//----------------------------------------------------------Routes

app.get('/hello-word', (req, res) => {
    return res.status(200).send("Hello world!");
});
app.get('/register/product', (req, res) => {
    res.render('product.html')
})

// assisted variable and function

// async function uploadFile(filePath) {
//     imagePath = path.join(dirname, destFileName)
//     await storage.bucket(process.env.BUCKETNAME).upload(imagePath, {
//         destination: destFileName,
//     });
    
//     // console.log(`${filePath} uploaded to ${bucketName}`);
// }

// Create
// Post
// The first, data will go through multer middleware, after the result will pass to uploadImg middleware
app.post('/uploads', async (req, res, next) => {
    try {
      const myFile = req.file
      const imageUrl = await helpers.uploadImage(myFile)
      res
        .status(200)
        .json({
          message: "Upload was successful",
          data: imageUrl
        })
    } catch (error) {
      next(error)
    }
  })
app.post('/api/create', (req, res) => {
    console.log(req.body);
    (async() =>{ 
            try {
            const myFile = req.file
            console.log(req.file)
            const imageUrl = await helpers.uploadImage(myFile)
            return res
            .status(200)
            .json({
                message: "Upload was successful",
                data: imageUrl
            })
        } catch (error) {
            return res.status(500).send(error)
        }
    })();
    return;

    const image = []
    for(i=0; i< req.body.totalImg; i++){
        image.push({
            alt: eval(`req.body.alt_${i}`),
            img: process.env.URL + eval(`req.body.img_${i}`)
        })
        // uploadFile(req.file.path).catch(console.error)
       
    }
    // list reviewer
    const reviewer = []
    for(i=0; i< req.body.totalReviewer; i++){
        reviewer.push({
            reviewerID: eval(`req.body.reviewerID_${i}`),
            comment: eval(`req.body.comment_${i}`)
        })
    }

    (async () => {
        const data = {
            type: req.body.type,
            address: {
                district: req.body.district,
                ward: req.body.ward,
                city: req.body.city,
                addressNumber: req.body.addr_number
            },
            discription: req.body.description,
            facility: {
                square: req.body.squareMeters,
                wife: req.body.wife,
                bedroom: req.body.bedroom,
                bath: req.body.bath,
                mezzanine: req.body.mezzanine
            },
            host:{
                host_id: req.body.host_id
            },
            price:{
                room: req.body.room,
                electricity: req.body.electricity,
                water: req.body.water
            },
            reviews:reviewer,
            image: image    
        }
        try {
            console.log("Before submit")
            await db.collection('product').add(data);
            console.log("submitted successfully")
            return res.redirect('/register/product')
            // return res.render("product.html")
        }
        catch (error) {
            console.log('error')
            console.log(error)
            return res.status(500).send(error)
        }
    })();
})

// // Read 
// // Get
app.get('/api/read/:id', (req, res) =>{
    (async() =>{
        try{

            const document = db.collection('product').doc(req.params.id)
            const product = await document.get()
            let response = product.data()

            return res.status(200).send(response)
        }
        catch(error){
            console.log('error')
            return res.status(500).send(error)
        }
    })();
}) 


// Read all the products
app.get('/api/read', (req, res) =>{
    (async() =>{
        try{
            let query = db.collection('product')
            let response = []

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs; // the result of the query

                for(let doc of docs){
                    seletedProduct = doc.data()
                    seletedProduct['id'] = doc.id
                    response.push(seletedProduct)
                }
            })
            return res.status(200).send(response)   
        }
        catch (error){
            console.log('error')
            return res.status(500).send(error)
        }
    })();
})

// Up
// Put

// Delete
// Delete

// Export the api to Firebase Cloud Functions
app.listen(process.env.PORT, function () {
    console.log("Server listen on port ", process.env.PORT)
})
