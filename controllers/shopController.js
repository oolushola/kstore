// const mongodb = require('mongodb')
const Product = require('../models/product')
const User = require('../models/user')
const Order = require('../models/order')
const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const { pipe } = require('pdfkit')

// const ObjectId = mongodb.ObjectId

const getIndex = (req, res, next) => {
    Product.find().then(products => { 
        res.render('shop/index', { 
            products: products, 
            pageTitle: 'My Shop!', 
            pathName: '/shop',
            isAuthenticated: req.session.isLoggedIn,
            csrfToken: req.csrfToken() 
        })
    })
    .catch(err => { 
        console.log(err)
     })

}

const productDetail = (req, res, next) => {
    productId = req.params.id
    Product.findById(productId)
    .then((productDetails) => {
        res.render('shop/product-detail', { 
            pathName: req.url, 
            pageTitle: productDetails.title, 
            productDetails,
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err => {
        console.log(err)
    })
}

const addProductToCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product)
    })
    .then(result => {
        res.redirect('/cart')
    })
}

const cart = (req, res, next) => {
       req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items 
            res.render('shop/cart', { 
                pathName: req.url, 
                pageTitle: 'Cart',  
                products,
                isAuthenticated: req.session.isLoggedIn
            })
        })
        .catch(err => {
            console.log(err)
        })

}

const removeItemFromCart = (req, res, next)=> {
    const productId = req.body.productId
    return req.user.removeFromCart(productId)
        .then(() => {
            console.log('UPDATED')
            res.redirect('/cart')
        })
        .catch(err => {
            console.log('err')
        })
}

const postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => { 
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, productData: { ...i.productId._doc} }
        })
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user._id
            }, 
            products: products
        })
        return order.save()    
    })
    .then(result => {
        return req.user.clearCart()
    })
    .then(() => {
        res.redirect('/orders')
    })
    .catch(err => {
        console.log(err)
    })
        
}

// const minimalProducts = (req, res, next) => {
//     Products.showProducts().then(([data, fieldData]) => {
//         res.render('shop/product-list', { pageTitle: 'Minial Products', pathName: req.url })
//     }).catch(err => {
//         console.log(err)
//     })
// }

// const getCheckout = (req, res, next) => {
//     res.render('shop/checkout', { pageTitle: 'Checkout Now!', pathName:req.url})
// }

const getOrders = (req, res, next) => {
    Order
        .find({ "user.userId": req.user._id })
        .then(orders => {
            console.log(orders)
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

const getInvoices = (req, res, next) => {
    const orderId = req.params.orderId
    const invoiceName = 'invoice-'+orderId+'.pdf'
    const invoicePath = path.join('data', 'invoices', invoiceName)
//     fs.readFile(invoicePath, (err, data) => {
//         if(err) {
//             console.log(err)
//             return false;
//         }
//         res.setHeader('Content-Type', 'application/pdf')
//         res.setHeader('Content-Disposition', 'attachment', 'filename="'+invoiceName+'"')
//         res.send(data)
//     })
// }
    // const file = fs.createReadStream(invoicePath);
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment', 'filename="'+invoiceName+'"')
    
    const pdfDoc = new PDFDocument()
    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res)

    pdfDoc.fontSize(26).text('Invoice', {
        underline: true
    })

    pdfDoc.end()
}

module.exports = {
    productDetail, 
    cart, 
    getIndex, 
//     minimalProducts, 
//     getCheckout, 
    getOrders, 
    addProductToCart,
    removeItemFromCart,
    postOrder,
    getInvoices
}