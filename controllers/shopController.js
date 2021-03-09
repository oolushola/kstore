const mongodb = require('mongodb')
const { Product, Cart } = require('../models/product')
const User = require('../models/user')

const ObjectId = mongodb.ObjectId

const getIndex = (req, res, next) => {
    Product.fetchAll().then(products => { 
        res.render('shop/index', { 
            products: products, 
            pageTitle: 'My Shop!', 
            pathName: '/shop' 
        })
    })
    .catch(err => { 
        console.log(err)
     })

}

const productDetail = (req, res, next) => {
    productId = req.params.id
    Product.findOne(productId)
    .then((productDetails) => {
        res.render('shop/product-detail', { 
            pathName: req.url, 
            pageTitle: productDetails.title, 
            productDetails
        })
    })
    .catch(err => {
        console.log(err)
    })
}

const addProductToCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findOne(prodId).then(product => {
        return req.user.addToCart(product)
    })
    .then(result => {
        console.log(result)
        res.redirect('/cart')
    })
}

const cart = (req, res, next) => {
    req.user.getCart()
        .then(products => {
            // console.log(products)
            res.render('shop/cart', { pathName: req.url, pageTitle: 'Cart',  products })
        })
        .catch(err => {
            console.log(err)
        })

}

const removeItemFromCart = (req, res, next)=> {
    const productId = req.body.productId
    return req.user.deleteCart(productId)
        .then(() => {
            console.log('UPDATED')
            res.redirect('/cart')
        })
        .catch(err => {
            console.log('err')
        })
}

const postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
        .addOrder()
        .then(result => {
            res.redirect('/orders')
        })
        .catch(err => {
            console.log(err)
        })
}

const minimalProducts = (req, res, next) => {
    Products.showProducts().then(([data, fieldData]) => {
        res.render('shop/product-list', { pageTitle: 'Minial Products', pathName: req.url })
    }).catch(err => {
        console.log(err)
    })
}

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout Now!', pathName:req.url})
}

const getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            console.log(orders.length)
            res.render('shop/orders', { 
                pageTitle: 'Checkout Now!', 
                pathName: req.url, 
                orders 
            })
        })
        .catch(err => { 
            console.log(err)
        })
    
}

module.exports = {
    productDetail, 
    cart, 
    getIndex, 
    minimalProducts, 
    getCheckout, 
    getOrders, 
    addProductToCart,
    removeItemFromCart,
    postOrder
}