const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/users', userController.addNewUser)
router.get('/user/:userId', userController.getUser)

module.exports = router