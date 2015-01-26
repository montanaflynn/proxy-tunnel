var url = require('url')
var http = require('http')
var https = require('https')
var meter = require("stream-meter")
var harchive = require("./harchive.js")

module.exports = function(options) {

  var options = options || {}
  options.port = options.port || 3000
  options.sockets = options.sockets || 300
  options.header = options.header || 'target'
  options.quiet = options.quiet || false
  options.verbose = options.verbose || false
  options.key = options.key || false
  options.transport = options.transport || "socket.io"

  if (typeof options.port != 'number') {
    throw new Error("Port must be a number")
  }

  if (typeof options.sockets != 'number') {
    throw new Error("Sockets must be a number")
  }

  if (typeof options.header != 'string') {
    throw new Error("header must be a string")
  }

  if (options.port < 1000 && !process.env.SUDO_UID) {
    throw new Error("Port number needs sudo permission")
  }

  http.globalAgent.maxSockets = options.sockets
  https.globalAgent.maxSockets = options.sockets

  http.createServer(proxy).listen(options.port)
  clog("Proxy tunnel running on port " + options.port)

  // Default socket.io connection but also 
  // should support zeromq and http as well
  if (options.transport === "socket.io") {
    var io = require("socket.io-client")
    var socket = io("ws://server.apianalytics.com:80")
    clog("Connected apianalytics with socket.io")
  } else if (options.transport === "zeromq") {
    var zmq = require('zmq')
    var socket = zmq.socket('push')
    socket.connect('tcp://server.apianalytics.com:5000')  
    clog("Connected apianalytics with zeromq")
  }

  function proxy(preq, pres) {

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

    preq.pause()

    if (!preq.headers[options.header]) {
      pres.writeHeader(400)
      pres.end("No "+options.header+" header")
      return reject(Error("No "+options.header+" header"))
    }

    try {
      var baseurl = url.parse(preq.headers[options.header])
    } catch (e) {
      pres.writeHeader(400)
      pres.end("Could not parse "+options.header+"")
      return reject(e)
    }

    hostname = baseurl.host

    if (!hostname) {
      pres.writeHeader(400)
      pres.end("No hostname")
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
      path: preq.url,
      method: 'GET',
    }

    protocol = (protocol === 'https:' ? https : http)
    proxyReq = protocol.request(requestObject, function (res) {
      var bytes
      var ttfb
      var latency
      var m = meter()

      ttfb = ms(received)
      
      pres.writeHeader(res.statusCode, res.headers)
      res.pipe(m).pipe(pres, {end: true})
      res.on('end', function() {
        bytes = m.bytes
        latency = ms(received)
        if (res.statusCode === 200) {
          statusCol = "\033[32m" + res.statusCode
        } else {
          statusCol = "\033[33m" + res.statusCode
        }
        log = "\033[34m[PROXY] "
        log += "\033[0m" + baseurl.protocol + "//"
        log += hostname + preq.url + " "
        log += statusCol + "\033[0m "
        log += bytes + "B "
        log += ttfb + " " + latency

        if (options.key) {

          // Create HAR object
          var har = harchive(preq, pres, receivedTime)

          // Make sure we have a legitish key
          if (typeof options.key != 'string') {
            throw new Error("Token must be a string")
          }

          // Add the wrapper 
          var wrapper = {
            serviceToken: options.key,
            har: {
              log: har 
            }
          }

          // Send to APIanalytics
          if (options.transport === "socket.io") {
            socket.emit("record", wrapper)
          } else if (options.transport === "zeromq") {
            socket.send(JSON.stringify(wrapper))
          }

        }

        clog(JSON.stringify(har, null, 2), 2)

        pres.end()
        clog(log)

      })
    }).on('error', function(e){
      pres.writeHeader(502)
      pres.end("Error connecting to target server")
      clog(e, 3)
    })

    preq.resume()
    preq.pipe(proxyReq, {end: true})

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

function ms(time) {
  var diff = process.hrtime(time)
  var nano = diff[0] * 1e9 + diff[1]
  return (nano / 1000000).toFixed() + "ms"
}
