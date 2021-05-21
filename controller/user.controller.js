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