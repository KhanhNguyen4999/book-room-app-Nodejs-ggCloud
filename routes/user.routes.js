var express = require('express')
var router = express.Router()

var controller=require('../controller/user.controller')

router.post('/api/registerUser', controller.registerUser)

router.post('/api/registerHost', controller.registerHost)

router.get('/api/read/:id', controller.getSpecificUser)

router.get('/api/read', controller.getAllUser)

router.post('/api/addFavourite', controller.addFavourite)

router.get('/api/getListFavourite/:id', controller.getListFavourite)

router.post('/api/removeProductInListFavourite', controller.removeProductInListFavourite)

router.post('/api/validateLogin', controller.validateLogin)



module.exports = router
