wagerrd-rpc.js
==============

[![NPM Package](https://img.shields.io/npm/v/wagerrd-rpc.svg?style=flat-square)](https://www.npmjs.org/package/wagerrd-rpc)
[![Build Status](https://img.shields.io/travis/wagerr/wagerrd-rpc.svg?branch=master&style=flat-square)](https://travis-ci.org/wagerr/wagerrd-rpc)
[![Coverage Status](https://img.shields.io/coveralls/wagerr/wagerrd-rpc.svg?style=flat-square)](https://coveralls.io/r/wagerr/wagerrd-rpc?branch=master)

A client library to connect to Wagerr Core RPC in JavaScript.

## Get Started

wagerrd-rpc.js runs on [node](http://nodejs.org/), and can be installed via [npm](https://npmjs.org/):

```bash
npm install wagerrd-rpc
```

## Examples

```javascript
var run = function() {
  var RpcClient = require('wagerrdd-rpc');

  var config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '18332',
  };

  var rpc = new RpcClient(config);

  var txids = [];

  function showNewTransactions() {
    rpc.getRawMemPool(function (err, ret) {
      if (err) {
        console.error(err);
        return setTimeout(showNewTransactions, 10000);
      }

      function batchCall() {
        ret.result.forEach(function (txid) {
          if (txids.indexOf(txid) === -1) {
            rpc.getRawTransaction(txid);
          }
        });
      }

      rpc.batch(batchCall, function(err, rawtxs) {
        if (err) {
          console.error(err);
          return setTimeout(showNewTransactions, 10000);
        }

        rawtxs.map(function (rawtx) {
          console.log('\n\n\n' + rawtx.result);
        });

        txids = ret.result;
        setTimeout(showNewTransactions, 2500);
      });
    });
  }

  showNewTransactions();
};
```

## License

**Code released under [the MIT license](https://github.com/wagerr/wagerrd-rpc/blob/master/LICENSE).**

Copyright 2018-2019 Wagerr Limited
