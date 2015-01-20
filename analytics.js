var io = require("socket.io-client");
var socket = io("ws://socket.apianalytics.com:4000");

module.exports = function (har, token) {

  var wrapper = {
    serviceToken: token,
    har: har
  }

  socket.emit("record", wrapper)

}
