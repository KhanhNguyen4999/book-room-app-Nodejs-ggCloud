var express = require('express')
var router = express.Router()

var controller=require('../controller/user.controller')

router.post('/registerUser', controller.registerUser)

router.post('/api/registerHost', controller.registerHost)



module.exports = router
