module.exports = function (har, token, protocol) {

  // Default socket.io connection but also 
  // should support zeromq and http as well
  if (protocol === "socket.io") {
    var io = require("socket.io-client")
    var sock = io("ws://socket.apianalytics.com:80")
  } else if (protocol === "zeromq") {
    var zmq = require('zmq')
    var socket = zmq.socket('push')
    socket.connect('tcp://socket.apianalytics.com:5000')  
  }

  // Make sure we have a legitish key
  if (typeof token != 'string') {
    throw new Error("Token must be a string")
  }

  // Add the wrapper 
  var wrapper = {
    serviceToken: token,
    har: har
  }

  // Send to APIanalytics
  if (protocol.socketIO) {
    sock.emit("record", wrapper)
  } else if (protocol.zeromq) {
    socket.send(JSON.stringify(wrapper))
  }

}
