// const {Sequelize} = require('sequelize')

// const sequelize = new Sequelize('node-complete', 'root', 'Likemike009@@', 
// { 
//     dialect: 'mysql',
//     host: 'localhost',
// })

// module.exports = sequelize

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db;

const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://Olushola:j6VS7VLD7dPijQbf@cluster0.qev4c.mongodb.net/shop?retryWrites=true&w=majority', 
        { useUnifiedTopology: true }
    )
    .then(client => {
        console.log('Connected!')
        _db = client.db()
        callback()
    })
    .catch(err => {
        console.log(err)
        throw err;
    })
}

const getDb = () => {
    if(_db) {
        return _db
    }
    else {
        throw 'No database connection!'
    }
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb
//module.exports =  { mongoConnect, getDb }