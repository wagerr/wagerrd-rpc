var RpcClient = require('/')
var _ = require('lodash')

var client = new RpcClient({
  user: 'user',
  pass: 'pass',
  port: 55005
})

const eachBatchNewAddressNum = 2500
const perAddressAmount = 0.003
const batchTimes = 1
const fee = (1 * 180 + eachBatchNewAddressNum * 34 + 10) * 0.0000010

function batchGetNewAddress () {
  for (let i = 0; i < eachBatchNewAddressNum; i++) {
    client.getNewAddress()
  }
}

async function splitBalance () {
  const utxos = await client.listunspent().then(r => r.result)
  const validInputs = utxos.filter((utxo) => {
    if (utxo.amount > eachBatchNewAddressNum * perAddressAmount + fee) {
      return true
    } else {
      return false
    }
  })

  if (validInputs.length < batchTimes) {
    throw new Error(`Not enough address have balance larger than : ` + eachBatchNewAddressNum * perAddressAmount
      + `WGR. Need : ` + batchTimes + ` address Now only have: ` + validInputs.length + ` address. Please lower eachBatchNewAddress splitPiece batchTimes`
    )
  }

  var sendManyResultData = []
  for (let i = 0; i < batchTimes; i++) {
    const data = await client.batch(batchGetNewAddress)
    var sendToObject = {}
    for (let i = 0; i < data.length; i++) {
      const {result} = data[i]
      sendToObject[result] = perAddressAmount
    }
    const sendResult = await buildAndSendTransaction(sendToObject, data.length * perAddressAmount)
    sendManyResultData.push(sendResult)
  }
  console.log('Split Finish')
  require('fs').writeFileSync('./addresses_' + new Date().getTime() + '.json', JSON.stringify(sendManyResultData), 'utf-8')
}

async function smallAccountSize () {
  const data = await client.listUnspent()
  console.log('small balance size ' + data.result.length)
}

splitBalance().then(data => {
  smallAccountSize()
}).catch(e => {
  if (typeof e.response !== 'undefined') {
    console.log(e.response)
  } else {
    console.log(e)
  }
})

async function buildAndSendTransaction (outputObject, outputTotal) {
  console.log(outputObject)
  var inputTotal = 0
  const utxos = await client.listunspent().then(r => r.result)
  const inputs = utxos.filter((utxo) => {
    if (inputTotal > 0) {
      return false
    }
    if (utxo.amount > eachBatchNewAddressNum * perAddressAmount + fee) {
      inputTotal += utxo.amount
      return true
    } else {
      return false
    }
  }).map((utxo) => {
    return {'txid': utxo.txid, 'vout': utxo.vout}
  })

  const changeAddress = await client.getnewaddress()
    .then(r => r.result)
  outputObject[changeAddress] = (inputTotal - (outputTotal + fee))

  console.log(inputTotal)
  console.log(outputTotal)
  console.log(fee)
  console.log((inputTotal - (outputTotal + fee)))

  const rawtx = await client.createrawtransaction(inputs, outputObject)
    .then(r => r.result)
  const signedTx = await client.signrawtransaction(rawtx)
    .then(r => r.result)
  return client.sendrawtransaction(signedTx.hex).then(r => r.result)
}