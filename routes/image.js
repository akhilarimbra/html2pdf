const express = require("express")
const router = express.Router()
const request = require("request")
const imageCrawler = require("cover-image-crawler")
const fs = require("fs")

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
      
      // return res.redirect('/images/' + fileName)
      return res.download(filePath)
    } else {
      imageCrawler.capture(url, function (err, url) {
        if (!err) {
          request({ uri: url, encoding: null }, (err, resp, buffer) => {
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
        request({ uri: query.url, encoding: null }, (err, resp, buffer) => {
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

module.exports = router
