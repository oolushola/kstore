const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const productValidator = require('../utils/validator')
const User = require('../models/user')

router.get('/login', (req, res, next) => {
    console.log(req.session)
    res.render('admin/login', { 
        pageTitle: 'Login', 
        pathName: '/admin/login',
        isAuthenticated: req.session.isLoggedIn 
    })
})
router.post('/login', (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true')
    // req.session.isLoggedIn = true
    // res.redirect('/')
    User.findById('604788b6df2764bbc74a179e')
        .then((user) => {
            req.session.isLoggedIn = true
            req.session.user = user
            res.redirect('/')
        })
        .catch(err => {
            console.log(err)
        })
})
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
})
router.get('/add-product', adminController.getAddProducts)
router.post('/products', productValidator, adminController.saveAddProduct)
router.get('/admin-product', adminController.getAdminProduct)
router.get('/edit-product/:productId', adminController.getEditProduct)
router.post('/update-product/:productId', adminController.patchUpdatedProduct)
router.post('/delete-product', adminController.deleteProduct)

module.exports = router
