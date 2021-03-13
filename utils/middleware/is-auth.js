const isAuth = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/admin/login')
    }
    console.log('Signed In')
    next()
}

module.exports = isAuth