const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const productValidator = require('../utils/validator')

router.get('/add-product', adminController.getAddProducts)
router.post('/products', productValidator, adminController.saveAddProduct)
router.get('/admin-product', adminController.getAdminProduct)
router.get('/edit-product/:productId', adminController.getEditProduct)
router.post('/update-product/:productId', adminController.patchUpdatedProduct)
router.post('/delete-product', adminController.deleteProduct)

module.exports = router
