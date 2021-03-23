const User = require('../models/user')
const { validationResult } = require('express-validator')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: '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'
        }
    })
)

class Auth {
    static getLogin(req, res) {
        res.render('admin/login', { 
            pageTitle: 'Login', 
            pathName: '/admin/login',
            isAuthenticated: req.session.isLoggedIn,
            csrfToken: req.csrfToken(),
            errorMessage: req.flash('error'),
            oldInput: {
                email: ''
            },
            validationErrors: []
        })
    }

    static postLogin(req, res) {
        const { email, password } = req.body
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.render('admin/login', {
                pageTitle: 'Login', 
                pathName: '/admin/login',
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email
                },
                validationErrors: errors.array()
            })
        }
        User.findOne({ email: email })
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid email or password')
                return res.redirect('/admin/login')
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if(doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    res.redirect('/admin/login')
                })
                .catch(err => {
                    console.log(err)
                    return res.redirect('/admin/login')
                })
        })
    }

    static getSignup(req, res) {
        res.render('auth/signup', { 
            pageTitle: 'Sign Up', 
            pathName: '/admin/register', 
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: req.flash('error'),
            oldInput: {
                fullName: '', 
                email: '', 
                password: '', 
                confirmPassword: ''
            }
        })
    }

    static postSignUp(req, res) {
        const { fullName, email, password, confirmPassword } = req.body
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors.array())
            return res.status(422).render('auth/signup', { 
                pageTitle: 'Sign Up', 
                pathName: '/admin/register', 
                isAuthenticated: req.session.isLoggedIn,
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    fullName, email, password, confirmPassword
                }
            })
        }
        User.findOne({ email: email})
        .then(user => {
            if(user) {
                req.flash('error', 'User already exists')
                return res.redirect('/admin/register')
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: fullName, 
                        email: email, 
                        password: hashedPassword,
                        cart: { items: []}
                    })
                    return newUser.save()
                })
                .then(response => {
                    res.redirect('/admin/login')
                    return transporter.sendMail({
                        to: email,
                        from: 'odejobi.olushola@kayaafrica.co',
                        subject: 'Sign up completed',
                        html: '<h1>You successfuly signed up!</h1>'
                    })
                    .catch(err => {
                        console.log(err)
                    })
                    
                })
                .catch(err => {
                    console.log(err)
                    throw err;
                })
        })
    }

    static postLogout(req, res) {
        req.session.destroy(err => {
            console.log(err)
            res.redirect('/')
        })
    }

    static getPasswordReset(req, res) {
        res.render('auth/reset', {
            pageTitle: 'Reset Password',
            pathName: req.url,
            errorMessage: req.flash('error')
        })
    }

    static postPasswordReset(req, res) {
        crypto.randomBytes(64, (err, buffer) => {
            if(err) {
                req.flash('error', 'something went wrong')
                console.log(error)
                return res.redirect('/admin/password-reset')
            }
            const token = buffer.toString('hex')
            User.findOne({ email: req.body.email })
                .then(user => {
                    if(!user) {
                        req.flash('error', 'No user found')
                        return res.redirect('/admin/password-reset')
                    }
                    user.resetTokenExpiration = Date.now() + 3600000
                    user.resetToken = token
                    return user.save()
                })
                .then(userResult => {
                    console.log(userResult)
                    req.flash('error', 'email verification sent!')
                    res.redirect('/admin/password-reset')
                    return transporter.sendMail({
                        from: 'odejobi.olushola@kayaafrica.co',
                        to: req.body.email,
                        subject: 'Password Reset',
                        html: `
                            <h3>Hi ${userResult.name}</h3>
                            <p>You just requested for a password reset</p>
                            <p>Click this <a href="http://localhost:3000/admin/reset/my-password/${token}">Link</a> to reset your password</p>
                        `
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
    
    }

    static getPasswordResetToken(req, res) {
        const token = req.params.token;
        User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now()}})
            .then(user => {
                if(!user) {
                    req.flash('error', 'We cant verify the validity of your password reset')
                    return res.redirect('/admin/password-reset')
                }
                res.render('auth/password-reset', {
                    pageTitle: 'Reset my password',
                    pathName: req.url,
                    errorMessage: '',
                    userId: user._id.toString(),
                    passwordToken: user.resetToken
                })
            })
            .catch(err => {
                console.log(err)
            })
    }

    static postPasswordResetToken(req, res) {
        const { userId, newPassword, passwordToken } = req.body
        let userResult;
        User.findOne({
            _id: userId,
            resetToken: passwordToken,
            resetTokenExpiration: {
                $gt: Date.now()
            }
        })
        .then(userInfo => {
        userResult = userInfo
        return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            userResult.password = hashedPassword
            userResult.resetToken = undefined
            userResult.resetTokenExpiration = undefined
            return userResult.save()
        })
        .then(result => {
            console.log(result)
            res.redirect('/admin/login')
        })
        .catch(err => {
            console.log(err)
        })
    }
    
}

module.exports = Auth

