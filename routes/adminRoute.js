const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const productValidator = require('../utils/validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const isAuth = require('../utils/middleware/is-auth')

router.get('/login', (req, res, next) => {
    // console.log(req.session)
    res.render('admin/login', { 
        pageTitle: 'Login', 
        pathName: '/admin/login',
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        errorMessage: req.flash('error')
    })
})

router.post('/login', (req, res, next) => {
    const { email, password } = req.body
    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid email or password')
                return res.redirect('/admin/login')
            }
            return bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if(doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    res.redirect('/admin/login')
                })
                .catch(err => {
                    console.log(err)
                    return res.redirect('/admin/login')
                })
        })
})

router.get('/register', (req, res, next) => {
    res.render('auth/signup', { 
        pageTitle: 'Sign Up', 
        pathName: '/admin/register', 
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: req.flash('error')
    })
})

router.post('/register', (req, res, next) => {
    const { fullName, email, password, confirmPassword } = req.body
    User.findOne({ email: email})
        .then(user => {
            if(user) {
                req.flash('error', 'User already exists')
                return res.redirect('/admin/register')
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: fullName, 
                        email: email, 
                        password: hashedPassword,
                        cart: { items: []}
                    })
                    return newUser.save()
                })
                .then(response => {
                    console.log(response)
                    res.redirect('/admin/login')
                })
                .catch(err => {
                    console.log(err)
                    throw err;
                })
        })
        
})

router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
})
router.get('/add-product', isAuth, adminController.getAddProducts)
router.post('/products', isAuth, productValidator, adminController.saveAddProduct)
router.get('/admin-product', isAuth, adminController.getAdminProduct)
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/update-product/:productId', isAuth, adminController.patchUpdatedProduct)
router.post('/delete-product', isAuth, adminController.deleteProduct)

module.exports = router
