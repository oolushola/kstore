const validateProduct = (req, res, next) => {
    if(req.body.productName === '') {
        console.log('Oops! The product name is required.')
        return false
    }
    else{
        next()
    }
}

module.exports = validateProduct