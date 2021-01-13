var express = require('express')
var router = express.Router()
var html2pdf = require('html-pdf-node')
var fs = require('fs')

var writeFileSync = function (path, buffer, permission) {
  permission = permission || 438; // 0666
  var fileDescriptor;

  try {
      fileDescriptor = fs.openSync(path, 'w', permission);
  } catch (e) {
      fs.chmodSync(path, permission);
      fileDescriptor = fs.openSync(path, 'w', permission);
  }

  if (fileDescriptor) {
      fs.writeSync(fileDescriptor, buffer, 0, buffer.length, 0);
      fs.closeSync(fileDescriptor);
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  try {
    var query = req.query
    var url = query.url
    var urlEncoded = encodeURI(url)
    var fileName = urlEncoded.split(':').join('').split('/').join('') + '.pdf'
    var filePath = __dirname.split('routes').join('') + 'public/' + "cache/" + fileName
    let options = { printBackground: true, width: 720 }

    try {
      if (fs.existsSync(filePath)) {
        //file exists

        return res.download(filePath)
      } else {
        html2pdf.generatePdf({ url: urlEncoded }, options).then(pdfBuffer => {
          fs.writeFile(filePath, pdfBuffer, function (error) {
            if (error) {
              console.log(error)
            } else {
              console.log('Write Success !')
            }
          })
    
          return res.end(Buffer.from(pdfBuffer, 'base64'))
        }).catch((error) => {
          return next(error)
        })
      }
    } catch(err) {
      console.error(err)

      html2pdf.generatePdf({ url: urlEncoded }, options).then(pdfBuffer => {
        fs.writeFile(filePath, pdfBuffer, function (error) {
          if (error) {
            console.log(error)
          } else {
            console.log('Write Success !')
          }
        })
  
        return res.end(Buffer.from(pdfBuffer, 'base64'))
      }).catch((error) => {
        return next(error)
      })
    }
  } catch (error) {
    return res.send(error)
  }
});

module.exports = router;
