
const Firestore = require('@google-cloud/firestore');
const helpers = require('../helpers/helpers')

//----------------------------------------------------------Config firestore and cloud storage
const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    // keyFilename: path.join(__dirname, 'key.json'),
    keyFilename: "key.json"
});

module.exports.prepareProductInfo = function(req, res){
    res.render('product.html')
}

module.exports.registerProduct = function(req, res){
    console.log(req.body);
    console.log(req.files)
    // fistly, upload raw image to cloud store
    const ls_imageURL = [];
    (async () => {
        for (let i =0;i<req.files.length; i++) {
            try {
            const imageUrl = await helpers.uploadImage(req.files[i])
            // console.log({
            //         message: "Upload was successful",
            //         data: imageUrl
            //     })
            ls_imageURL.push(imageUrl)
            } catch (error) {
                return res.status(500).send(error)
            }
        }
        // console.log(ls_imageURL)
        // const reviewer = []
        // for (i = 0; i < req.body.totalReviewer; i++) {
        //     reviewer.push({
        //         reviewerID: eval(`req.body.reviewerID_${i}`),
        //         comment: eval(`req.body.comment_${i}`)
        //     })
        // }
        const data = {
            type: req.body.type,
            address: {
                district: req.body.district,
                ward: req.body.ward,
                city: req.body.city,
                addressNumber: req.body.addr_number
            },
            description: req.body.description,
            facility: {
                square: req.body.squareMeters,
                wifi: req.body.wifi,
                bedroom: req.body.bedroom,
                bath: req.body.bath,
                mezzanine: req.body.mezzanine
            },
            host: {
                host_id: req.body.host_id
            },
            price: {
                room: req.body.room,
                electricity: req.body.electricity,
                water: req.body.water
            },
            image: {
                alt: req.body.alt,
                url: ls_imageURL 
            }
        }
        try {
            console.log("Before submit")
            const doc = await db.collection('product').add(data); // ở đây theo mình mốt muốn xứ lí dưới app, thì khi thêm 1 product mới thì mình sẽ trả về id của document mới được thêm vào
            // id = doc.id
            console.log("submitted successfully")
            return res.render("product.html")
        }
        catch (error) {
            console.log('error')
            console.log(error)
            return res.status(500).send(error)
        }
    })();
}

module.exports.getAllProducts = function(req, res){
    (async () => {
        try {
            let query = db.collection('product')
            let response = []

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs; // the result of the query

                for (let doc of docs) {
                    seletedProduct = doc.data()
                    seletedProduct['id'] = doc.id
                    response.push(seletedProduct)
                }
            })
            return res.status(200).send(response)
        }
        catch (error) {
            console.log('error')
            return res.status(500).send(error)
        }
    })();
}

module.exports.getSpecificProduct = function(req, res){
    (async () => {
        try {

            const document = db.collection('product').doc(req.params.id)
            const product = await document.get()
            let response = product.data()

            return res.status(200).send(response)
        }
        catch (error) {
            console.log('error')
            return res.status(500).send(error)
        }
    })();
}

module.exports.postComment = function(req, res){
    (async() => {
        try{
            
            const document = db.collection('product').doc(req.body.productId)
            const product = await document.get()
            let response = product.data()
            
            review = {
                reviewerID: req.body.userId,
                comment: req.body.comment
            }

            if ('reviews' in response){
                console.log("exist")
                response['reviews'].push(review)
                const res = await document.update({
                    reviews: response['reviews']
                });
            }
            else{
                console.log("don't exist")
                const t = await document.set({
                    reviews: [review]
                }, { merge: true }); 
            }

            res.status(200).send("Successfully")
        } catch(error){
            return res.status(500).send(error)
        }
    })()
}