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

        try {
            const imageUrl = await helpers.uploadImage(req.files[0])
            console.log({
                message: "Upload was successful",
                data: imageUrl
            })
            const data = {
                username: req.body.username,
                password: req.body.password,
                avatar: imageUrl
            }

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
    (async()=>{
        try{
            let query = db.collection('user')
            let response = []
            await query.get().then(querySnapshot =>{
                let docs = querySnapshot.docs;
                for(let doc of docs){
                    selectedUser = doc.data();
                    selectedUser['id'] = doc.id;
                    response.push(selectedUser);
                }
                return res.status(200).send(response)
            })
        }
        catch(err){
            return res.status(500).send(err)
        }
    })();
}

module.exports.addFavourite = (req, res) => {
    (async () =>{
        try{
            let user = db.collection('user').doc(req.body.idUser);
            let data = await user.get();
            data = data.data();
            
            if ('favouriteList' in data){
                console.log("hello");
                let flag=0;
                for(let p of data['favouriteList']){
                    if (req.body.idProduct == p){
                        flag=1;
                        break;
                    }
                } 
                
                if(flag!=1){
                    data['favouriteList'].push(req.body.idProduct)
                    const res = await user.update({
                        favouriteList: data['favouriteList']
                    });
                }
                else{return res.status(200).send("it already exists");}
            }else{

                const t = await user.set({
                    favouriteList: [req.body.idProduct]
                }, { merge: true });
            }
            return res.status(200).send("Upgrade to host successfully");
        }
        catch(err){
            return res.status(500).send(err);
        }
    })()
};