const  Product  = require('../models/product')
// const mongodb = require('mongodb')

const getAddProducts = (req, res, next) => {
    res.render('admin/add-product', { 
        pageTitle: 'Add Product', 
        pathName: req.url, 
        formMode: '',
        isAuthenticated: req.session.isLoggedIn 
    })
}

const saveAddProduct = (req, res, next) => {
    const { productName, productPrice, description, image } = req.body
    const product = new Product({ 
        title: productName, 
        description: description, 
        imageUrl: image, 
        price: productPrice,
        userId: req.session.user,
    })
    product.save()
    .then(result => {
        console.log(result)
        res.redirect('/admin/add-product')
    })
    .catch(err => {
        console.log(err)
    })
}

const getEditProduct = (req, res, next) => {
    const formMode = req.query.editMode
    if(formMode !== 'true') {
        return res.redirect('/')
    }
    const productId = req.params.productId
    Product.findById(productId).then((product) => {
        res.render('admin/add-product', { 
            pageTitle: 'Edit Product', 
            pathName: req.url, 
            formMode, 
            productInfo: product 
        })
    })
    .catch(err => {
        console.error(err)
    })
}

const patchUpdatedProduct = (req, res, next) => {
    const productId = req.params.productId
    const { productName, productPrice, description, image } = req.body
    Product.findById(productId)
        .then(product => {
            product.title = productName
            product.description = description
            product.imageUrl = image
            product.price = productPrice
            return product.save()
        })
        .then(result => {
            console.log(result)
            res.redirect('/admin/admin-product')
        })
        .catch(err => {
            console.log(err)
        })
 }

const getAdminProduct = (req, res, next) => {
    Product.find()
    .populate('userId ')
    .then((result) => {
        res.render('admin/products', { 
            pageTitle: 'Admin Products', 
            pathName: req.url, 
            products:result,
            isAuthenticated: req.session.user 
        })
    })
    .catch(err => {
        console.log(err)
    })
}

const deleteProduct = (req, res, next) => {
    productId = req.body.productId
    Product.findByIdAndRemove(productId)
        .then(result => {
            console.log('PRODUCT DELETED!')
            res.redirect('/admin/admin-product')
        })
        .catch(err => {
            console.log(err)
        })
}

module.exports = {
    getAddProducts, 
    saveAddProduct, 
    getAdminProduct, 
    getEditProduct, 
    patchUpdatedProduct,
    deleteProduct
}