var express = require('express')
var router = express.Router()

var controller=require('../controller/product.controller')

router.get('/register', controller.prepareProductInfo)

router.post('/api/create', controller.registerProduct)

router.get('/api/read/:id', controller.getSpecificProduct)

router.get('/api/read', controller.getAllProducts)

router.post('/api/comment', controller.postComment)
module.exports=router
