const express = require('express')
const adminRoute = require('./routes/adminRoute')
const shopRoute = require('./routes/shopRoute')
const userRoute = require('./routes/userRoute')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')

const User = require('./models/user')
const MONGODB_URI = 'mongodb+srv://Olushola:ZrNivMCZhmWx9KXy@cluster0.qev4c.mongodb.net/shop?retryWrites=true&w=majority'

const app = express()
const PORT = 3000
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
const path = require('path')

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({ 
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false, 
    store: store 
}))
app.use((req, res, next) => {
    if(!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => {
            console.log(err)
        })
})
const csrfProtection = csrf({})
app.use(csrfProtection)
app.use(flash())
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use(shopRoute)
app.use('/admin/', adminRoute)
app.use('/user', userRoute)
app.use('*', (req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page not found', pathName: ''})
})

mongoose.connect(MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then((client) => {
    app.listen(PORT, () => {
        console.log(`SERVER RUNNING ON PORT:${PORT}`)
    })
})
.catch(err => {
    console.log(err)
})
