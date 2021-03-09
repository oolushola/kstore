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

const getDb = require('../utils/db').getDb
const mongodb = require('mongodb')

class User {
    constructor(username, email, cart, id) {
        this.name = username
        this.email = email
        this.cart = cart // Object { items: []}
        this._id = id
    }

    save() {
        const db = getDb()
        return db.collection('users').insertOne(this)
            .then((response) => {
                console.log('Saved!')
            })
            .catch(err => {
                console.log(err)
            })
    }

    static getUserById(userId) {
        const db = getDb()
        return db.collection('users').find({ _id: new mongodb.ObjectId(userId)  }).next()
            .then(response => {
                return response
            })
            .catch(err => {
                console.log(err)
            })
    }

    addToCart(product) {
        
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
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: 1})
        }
        const updatedCart = { items: updatedCartItems }
        const db = getDb()
        return db.collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this._id)}, 
                { $set: { cart: updatedCart }}
            )
            .then((result) => {
                console.log('PRODUCT ADDED')
            })
            .catch(err => {
                console.log(err)
            })
    }

    getCart() {
        const db = getDb()
        const productIds = this.cart.items.map(i => {
            return i.productId
        })
        
        return db.collection('products')
            .find({_id: {$in:productIds }})
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p, 
                        quantity: this.cart.items.find(i => {
                        return i.productId.toString() === p._id.toString()
                        }).quantity
                    }
                })
            }) 

    }

    deleteCart(productId) {
        const updatedCartItem = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString()
        })
        const db = getDb()
        return db.collection('users')
            .updateOne(
                {_id: this._id }, 
                { $set: { cart: { items: updatedCartItem } } }
            )
            .then(() => {
                console.log('Updated')
            })
            .catch(err => {
                console.loer(err)
            })
    }

    addOrder() {
        const db = getDb()
        return this.getCart()
            .then((products) => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name,
                        email: this.email
                    }
                }
                return db
                .collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { items: []}
                return db
                .collection('users')
                .updateOne(
                    { _id: new mongodb.ObjectId(this._id) }, 
                    { $set: {cart: { items: [] }}}
                )
            })
    }

    getOrders() {
        const db = getDb()
        return db.collection('orders')
            .find({ 'user._id': new mongodb.ObjectId(this._id) })
            .toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => {

            })
    }
    
}

module.exports = User
