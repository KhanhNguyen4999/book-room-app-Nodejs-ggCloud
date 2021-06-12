const { QuerySnapshot } = require('@google-cloud/firestore');
const Firestore = require('@google-cloud/firestore');
const helpers = require('../helpers/helpers')

//----------------------------------------------------------Config firestore and cloud storage
const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    // keyFilename: path.join(__dirname, 'key.json'),
    keyFilename: "key.json"
});

module.exports.registerUser = (req, res) => {
    (async () => {
        console.log(req.files.length)
        try {
            let data;
            if (req.files.length!=0){
                const imageUrl = await helpers.uploadImage(req.files[0])
                console.log({
                    message: "Upload was successful",
                    data: imageUrl
                })
                data = {
                    username: req.body.username,
                    password: req.body.password,
                    avatar: imageUrl
                }
            }
            else{
                console.log("gdf")
                data = {
                    username: req.body.username,
                    password: req.body.password,
                    avatar: ''
                }
            }
            console.log("alo")
            try {
                const user = await db.collection('user').add(data)
                user_id = user.id
                return res.status(200).send(user_id)
            } catch (error) {
                return res.status(500).send(error)
            }
        } catch (error) {
            return res.status(500).send(error)
        }
    })();
}

module.exports.registerHost = (req, res) => {
    console.log(req.body);
    (async () => {
        try {
            const user = db.collection('user').doc(req.body.userID)
            const t = await user.set({
                phoneNumber: req.body.phone,
                email: req.body.email
            }, { merge: true });
            return res.status(200).send("Upgrade to host successfully")
        }
        catch (error) {
            return res.status(500).send(error)
        }
    })();
}


module.exports.getSpecificUser = (req, res) => {
    (async () => {
        try {

            const document = db.collection('user').doc(req.params.id)
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

module.exports.getAllUser = (req, res) => {
    (async () => {
        try {
            let query = db.collection('user')
            let response = []
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    selectedUser = doc.data();
                    selectedUser['id'] = doc.id;
                    response.push(selectedUser);
                }
                return res.status(200).send(response)
            })
        }
        catch (err) {
            return res.status(500).send(err)
        }
    })();
}

module.exports.addFavourite = (req, res) => {
    (async () => {
        try {
            let user = db.collection('user').doc(req.body.idUser);
            let data = await user.get();
            data = data.data();

            if ('favouriteList' in data) {
                console.log("hello");
                let flag = 0;
                for (let p of data['favouriteList']) {
                    if (req.body.idProduct == p) {
                        flag = 1;
                        break;
                    }
                }

                if (flag != 1) {
                    data['favouriteList'].push(req.body.idProduct)
                    const res = await user.update({
                        favouriteList: data['favouriteList']
                    });
                }
                else { return res.status(200).send("it already exists"); }
            } else {

                const t = await user.set({
                    favouriteList: [req.body.idProduct]
                }, { merge: true });
            }
            return res.status(200).send("Upgrade to host successfully");
        }
        catch (err) {
            return res.status(500).send(err);
        }
    })()
};

module.exports.removeProductInListFavourite = (req, res) => {
    (async() =>{
        try{
            let user = db.collection('user').doc(req.body.idUser);
            let data = await user.get();
            data = data.data();
            console.log(data);

            console.log("hello");
            console.log(data);
            let ls_favourite = data['favouriteList']
            let index = ls_favourite.indexOf(req.body.idProduct)
           
            if(index>-1){
                ls_favourite.splice(index, 1)
                const res = await user.update({
                    favouriteList: ls_favourite
                });
                return res.status(200).send("Remove successed");
            }
            return res.status(200).send("Product have not in list")
        }
        catch(error){
            return res.status(500).send(error);
        }
    })()
}

module.exports.getListFavourite = (req, res) => {
    (async () => {
        try {
            let user = db.collection('user').doc(req.params.id);
            user = await user.get();
            user = user.data();
            let favouriteList = user['favouriteList'];

            let product = db.collection('product')
            console.log(favouriteList)
            let response = []
            for(let p of favouriteList){
                let rel = product.doc(p);
                rel = await rel.get();
                rel = rel.data();
                rel['id'] = p;
                response.push(rel);
            }
            
            return res.status(200).send(response)
        }
        catch (err) {
            console.log("hello")
            return res.status(500).send(err)
        }
    })()
}

module.exports.validateLogin = (req, res) =>{
    let error = []

    if(!req.body.username)
        error.push("username is required")
    
    if(!req.body.password)
        error.push("password is required")
    
    if(error.length)
        return res.status(200).send(error);
    

    (async() =>{
        try{
            let users = db.collection('user');
            let response = []
            await users.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    let id = doc.id;
                    selectedUser = doc.data();
                    if (selectedUser['username'] == req.body.username && selectedUser['password'] == req.body.password){
                        selectedUser['id'] = id;
                        return res.status(200).send(selectedUser);
                    }
                    
                }
                return res.status(500).send('Invalid username or password');
            })

        }
        catch(error){
            return res.status(500).send("Error")
        }
    })()
}

module.exports.makeAnAppointment = (req, res) =>{
    (async()=>{
        try{
        // Handle host
        let host = db.collection('user').doc(req.body.hostId)
        let booking ={
            'fullname': req.body.fullname,
            'email': req.body.email,
            'phone': req.body.phone,
            'date': req.body.date
        }

        let hostData = await host.get();
        hostData = hostData.data();
        if('booking' in hostData){
            hostData['booking'].push(booking)
            const res = await host.update({
                booking: hostData['booking']
            });
    
        }
        else{
            const t = await host.set({
                booking: [booking]
            }, { merge: true });    
        }

        // Handle user
        let user = db.collection('user').doc(req.body.userId)
        let room_contacted = {
            'productId': req.body.productId,
            'date': req.body.date 
        }
        let userData = await user.get();
        userData = userData.data();
        if('room_contacted' in userData){
            userData['room_contacted'].push(room_contacted)
            const res = await user.update({
                room_contacted: userData['room_contacted']
            });
    
        }
        else{
            const t = await user.set({
                room_contacted: [room_contacted]
            }, { merge: true });    
        }
        
        return res.status(200).send("Make an appointment successfully")
    }
    catch(error){
        return res.status(500).send("Error")
    }

    })()
}