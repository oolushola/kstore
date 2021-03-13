// const Sequelize = require('sequelize')
// const sequelize = require('../utils/db')

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         unsigned: true,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     email: {
//         type: Sequelize.STRING,
//         unique: true,
//         allowNull: false
//     },
//     password: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// })

// module.exports = User

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: mongoose.Types.ObjectId, required: true, ref: 'Product' },
            quantity: { type: Number, required: true }
        }]
    }
})

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cartProduct => {
        return cartProduct.productId.toString() === product._id.toString()
    })
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]
    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = newQuantity
    }
    else {
        updatedCartItems.push({productId: product._id, quantity: 1})
    }
    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItem = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    })
    this.cart.items = updatedCartItem
    return this.save()
}

userSchema.methods.clearCart = function() {
    this.cart = { items: []}
    return this.save()
} 

module.exports = mongoose.model('User', userSchema)

// const getDb = require('../utils/db').getDb
// const mongodb = require('mongodb')

// class User {

//     addOrder() {
//         const db = getDb()
//         return this.getCart()
//             .then((products) => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id),
//                         name: this.name,
//                         email: this.email
//                     }
//                 }
//                 return db
//                 .collection('orders').insertOne(order)
//             })
//             .then(result => {
//                 this.cart = { items: []}
//                 return db
//                 .collection('users')
//                 .updateOne(
//                     { _id: new mongodb.ObjectId(this._id) }, 
//                     { $set: {cart: { items: [] }}}
//                 )
//             })
//     }

//     getOrders() {
//         const db = getDb()
//         return db.collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray()
//             .then(products => {
//                 console.log(products)
//                 return products
//             })
//             .catch(err => {

//             })
//     }
    
// }

// module.exports = User
