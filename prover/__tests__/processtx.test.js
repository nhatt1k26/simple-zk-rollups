"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var path = require("path");
var compiler = require("circom");
var snarkjs_1 = require("snarkjs");
var helpers_1 = require("../../operator/src/utils/helpers");
var crypto_1 = require("../../operator/src/utils/crypto");
var merkletree_1 = require("../../operator/src/utils/merkletree");
describe("processtx.circom", function () {
    it("ProcessTx(4)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var circuitDef, circuit, userAIndex, userABalance, userANonce, privA, pubA, userBIndex, userBBalance, userBNonce, privB, pubB, sendAmount, feeAmount, balanceTreeAccounts, balanceTree, userAPaths, userBPaths, txPreSign, signature, tx, intermediateUserALeafData, intermediateUserALeaf, intermediateBalanceTree, intermediateBalanceTreePaths, finalUserBLeafData, finalUserBLeaf, finalBalanceTree, circuitInputs, witness, outputIdx, newBalanceTreeRootCircom;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, compiler(path.join(__dirname, "circuits", "processtx_test.circom"))];
                case 1:
                    circuitDef = _a.sent();
                    circuit = new snarkjs_1.Circuit(circuitDef);
                    userAIndex = 0;
                    userABalance = (0, helpers_1.toWei)(50);
                    userANonce = 1;
                    privA = (0, crypto_1.genPrivateKey)();
                    pubA = (0, crypto_1.genPublicKey)(privA);
                    userBIndex = 1;
                    userBBalance = (0, helpers_1.toWei)(0);
                    userBNonce = 0;
                    privB = (0, crypto_1.genPrivateKey)();
                    pubB = (0, crypto_1.genPublicKey)(privB);
                    sendAmount = (0, helpers_1.toWei)(20);
                    feeAmount = (0, helpers_1.toWei)(0.5);
                    balanceTreeAccounts = [0, 0, 0, 0].map(
                    //@ts-ignore
                    function (x, i) {
                        if (i === userAIndex) {
                            return __spreadArray(__spreadArray([], pubA, true), [userABalance, (0, snarkjs_1.bigInt)(userANonce)], false);
                        }
                        else if (i === userBIndex) {
                            return __spreadArray(__spreadArray([], pubB, true), [userBBalance, (0, snarkjs_1.bigInt)(userBNonce)], false);
                        }
                        return __spreadArray(__spreadArray([], (0, crypto_1.genPublicKey)((0, crypto_1.genPrivateKey)()), true), [(0, snarkjs_1.bigInt)(0), (0, snarkjs_1.bigInt)(0)], false);
                    });
                    balanceTree = balanceTreeAccounts.reduce(function (acc, pubKeyAndBalance) {
                        var leaf = (0, crypto_1.multiHash)(pubKeyAndBalance);
                        return acc.insert(leaf);
                    }, (0, merkletree_1.createMerkleTree)(4, (0, snarkjs_1.bigInt)(0)));
                    userAPaths = balanceTree.getUpdatePath(userAIndex);
                    userBPaths = balanceTree.getUpdatePath(userBIndex);
                    txPreSign = {
                        from: userAIndex,
                        to: userBIndex,
                        amount: sendAmount,
                        fee: feeAmount,
                        nonce: userANonce + 1
                    };
                    signature = (0, crypto_1.sign)(privA, (0, helpers_1.formatTx)(txPreSign));
                    tx = Object.assign({}, txPreSign, { signature: signature });
                    intermediateUserALeafData = __spreadArray(__spreadArray([], pubA, true), [
                        userABalance.sub(sendAmount).sub(feeAmount),
                        userANonce + 1
                    ], false);
                    intermediateUserALeaf = (0, crypto_1.multiHash)(intermediateUserALeafData);
                    intermediateBalanceTree = balanceTree.update(userAIndex, intermediateUserALeaf);
                    intermediateBalanceTreePaths = intermediateBalanceTree.getUpdatePath(userBIndex);
                    finalUserBLeafData = __spreadArray(__spreadArray([], pubB, true), [
                        userBBalance.add(sendAmount),
                        userBNonce // Since user B is receiving, we're not bumping the nonce
                    ], false);
                    finalUserBLeaf = (0, crypto_1.multiHash)(finalUserBLeafData);
                    finalBalanceTree = intermediateBalanceTree.update(userBIndex, finalUserBLeaf);
                    circuitInputs = (0, helpers_1.stringifyBigInts)({
                        balanceTreeRoot: balanceTree.root,
                        txData: (0, helpers_1.formatTx)(tx),
                        txSenderPublicKey: pubA,
                        txSenderBalance: userABalance,
                        txSenderNonce: userANonce,
                        txSenderPathElements: userAPaths.pathElements,
                        txRecipientPublicKey: pubB,
                        txRecipientBalance: userBBalance,
                        txRecipientNonce: userBNonce,
                        txRecipientPathElements: userBPaths.pathElements,
                        intermediateBalanceTreeRoot: intermediateBalanceTree.root,
                        intermediateBalanceTreePathElements: intermediateBalanceTreePaths.pathElements
                    });
                    witness = circuit.calculateWitness(circuitInputs);
                    outputIdx = circuit.getSignalIdx("main.newBalanceTreeRoot");
                    newBalanceTreeRootCircom = witness[outputIdx];
                    expect(finalBalanceTree.root.toString()).toEqual(newBalanceTreeRootCircom.toString());
                    return [2 /*return*/];
            }
        });
    }); });
    it("ProcessTx(4), same sender and recipient", function () { return __awaiter(void 0, void 0, void 0, function () {
        var circuitDef, circuit, userAIndex, userABalance, userANonce, privA, pubA, sendAmount, feeAmount, balanceTreeAccounts, balanceTree, userAPaths, txPreSign, signature, tx, intermediateUserALeafData, intermediateUserALeaf, intermediateBalanceTree, intermediateBalanceTreePaths, finalUserALeafData, finalUserALeaf, finalBalanceTree, circuitInputs, witness, outputIdx, newBalanceTreeRootCircom;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, compiler(path.join(__dirname, "circuits", "processtx_test.circom"))];
                case 1:
                    circuitDef = _a.sent();
                    circuit = new snarkjs_1.Circuit(circuitDef);
                    userAIndex = 0;
                    userABalance = (0, helpers_1.toWei)(50);
                    userANonce = 1;
                    privA = (0, crypto_1.genPrivateKey)();
                    pubA = (0, crypto_1.genPublicKey)(privA);
                    sendAmount = (0, helpers_1.toWei)(20);
                    feeAmount = (0, helpers_1.toWei)(0.5);
                    balanceTreeAccounts = [0, 0, 0, 0].map(
                    //@ts-ignore
                    function (x, i) {
                        if (i === userAIndex) {
                            return __spreadArray(__spreadArray([], pubA, true), [userABalance, (0, snarkjs_1.bigInt)(userANonce)], false);
                        }
                        return __spreadArray(__spreadArray([], (0, crypto_1.genPublicKey)((0, crypto_1.genPrivateKey)()), true), [(0, snarkjs_1.bigInt)(0), (0, snarkjs_1.bigInt)(0)], false);
                    });
                    balanceTree = balanceTreeAccounts.reduce(function (acc, pubKeyAndBalance) {
                        var leaf = (0, crypto_1.multiHash)(pubKeyAndBalance);
                        return acc.insert(leaf);
                    }, (0, merkletree_1.createMerkleTree)(4, (0, snarkjs_1.bigInt)(0)));
                    userAPaths = balanceTree.getUpdatePath(userAIndex);
                    txPreSign = {
                        from: userAIndex,
                        to: userAIndex,
                        amount: sendAmount,
                        fee: feeAmount,
                        nonce: userANonce + 1
                    };
                    signature = (0, crypto_1.sign)(privA, (0, helpers_1.formatTx)(txPreSign));
                    tx = Object.assign({}, txPreSign, { signature: signature });
                    intermediateUserALeafData = __spreadArray(__spreadArray([], pubA, true), [
                        userABalance.sub(sendAmount).sub(feeAmount),
                        userANonce + 1
                    ], false);
                    intermediateUserALeaf = (0, crypto_1.multiHash)(intermediateUserALeafData);
                    intermediateBalanceTree = balanceTree.update(userAIndex, intermediateUserALeaf);
                    intermediateBalanceTreePaths = intermediateBalanceTree.getUpdatePath(userAIndex);
                    finalUserALeafData = __spreadArray(__spreadArray([], pubA, true), [
                        userABalance
                            .sub(sendAmount)
                            .add(sendAmount)
                            .sub(feeAmount),
                        userANonce + 1
                    ], false);
                    finalUserALeaf = (0, crypto_1.multiHash)(finalUserALeafData);
                    finalBalanceTree = intermediateBalanceTree.update(userAIndex, finalUserALeaf);
                    circuitInputs = (0, helpers_1.stringifyBigInts)({
                        balanceTreeRoot: balanceTree.root,
                        txData: (0, helpers_1.formatTx)(tx),
                        txSenderPublicKey: pubA,
                        txSenderBalance: userABalance,
                        txSenderNonce: userANonce,
                        txSenderPathElements: userAPaths.pathElements,
                        txRecipientPublicKey: pubA,
                        txRecipientBalance: userABalance,
                        txRecipientNonce: userANonce,
                        txRecipientPathElements: userAPaths.pathElements,
                        intermediateBalanceTreeRoot: intermediateBalanceTree.root,
                        intermediateBalanceTreePathElements: intermediateBalanceTreePaths.pathElements
                    });
                    witness = circuit.calculateWitness(circuitInputs);
                    outputIdx = circuit.getSignalIdx("main.newBalanceTreeRoot");
                    newBalanceTreeRootCircom = witness[outputIdx];
                    expect(finalBalanceTree.root.toString()).toEqual(newBalanceTreeRootCircom.toString());
                    return [2 /*return*/];
            }
        });
    }); });
});
