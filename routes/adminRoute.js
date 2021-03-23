const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const productValidator = require('../utils/validator')
const User = require('../models/user')
const isAuth = require('../utils/middleware/is-auth')
const authController = require('../controllers/authController')
const { check, body } = require('express-validator')
const product = require('../models/product')

router.get('/login', authController.getLogin)
router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body('password', 'Password should be minimum of 6 characters and must contain numbers and letters')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
)
router.get('/register', authController.getSignup)
router.post('/register', 
    [
        check('email')
            .isEmail()
            .trim()
            .normalizeEmail()
            .withMessage('Please enter a valid email') 
            .custom((value, { req }) => {
                if(value === 'test@email.com') {
                    throw new Error('this email is forbidden')
                }
                return true
            }),
        body('password', 'The password required must be minimum of 6 characters long and an alpha numberic')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if(value !== req.body.password) {
                    throw new Error('Password does not match')
                }
                return true
            })
    ],
    authController.postSignUp
)
router.post('/logout', authController.postLogout)
router.get('/password-reset', authController.getPasswordReset)
router.post('/reset-user-password', authController.postPasswordReset)
router.get('/reset/my-password/:token', authController.getPasswordResetToken)
router.post('/update-new-password', authController.postPasswordResetToken)

router.get('/add-product', isAuth, adminController.getAddProducts)
router.post('/products', 
    isAuth, 
    [
        body('productName', 'Product name is required')
            .notEmpty()
            .trim()
            .custom((value, {req}) => {
                product.findOne({ product: value })
                    .then(product => {

                    })
            }),
        body('productPrice', 'Product price is required')
            .isFloat()
            .trim(),
        body('description')
            .trim(),
    ],
    adminController.saveAddProduct
)
router.get('/admin-product', isAuth, adminController.getAdminProduct)
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/update-product/:productId', isAuth, adminController.patchUpdatedProduct)
router.post('/delete-product', isAuth, adminController.deleteProduct)

module.exports = router
