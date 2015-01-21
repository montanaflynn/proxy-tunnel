module.exports = function (har, token, socket, options) {

  // Make sure we have a legitish key
  if (typeof token != 'string') {
    throw new Error("Token must be a string")
  }

  // Add the wrapper 
  var wrapper = {
    serviceToken: token,
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
