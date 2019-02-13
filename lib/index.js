'use strict'

const axios = require('axios')

function RpcClient (opts) {
  opts = opts || {}
  this.host = opts.host || '127.0.0.1'
  this.port = opts.port || 55003
  this.user = opts.user || 'user'
  this.pass = opts.pass || 'pass'
  this.batchedCalls = null

  if (RpcClient.config.log) {
    this.log = RpcClient.config.log
  } else {
    this.log = RpcClient.loggers[RpcClient.config.logger || 'normal']
  }

}

var cl = console.log.bind(console)

var noop = function () {}

RpcClient.loggers = {
  none: {info: noop, warn: noop, err: noop, debug: noop},
  normal: {info: cl, warn: cl, err: cl, debug: noop},
  debug: {info: cl, warn: cl, err: cl, debug: cl}
}

RpcClient.config = {
  logger: 'normal' // none, normal, debug
}

async function rpc (request) {

  var self = this

  const requestConfig = {}

  requestConfig.auth = {
    username: self.user,
    password: self.pass
  }

  return axios.post(`http://${self.host}:${self.port}`, request, requestConfig)
    .then(response => {
      return response.data
    })
    .catch(err => {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        self.log.err(err.message);
        if (err.response.status === 401) {
          throw new Error(`Wagerr JSON-RPC: Connection Rejected: 401 Unnauthorized`)
        }
        if (err.response.status === 403) {
          throw new Error(`Wagerr JSON-RPC: Connection Rejected: 403 Forbidden`)
        }
        let error = new Error(`Wagerr JSON-RPC: ${request.method} fail: ${err.response.data.error.code} ${err.response.data.error.message}`)
        error.code = err.response.data.error.code
        throw error
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        self.log.err(err.message);
        throw err
      } else {
        // Something happened in setting up the request that triggered an Error
        self.log.err('Error', err.message);
        throw err
      }
    })
}

RpcClient.prototype.batch = async function (batchCallback) {
  this.batchedCalls = []
  batchCallback()
  var data = await rpc.call(this, this.batchedCalls)
  this.batchedCalls = null
  return data
}

