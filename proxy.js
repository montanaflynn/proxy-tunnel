var url = require('url')
var http = require('http')
var https = require('https')
var meter = require("stream-meter")
var harchive = require("./harchive.js")
var analytics = require("./analytics.js")
var Promise = require('es6-promise').Promise;

module.exports = function(options) {

  var options = options || {}
  options.port = options.port || 3000
  options.header = options.header || 'target'
  options.quiet = options.quiet || false
  options.verbose = options.verbose || false
  options.key = options.key || false
  options.transport = options.transport || "socket.io"

  if (typeof options.port != 'number') {
    throw new Error("Port must be a number")
  }

  if (typeof options.header != 'string') {
    throw new Error("header must be a string")
  }

  if (options.port < 1000 && !process.env.SUDO_UID) {
    throw new Error("Port number needs sudo permission")
  }

  http.createServer(proxy).listen(options.port)
  clog("Proxy tunnel running on port " + options.port)

  function proxy(creq, cres) {

    var tunnel = new Promise(function(resolve, reject) {

      var baseurl
      var hostname
      var protocol 
      var port  
      var requestObject 
      var proxy
      var received
      var receivedTime

      received = process.hrtime() 
      receivedTime = new Date() 

      creq.pause()

      if (!creq.headers[options.header]) {
        cres.writeHeader(400)
        cres.end("No "+options.header+" header")
        return reject(Error("No "+options.header+" header"))
      }

      try {
        var baseurl = url.parse(creq.headers[options.header])
      } catch (e) {
        cres.writeHeader(400)
        cres.end("Could not parse "+options.header+"")
        return reject(e)
      }

      hostname = baseurl.host

      if (!hostname) {
        cres.writeHeader(400)
        cres.end("No hostname")
        reject(Error("No hostname"))
        return
      }

      if (baseurl.port) {
        port = baseurl.port
      } else {
        protocol = baseurl.protocol
        if (protocol === 'https:') {
          port = 443
        } else {
          port = 80
        }
      }

      requestObject = {
        hostname: hostname,
        port: port,
        path: creq.url,
        method: 'GET',
      }

      protocol = (protocol === 'https:' ? https : http)
      proxyReq = protocol.request(requestObject, function (res) {
        var bytes
        var ttfb
        var latency
        var m = meter()

        ttfb = ms(received)
        
        cres.writeHeader(res.statusCode, res.headers)
        res.pipe(m).pipe(cres, {end: true})
        res.on('end', function() {
          bytes = m.bytes
          latency = ms(received)
          if (res.statusCode === 200) {
            statusCol = "\033[32m" + res.statusCode
          } else {
            statusCol = "\033[33m" + res.statusCode
          }
          log = "\033[34m[PROXY ID: " + randomString() + "] "
          log += "\033[0m" + baseurl.protocol + "//"
          log += hostname + creq.url + " "
          log += statusCol + "\033[0m "
          log += bytes + "B "
          log += ttfb + " " + latency

          var har = harchive(creq, cres, receivedTime)
          if (options.key) {
            analytics(har, options.key, options.transport)
          }
          clog(JSON.stringify(har, null, 2), 2)
          resolve(log)

        })
      }).on('error', function(e){
        cres.writeHeader(400)
        cres.end("Error connecting to target server")
        reject(e)
      })

      creq.resume()
      creq.pipe(proxyReq, {end: true})

    })

    tunnel.then(function(result) {
      clog(result)
    }, function(err) {
      clog(err, 3)
      cres.writeHeader(502).end()
    })
  }

  function clog(msg, level) {
    if (level === 3) {
      msg = "\033[31m " + msg     
    }
    if (!options.quiet && level != 2) {
      console.log(msg)
    } else if(options.verbose && level === 2) {
      console.log(msg)
    }
  }
}

function randomString () {
  var a = []
  var l = 10
  var c = 'abcdefghjkmnpqrstuvwxyz23456789'
  while (l--) {
    a.push(c.charAt(Math.floor(Math.random() * c.length)))
  }
  return a.join('')
}

function ms(time) {
  var diff = process.hrtime(time)
  var nano = diff[0] * 1e9 + diff[1]
  return (nano / 1000000).toFixed() + "ms"
}
