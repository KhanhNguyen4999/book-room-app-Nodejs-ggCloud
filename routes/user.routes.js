var express = require('express')
var router = express.Router()

var controller=require('../controller/user.controller')

router.post('/api/registerUser', controller.registerUser)

router.post('/api/registerHost', controller.registerHost)

router.get('/api/read/:id', controller.getSpecificUser)

router.get('/api/read', controller.getAllUser)

router.post('/api/addFavourite', controller.addFavourite)

module.exports = router
