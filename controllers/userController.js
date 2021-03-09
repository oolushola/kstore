const User = require('../models/user')
const mongodb = require('mongodb')

class userController {
    static addNewUser(req, res, next) {
        const { name, email } = req.body
        const user = new User(name, email)
        user.save()
        .then((result) => {
            res.status(201).json({
                data: 'Successful'
            })
        })
        .catch(err => {
            console.log(err)
        })
    }

    static getUser(req, res, next) {
        const userId = req.params.userId
        User.getUserById(userId)
            .then((response) => {
                res.status(200).json({
                    data: response
                })
            })
    }
}

module.exports = userController
