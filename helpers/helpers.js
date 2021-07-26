

require('dotenv').config()
const util = require('util')

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client
const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: "new_key.json"
});

const bucket = storage.bucket(process.env.BUCKETNAME)


// async function uploadFile(filePath) {
//     imagePath = path.join(dirname, destFileName)
//     await storage.bucket(process.env.BUCKETNAME).upload(imagePath, {
//         destination: destFileName,
//     });
    
//     // console.log(`${filePath} uploaded to ${bucketName}`);
// }


const uploadImage = (file) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file
  console.log(originalname)
  console.log(buffer)
  const blob = bucket.file(originalname.replace(/ /g, "_"))
  const blobStream = blob.createWriteStream({
    // resumable: false
    metadata: {
        contentType: file.mimetype
    }
  })
  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    resolve(publicUrl)
  })
  .on('error', () => {
    reject(`Unable to upload image, something went wrong`)
  })
  .end(buffer)
})

module.exports = {uploadImage}