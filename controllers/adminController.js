const { Product, Cart } = require('../models/product')
const mongodb = require('mongodb')

const getAddProducts = (req, res, next) => {
    res.render('admin/add-product', { pageTitle: 'Add Product', pathName: req.url, formMode: '' })
}

const saveAddProduct = (req, res, next) => {
    const { productName, productPrice, description, image } = req.body
    const product = new Product(productName, description, image, productPrice, null, req.user._id)
    product.save()
    .then(result => {
        console.log(result)
        res.redirect('/admin/add-product')
    })
    .catch(err => {
        console.log(err)
    })
    // req.user.createProduct({
    //     title: productName,
    //     price: productPrice,
    //     description: description,
    //     imageUrl: 'books.webp',
    //     author: 'Odejobi Olushola D.'
    // }).then((result) => { 
    //     console.log(result)
    // }).catch(err => { console.log(err)})

    //return 'here';
    // Product.create({ 
    //     title: productName,
    //     price: productPrice,
    //     description: description,
    //     imageUrl: 'books.webp',
    //     author: 'Odejobi Olushola D.'
    // }).then((result) => { 
    //     console.log(result)
    // }).catch(err => { console.log(err)})
}

const getEditProduct = (req, res, next) => {
    const formMode = req.query.editMode
    if(formMode !== 'true') {
        return res.redirect('/')
    }
    const productId = req.params.productId
    Product.findOne(productId).then((product) => {
        res.render('admin/add-product', { pageTitle: 'Edit Product', pathName: req.url, formMode, productInfo: product })
    })
    .catch(err => {
        console.error(err)
    })
}

const patchUpdatedProduct = (req, res, next) => {
    const productId = req.params.productId
    const { productName, productPrice, description, image } = req.body
    const product = new Product(productName, description, image, productPrice, new mongodb.ObjectId(productId))
    product.save()
        .then((result) => {
            console.log(result)
            res.redirect('/admin/admin-product')
        })
        .catch(err => {
            console.log(err)
        })
             
    // Product.update(
    //     {
    //         title: productName,
    //         price: productPrice,
    //         description: description,
    //         author: 'O. Olushola',
    //         imageUrl: 'books.webp'   
    //     },
    //     {
    //         where: {
    //             id: productId
    //         }
    //     }
    // )
    // .then((result) => {
    //     res.redirect('/admin/admin-product')
    // })
    // .catch(err => {
    //     console.log(err)
    // })
 }

const getAdminProduct = (req, res, next) => {
    Product.fetchAll().then((result) => {
        res.render('admin/products', 
            { pageTitle: 'Admin Products', pathName: req.url, products:result })
    })
    .catch(err => {
        console.log(err)
    })
}

const deleteProduct = (req, res, next) => {
    productId = req.body.productId
    Product.deleteById(productId)
        .then(result => {
            console.log('PRODUCT DELETED!')
            res.redirect('/admin/admin-product')
        })
        .catch(err => {
            console.log(err)
        })

    // Product.findByPk(productId).then((product) => {
    //     return product.destroy()
    // })
    // .then((result) => {
    //     console.log('PRODUCT DELETED')
    //     res.redirect('/admin/admin-product')
    // })
    // .catch(err => {
    //     console.log(err)
    // })
    
}

module.exports = {
    getAddProducts, 
    saveAddProduct, 
    getAdminProduct, 
    getEditProduct, 
    patchUpdatedProduct,
    deleteProduct
}