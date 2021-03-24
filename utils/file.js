const fs = require('fs')

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err, data) => {
        if(err) {
            throw (err)
        }
    })
}

module.exports = deleteFile