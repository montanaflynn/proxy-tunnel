# proxy-tunnel

Proxy all http and https requests through a tunnel and optionally sends data to APIanalytics.com.

![Screencast of the proxy](https://i.imgur.com/1IztvqA.gif)

### Usage

```sh
sudo npm install proxy-tunnel -g
```

```
  Usage
    $ tunnel-proxy [options]

    options:
     -p          change proxy port number (default: 3000)
     -s          change max sockets (default: 300)
     -h          change target url header name (default: target)
     -q          stay quiet, don't console log (default: false)
     -v          verbose mode logs har output (default: false)
     -k          apianalytics.com api key (optional)
     -t          apianalytics.com transport layer (optional options: "socket.io", "zeromq" default: "socket.io")
     --help      output usage and help information
     --version   output the current version of tunnel-proxy

    examples:
     tunnel-proxy -h "baseurl"
     tunnel-proxy -q -p 8080
     tunnel-proxy -t "zeromq" -k "54adbfffeba3f94b5182carr"
```

#### Programatic

```sh
npm install proxy-tunnel --save
```

```js
var proxy = require("proxy-tunnel")
proxy({
  port: 8080,        // default: 3000
  quiet: true,       // default: false
  header: "baseurl"  // default: "target"
})
```

### Uses

- Get around CORS
- Log requests / responses
- Block requests / responses
- Transform requests / responses
- Much more I can't think of

### Todos

- Add testing framework
- Add various options
- Custom middleware???

### Contributing

Forks and pull requests are most welcomed.

### MIT license

Copyright (c) 2014, Montana Flynn (http://anonfunction.com/)
