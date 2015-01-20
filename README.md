# proxy-tunnel

Proxy all http and https requests through a tunnel and optionally sends data to APIanalytics.com.

![Screencast of the proxy](https://i.imgur.com/1IztvqA.gif)

### Quick Start

Using NPM you can install proxy-tunnel globally so it can be ran at anytime anywhere.

```sh
npm install proxy-tunnel -g
tunnel-proxy
```
Once the server is running you can then send it requests to be proxied by adding the target url in the `target` request header. Here's an example using cURL.

```sh
curl 127.0.0.1:3000/get -H "target:http://httpbin.org"
```

### Advanced Usage

#### CLI

```sh
sudo npm install proxy-tunnel -g
```

```
  Usage
    $ tunnel-proxy [options]

    options:
     -p          change proxy port number (default: 3000)
     -h          change target url header name (default: target)
     -q          don't log every request (default: false)
     -t          optional apianalytics.com token
     --help      output help and this usage information
     --version   output the current version of tunnel-proxy

    examples:
     tunnel-proxy -p 8080
     tunnel-proxy -h "baseurl"
     tunnel-proxy -q
     tunnel-proxy -t "54adbfffeba3f94b5182carr"
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