RpcClient.callspec = {
// == Betting ==
  listEvents: 'str',
  placeBet: 'int int int',
  listBets: 'str int int bool',
  getChainGamesInfo: 'int',
  listChainGamesEvents: '',
  listChainGamesBets: '',
  placeChainGamesBet: 'int int',

// == Control ==
  getInfo: '',
  help: 'str',
  stop: '',

// == P2P Networking ==
  addNode: 'str str',
  clearBanned: '',
  disconnectNode: 'str',
  getNetworkInfo: '',
  getAddedNodeInfo: 'bool str',
  getConnectionCount: '',
  getNetTotals: '',
  getPeerInfo: '',
  listBanned: '',
  ping: '',
  setBan: 'str str int bool',

// == Blockchain ==
  findSerial: 'str',
  getBlockchainInfo: '',
  getBestBlockHash: '',
  getBlockCount: '',
  getBlock: 'str bool',
  getBlockHash: 'int',
  getBlockHeader: 'str bool',
  getChainTips: '',
  getDifficulty: '',
  getFeeInfo: 'int',
  getInvalid: 'str',
  getMemPoolInfo: '',
  getRawMemPool: 'bool',
  getTxOut: 'str int bool',
  getTxOutSetInfo: '',
  invalidateBlock: 'str',
  reconsiderBlock: 'str',
  verifyChain: 'int',

// == Mining ==
  getBlockTemplate: 'obj',
  getMiningInfo: '',
  getNetworkHashPS: 'int int',
  prioritiseTransaction: 'str float int',
  reserveBalance: 'bool float',
  submitBlock: 'str obj',

// == Coin Generating ==
  getGenerate: '',
  getHashesPerSec: '',
  setGenerate: 'bool int',

// == Rawtransactions ==
  createRawTransaction: 'obj obj',
  decodeRawTransaction: 'str',
  decodeScript: 'str',
  getRawTransaction: 'str int',
  sendRawTransaction: 'str bool bool',
  signRawTransaction: 'str obj obj str',

// == Util ==
  createMultiSig: 'int obj',
  estimateFee: 'int',
  estimatePriority: 'int',
  validateAddress: 'str',
  verifyMessage: 'str str str',

// == Wagerr ==
  checkBudgets: '',
  createMasternodeKey: '',
  getBudgetInfo: 'str',
  getBudgetProjection: '',
  getBudgetVotes: 'str',
  getMasternodeCount: '',
  getMasternodeOutputs: '',
  getMasternodeScores: 'int',
  getMasternodeStatus: '',
  getMasternodeWinners: 'int str',
  getNextSuperBlock: 'int',
  getPoolInfo: '',
  listMasternodeConf: 'str',
  listMasternodes: 'str',
  masterNode: 'str str',
  masterNodeConnect: 'str',
  masterNodeCurrent: '',
  masterNodeDebug: '',
  mnBudget: 'str str str str int str',
  mnBudgetRawVote: '',
  mnBudgetVote: 'str str str str',
  mnFinalBudget: 'str str',
  mnSync: 'str',
  //   obfuscation: 'str float', Obfuscation is not supported any more. User Zerocoin
  prepareBudget: 'str str int int str int',
  spork: 'str str',
  startMasternode: 'str str str', // second param is boolean, but rpc use boolean str like 'true'
  submitBudget: 'str str int int str int str',

// == Wallet ==
  addMultiSigAddress: 'int str str',
  autoCombineRewards: 'bool float',
  backupWallet: 'str',
  bip38decrypt: 'str str',
  bip38encrypt: 'str str',
  dumpPrivKey: 'str',
  dumpWallet: 'str',
  encryptWallet: 'str',
  getAccount: 'str',
  getAccountAddress: 'str',
  getAddressesByAccount: 'str',
  getBalance: 'str int bool',
  getExtendedBalance: '',
  getNewAddress: 'str',
  getRawChangeAddress: 'str',
  getReceivedByAccount: 'str int',
  getReceivedByAddress: 'str int',
  getStakeSplitThreshold: 'int',
  getStakingStatus: '',
  getTransaction: 'str bool',
  getUnconfirmedBalance: '',
  getWalletInfo: '',
  importAddress: 'str str bool',
  importPrivKey: 'str str bool',
  importWallet: 'str',
  keyPoolRefill: 'int',
  listAccounts: 'int bool',
  listAddressGroupings: '',
  listLockUnspent: '',
  listReceivedByAccount: 'int bool bool',
  listReceivedByAddress: 'int bool bool',
  listSinceBlock: 'str int bool',
  listTransactions: 'str int int bool',
  listTransactionRecords: 'str int int bool',
  listUnspent: 'int int obj',
  lockUnspent: 'bool obj',
  move: 'str str float int str',
  multiSend: 'str',
  sendFrom: 'str str float int str str',
  sendMany: 'str obj int str',
  sendToAddress: 'str float str str',
  sendToAddressIX: 'str float str str',
  setAccount: 'str str',
  setStakeSplitThreshold: 'int',
  setTxFee: 'float',
  signMessage: '',
  walletLock: '',
  walletPassphraseChange: 'str str',
  walletPassphrase: 'str int bool',

// == Zerocoin ==
  exportZerocoins: 'bool int',
  getArchivedZerocoin: '',
  getZerocoinBalance: '',
  importZerocoins: 'str',
  importData: 'str',
  listMintedzerocoins: '',
  listSpentZerocoins: '',
  listZerocoinAmounts: '',
  mintZerocoin: 'float',
  reconsiderZerocoins: '',
  resetMintZerocoin: 'bool',
  resetSpentZerocoin: '',
  spendZerocoin: 'float bool bool int str',
}

var slice = function (arr, start, end) {
  return Array.prototype.slice.call(arr, start, end)
}

function generateRPCMethods (constructor, apiCalls, rpc) {

  function createRPCMethod (methodName, argMap) {
    return async function () {

      var limit = arguments.length

      for (var i = 0; i < limit; i++) {
        if (argMap[i]) {
          arguments[i] = argMap[i](arguments[i])
        }
      }

      if (this.batchedCalls) {
        this.batchedCalls.push({
          jsonrpc: '2.0',
          method: methodName,
          params: slice(arguments),
          id: getRandomId()
        })
      } else {
        var call = rpc.call(this, {
          method: methodName,
          params: slice(arguments),
          id: getRandomId()
        })
        return await call
      }
    }
  }

  var types = {
    str: function (arg) {
      return arg.toString()
    },
    int: function (arg) {
      return parseFloat(arg)
    },
    float: function (arg) {
      return parseFloat(arg)
    },
    bool: function (arg) {
      return (arg === true || arg == '1' || arg == 'true' || arg.toString().toLowerCase() == 'true')
    },
    obj: function (arg) {
      if (typeof arg === 'string') {
        return JSON.parse(arg)
      }
      return arg
    }
  }

  for (var k in apiCalls) {
    var spec = apiCalls[k].split(' ')
    for (var i = 0; i < spec.length; i++) {
      if (types[spec[i]]) {
        spec[i] = types[spec[i]]
      } else {
        spec[i] = types.str
      }
    }
    var methodName = k.toLowerCase()
    constructor.prototype[k] = createRPCMethod(methodName, spec)
    constructor.prototype[methodName] = constructor.prototype[k]
  }

}

function getRandomId () {
  return parseInt(Math.random() * 100000)
}

generateRPCMethods(RpcClient, RpcClient.callspec, rpc)

module.exports = RpcClient
