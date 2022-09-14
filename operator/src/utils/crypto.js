"use strict";
exports.__esModule = true;
exports.verify = exports.sign = exports.ecdhDecrypt = exports.ecdhEncrypt = exports.decrypt = exports.encrypt = exports.ecdh = exports.genPublicKey = exports.formatPrivKeyForBabyJub = exports.genPrivateKey = exports.hashLeftRight = exports.hash = exports.multiHash = exports.SNARK_FIELD_SIZE = void 0;
var assert = require("assert");
var crypto = require("crypto");
var circomlib_1 = require("circomlib");
var snarkjs_1 = require("snarkjs");
exports.SNARK_FIELD_SIZE = (0, snarkjs_1.bigInt)("21888242871839275222246405745257275088548364400416034343698204186575808495617");
var bigInt2Buffer = function (i) {
    return Buffer.from(i.toString(16));
};
var buffer2BigInt = function (b) {
    return (0, snarkjs_1.bigInt)("0x" + b.toString("hex"));
};
var multiHash = function (d) {
    return circomlib_1.mimcsponge.multiHash(d);
};
exports.multiHash = multiHash;
var hash = function (d) {
    return (0, exports.multiHash)([d]);
};
exports.hash = hash;
var hashLeftRight = function (l, r) {
    return (0, exports.multiHash)([l, r]);
};
exports.hashLeftRight = hashLeftRight;
var genPrivateKey = function () {
    // Check whether we are using the correct value for SNARK_FIELD_SIZE
    assert(exports.SNARK_FIELD_SIZE.eq(snarkjs_1.bn128.r));
    // Prevent modulo bias
    var twoTwoFiftySix = (0, snarkjs_1.bigInt)(2).pow((0, snarkjs_1.bigInt)(256));
    var min = twoTwoFiftySix.sub(exports.SNARK_FIELD_SIZE).mod(exports.SNARK_FIELD_SIZE);
    var rand = (0, snarkjs_1.bigInt)("0x" + crypto.randomBytes(32).toString("hex"));
    while (rand >= min) {
        rand = (0, snarkjs_1.bigInt)("0x" + crypto.randomBytes(32).toString("hex"));
    }
    var privKey = rand.mod(exports.SNARK_FIELD_SIZE);
    assert(privKey < exports.SNARK_FIELD_SIZE);
    return privKey;
};
exports.genPrivateKey = genPrivateKey;
var formatPrivKeyForBabyJub = function (privKey) {
    /*
     * Formats a random private key to be compatible with the BabyJub curve.
     * This function needs to be called before passing into the snark circuit
     */
    // https://tools.ietf.org/html/rfc8032
    // Because of the "buff[0] & 0xF8" part which makes sure you have a point
    // with order that 8 divides (^ pruneBuffer)
    // Every point in babyjubjub is of the form: aP + bH, where H has order 8
    // and P has a big large prime order
    // Guaranteeing that any low order points in babyjubjub get deleted
    var sBuff = circomlib_1.eddsa.pruneBuffer(bigInt2Buffer((0, exports.hash)(privKey)).slice(0, 32));
    // shr = Shift right
    return snarkjs_1.bigInt.leBuff2int(sBuff).shr(3);
};
exports.formatPrivKeyForBabyJub = formatPrivKeyForBabyJub;
var genPublicKey = function (privKey) {
    assert(privKey < exports.SNARK_FIELD_SIZE);
    return circomlib_1.babyJub
        .mulPointEscalar(circomlib_1.babyJub.Base8, (0, exports.formatPrivKeyForBabyJub)(privKey))
        .map(function (x) { return x.mod(exports.SNARK_FIELD_SIZE); });
};
exports.genPublicKey = genPublicKey;
var ecdh = function (priv, pub) {
    // Performs a diffie-hellman to get shared keys
    var s = (0, exports.formatPrivKeyForBabyJub)(priv);
    var k = circomlib_1.babyJub.mulPointEscalar(pub, s);
    return k[0];
};
exports.ecdh = ecdh;
var encrypt = function (msg, priv) {
    // Initialization vector
    var iv = circomlib_1.mimc7.multiHash(msg, (0, snarkjs_1.bigInt)(0));
    return {
        iv: iv,
        msg: msg.map(function (e, i) {
            return e + circomlib_1.mimc7.hash(priv, iv + (0, snarkjs_1.bigInt)(i));
        })
    };
};
exports.encrypt = encrypt;
var decrypt = function (encMsg, priv) {
    var iv = encMsg.iv, msg = encMsg.msg;
    return msg.map(function (e, i) {
        return e.sub(circomlib_1.mimc7.hash(priv, iv + (0, snarkjs_1.bigInt)(i)));
    });
};
exports.decrypt = decrypt;
var ecdhEncrypt = function (msg, priv, pub) {
    var sharedKey = (0, exports.ecdh)(priv, pub);
    return (0, exports.encrypt)(msg, sharedKey);
};
exports.ecdhEncrypt = ecdhEncrypt;
var ecdhDecrypt = function (encMsg, priv, pub) {
    var sharedKey = (0, exports.ecdh)(priv, pub);
    return (0, exports.decrypt)(encMsg, sharedKey);
};
exports.ecdhDecrypt = ecdhDecrypt;
var sign = function (prv, msg) {
    var msgHash = (0, exports.multiHash)(msg);
    // Signs a message
    var h1 = bigInt2Buffer((0, exports.hash)(prv));
    var sBuff = circomlib_1.eddsa.pruneBuffer(h1.slice(0, 32));
    var s = snarkjs_1.bigInt.leBuff2int(sBuff);
    var A = circomlib_1.babyJub.mulPointEscalar(circomlib_1.babyJub.Base8, s.shr(3));
    var msgBuff = snarkjs_1.bigInt.leInt2Buff(msgHash, 32);
    var rBuff = bigInt2Buffer((0, exports.hash)(buffer2BigInt(Buffer.concat([h1.slice(32, 64), msgBuff]))));
    var r = snarkjs_1.bigInt.leBuff2int(rBuff);
    r = r.mod(circomlib_1.babyJub.subOrder);
    var R8 = circomlib_1.babyJub.mulPointEscalar(circomlib_1.babyJub.Base8, r);
    var hm = (0, exports.multiHash)([R8[0], R8[1], A[0], A[1], msgHash]);
    var S = r.add(hm.mul(s)).mod(circomlib_1.babyJub.subOrder);
    return {
        R8: R8,
        S: S
    };
};
exports.sign = sign;
var verify = function (msg, sig, pubKey) {
    var msgHash = (0, exports.multiHash)(msg);
    return circomlib_1.eddsa.verifyMiMCSponge(msgHash, sig, pubKey);
};
exports.verify = verify;
