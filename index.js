const express = require('express')
const cors = require('cors')
var path = require('path')
var bodyParser =  require('body-parser')
var path = require('path')
require('dotenv').config()


app = express()
app.use(express.json());
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// app.set("view options", {layout: false});
// app.use(express.static(__dirname + '/views'));
// app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))


//----------------------------------------------------------Config firestore and cloud storage
const Firestore = require('@google-cloud/firestore');
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client
// const storage = new Storage({
//     projectId: process.env.PROJECT_ID,
//     // keyFilename: path.join(__dirname, 'key.json')
//     keyFilename: "key.json"
// });


const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    // keyFilename: path.join(__dirname, 'key.json'),
    keyFilename: "key.json"
});


// routes
app.get('/hello-word', (req, res) => {
    return res.status(200).send("Hello world!");
});
app.get('/register/product', (req, res) => {
    res.render('product.html')
})

// assisted variable and function



// async function uploadFile(destFileName) {
//     imagePath = path.join(__dirname, destFileName)
//     await storage.bucket(process.env.BUCKETNAME).upload(imagePath, {
//         destination: destFileName,
//     });
    
//     // console.log(`${filePath} uploaded to ${bucketName}`);
// }

// Create
// Post
app.post('/api/create', (req, res) => {
    console.log(req.body)
    // image list
    const image = []
    for(i=0; i< req.body.totalImg; i++){
        image.push({
            alt: eval(`req.body.alt_${i}`),
            img: process.env.URL + eval(`req.body.img_${i}`)
        })
        // uploadFile(image[i].img).catch(console.error)
       
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
            await db.collection('product').add(data);
            console.log("submitted successfully")
            return res.render('product.html')
        }
        catch (error) {
            console.log('error')
            console.log(error)
            return res.status(500).send(error)
        }
    })();
    console.log("Hello       ")
    // res.status(200).send()
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
