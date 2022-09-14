"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.hashBalanceTreeLeaf = exports.serializeTx = exports.formatTx = exports.randomItem = exports.randomRange = exports.fromWei = exports.toWeiHex = exports.toWei = exports.unstringify = exports.stringify = exports.unstringifyBigInts = exports.stringifyBigInts = exports.copyObject = void 0;
var s = require("snarkjs/src/stringifybigint");
var ethers_1 = require("ethers");
var snarkjs_1 = require("snarkjs");
var crypto_1 = require("./crypto");
var copyObject = function (a) {
    if (Array.isArray(a)) {
        return Array.from(a);
    }
    // Makes a copy of the object instead of writing over it
    return Object.assign(Object.create(Object.getPrototypeOf(a)), (0, exports.unstringifyBigInts)((0, exports.stringifyBigInts)(a)));
};
exports.copyObject = copyObject;
var stringifyBigInts = function (a) {
    return s.stringifyBigInts(a);
};
exports.stringifyBigInts = stringifyBigInts;
var unstringifyBigInts = function (a) {
    return s.unstringifyBigInts(a);
};
exports.unstringifyBigInts = unstringifyBigInts;
var stringify = function (a) {
    return JSON.stringify((0, exports.stringifyBigInts)(a));
};
exports.stringify = stringify;
var unstringify = function (a) {
    return JSON.parse((0, exports.unstringifyBigInts)(a));
};
exports.unstringify = unstringify;
var toWei = function (e) {
    // Convert from eth to wei
    return (0, snarkjs_1.bigInt)(ethers_1.ethers.utils.parseEther(e.toString()));
};
exports.toWei = toWei;
var toWeiHex = function (e) {
    return "0x" + (0, exports.toWei)(e).toString(16);
};
exports.toWeiHex = toWeiHex;
var fromWei = function (w) {
    return parseFloat(ethers_1.ethers.utils.formatEther(w.toString()));
};
exports.fromWei = fromWei;
var randomRange = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomRange = randomRange;
var randomItem = function (a) {
    return a[Math.floor(Math.random() * a.length)];
};
exports.randomItem = randomItem;
var formatTx = function (tx) {
    return [
        tx.from,
        tx.to,
        tx.amount,
        tx.fee,
        tx.nonce,
        tx.signature !== undefined ? tx.signature.R8[0] : null,
        tx.signature !== undefined ? tx.signature.R8[1] : null,
        tx.signature !== undefined ? tx.signature.S : null
    ]
        .filter(function (x) { return x !== null; })
        .map(function (x) { return (0, snarkjs_1.bigInt)(x); });
};
exports.formatTx = formatTx;
var serializeTx = function (tx) {
    var txData = (0, exports.formatTx)(tx);
    return (0, crypto_1.multiHash)(txData);
};
exports.serializeTx = serializeTx;
var hashBalanceTreeLeaf = function (a) {
    return (0, crypto_1.multiHash)(__spreadArray(__spreadArray([], a.publicKey, true), [a.balance, (0, snarkjs_1.bigInt)(a.nonce)], false));
};
exports.hashBalanceTreeLeaf = hashBalanceTreeLeaf;
