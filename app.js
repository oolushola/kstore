const express = require('express')
const adminRoute = require('./routes/adminRoute')
const shopRoute = require('./routes/shopRoute')
const userRoute = require('./routes/userRoute')
const bodyParser = require('body-parser')
// const sequelize = require('./utils/db')
const  mongoConnect = require('./utils/db').mongoConnect; 
const User = require('./models/user')

const app = express()
const PORT = 3000


const path = require('path')

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))


app.use((req, res, next) => {
    User.getUserById("60464f7a3d8c67e547afbc9c")
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id)
            //console.log(user)
            next()
        })
        .catch(err => {
            console.log(err)
        })

    // User.findByPk(1).then((user)=>{
    //     req.user = user
    //     next();
    // }).catch(err => { console.log(err) })
    // next()
})

app.use(shopRoute)
app.use('/admin/', adminRoute)
app.use('/user', userRoute)
app.use('*', (req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page not found', pathName: ''})
})

//{ force: true }
// sequelize.sync()
// .then((result) => {
//     return User.findByPk(1)
// })
// .then(user => {
//     if(!user) {
//         return User.create({ name: 'Olushola O', password: 'Something', email: 'odejobi@kayaafrica.co' })
//     }
//     return user
// })
// .then(user => {
//     //console.log(user)
//     user.createCart()
// })
// .then(()=> {
//     app.listen(PORT, () => {
//         console.log(`SERVER RUNNING ON PORT: ${PORT}`)
//     })
// })
// .catch(err => {
//     //console.log(err)
// })


mongoConnect(() => {
    app.listen(PORT, ()=> {
        console.log(`SERVER RUNNING ON PORT ${PORT}`)
    })
    
})
