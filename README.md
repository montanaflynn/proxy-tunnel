# proxy-tunnel

Proxy all http and https requests through a tunnel.

### Quick Start

```sh
sudo npm install proxy-tunnel -g
tunnel-proxy
```

```sh
curl localhost:3000/get -H "host:http://httpbin.org"
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
     -h          change target url header name (default: host)
     -q          don't log every request (default: false)
     --help      output help and this usage information
     --version   output the current version of tunnel-proxy

    examples:
     tunnel-proxy -p 8080
     tunnel-proxy -h "baseurl"
     tunnel-proxy -q
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
  header: "baseurl"  // default: "host"
})
```

### Todos

- Add testing framework
- Custom middleware???

### Contributing

Forks and pull requests are most welcomed.

### MIT license

Copyright (c) 2014, Montana Flynn (http://anonfunction.com/)
