// const Sequelize = require('sequelize')
// const sequelize = require('../utils/db')

// const { Db } = require("mongodb")
// const { DatabaseError } = require("sequelize/types")

// const User = require('./user')
// const Cart = require('./cart')
// const CartItem = require('./cart-item')

// const Product = sequelize.define('products', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: Sequelize.STRING,
//     author: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         allowNull: false,
//         type: Sequelize.STRING
//     },
//     imageUrl: {
//         allowNull: false,
//         type: Sequelize.STRING
//     },
//     price: {
//         allowNull: false,
//         type: Sequelize.DOUBLE
//     }
// })

// User.hasMany(Product, { constraints: true, onDelete: 'CASCADE'})
// User.hasOne(Cart, { constraints: true, onDelete: 'CASCADE' })
// Cart.belongsTo(User)
// Cart.belongsToMany(Product, { through: CartItem })
// Product.belongsToMany(Cart, { through: CartItem })

// module.exports = { Product, Cart, User }

const mongodb = require('mongodb')
const getDb = require('../utils/db').getDb

class Product {
    constructor(title, description, imageUrl, price, id, userId) {
        this.title = title
        this.description = description
        this.imageUrl = imageUrl
        this.price = price
        this._id = id
        this.user = userId
    }

    save() {
        const db = getDb()
        let dbOp;
        if(this._id) {
            dbOp = db.collection('products').updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: this} )
        }
        else {
            dbOp = db.collection('products').insertOne(this)
        }
        return dbOp
        .then((response)=> {
            console.log(response)
        })
        .catch(err => {
            console.log(err)
        })
        
    }

    static fetchAll() {
        const db = getDb()
        return db.collection('products').find().toArray()
            .then(products => {
                //console.log(products)
                return products
            })
            .catch(err => {
                console.log(err)
            })
    }

    static findOne(productId) {
        const db = getDb()
        return db.collection('products').find({ _id: new mongodb.ObjectID(productId) }).next()
            .then(product => {
                return product
            })
            .catch(err => {
                console.log(err)
            })
    }

    static deleteById(productId) {
        const db = getDb()
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectID(productId)})
            .then(response => {
                console.log(response)
                return response
            })
            .catch(err => {
                console.log(err)
            })
    }
}

module.exports = {
    Product
}