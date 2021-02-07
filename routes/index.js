var express = require('express')
var router = express.Router()
var html2pdf = require('html-pdf-node')
var imageCrawler = require('cover-image-crawler')
var request = require('request').defaults({encoding: null})
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
    var filePath = __dirname.split('routes').join('') + `public/${query.cache ? "cache/" : ""}` + fileName
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

router.get("/download", function (req, res, next) {
  const query = req.query
  const url = query.url
  const urlEncoded = encodeURI(url)
  const fileName =
    urlEncoded.split(":").join("").split("/").join("").split(".").join("") +
    ".jpg"
  const filePath =
    __dirname.split("routes").join("") + `public/images/` + fileName
  try {
    if (fs.existsSync(filePath)) {
      console.log("https://ebt.restaurant/cache/" + fileName)
      return res.download(filePath)
    } else {
      imageCrawler.capture(url, function (err, url) {
        if (!err) {
          request(url, function (err, resp, buffer) {
            if (err) {
              return next(err)
            } else {
              fs.writeFile(filePath, buffer, function (error) {
                if (error) {
                  console.log(error)
                } else {
                  console.log("Write Success !")
                }
              })
              res.setHeader("Content-Type", "image/jpg")
              return res.end(Buffer.from(buffer, "base64"))
            }
          })
        } else {
          return next(err)
        }
      })
    }
  } catch (err) {
    console.error(err)
    imageCrawler.capture(url, function (err, url) {
      if (!err) {
        console.log(err)
        request(url,function (err, resp, buffer)  {
          if (err) {
            return next(err)
          } else {
            fs.writeFile(filePath, buffer, function (error) {
              if (error) {
                console.log(error)
              } else {
                console.log("Write Success !")
              }
            })
            res.setHeader("Content-Type", "image/jpg")
            return res.end(Buffer.from(buffer, "base64"))
          }
        })
      } else {
        return next(err)
      }
    })
  }
})

module.exports = router;
