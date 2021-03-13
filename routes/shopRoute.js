const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const shopController = require('../controllers/shopController')

router.get('/', shopController.getIndex)
// router.get('/products', shopController.minimalProducts)
router.get('/cart', shopController.cart)
router.post('/cart', shopController.addProductToCart)
router.get('/product-detail/:id', shopController.productDetail)
router.post('/cart-delete-item', shopController.removeItemFromCart)
// router.get('/checkout', shopController.getCheckout)
router.get('/orders', shopController.getOrders)
router.post('/create-order', shopController.postOrder)


module.exports = router