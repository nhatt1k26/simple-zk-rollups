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
exports.__esModule = true;
exports.loadMerkleTreeFromDb = exports.saveMerkleTreeToDb = exports.createMerkleTree = exports.MerkleTree = void 0;
var snarkjs_1 = require("snarkjs");
var crypto_1 = require("./crypto");
var helpers_1 = require("./helpers");
var MerkleTree = /** @class */ (function () {
    function MerkleTree(depth, zeroValue, hashFunc) {
        if (hashFunc === void 0) { hashFunc = crypto_1.multiHash; }
        this.depth = depth;
        this.zeroValue = zeroValue;
        this.leaves = [];
        this.leavesRaw = [];
        this.maxLeafIndex = Math.pow(2, depth - 1);
        this.zeros = {
            0: zeroValue
        };
        this.filledSubtrees = {
            0: zeroValue
        };
        this.filledPaths = {
            0: {}
        };
        this.hashFunc = hashFunc;
        for (var i = 1; i < depth; i++) {
            this.zeros[i] = hashFunc([this.zeros[i - 1], this.zeros[i - 1]]);
            this.filledSubtrees[i] = this.zeros[i];
            this.filledPaths[i] = {};
        }
        this.root = hashFunc([
            this.zeros[this.depth - 1],
            this.zeros[this.depth - 1]
        ]);
        this.nextLeafIndex = 0;
    }
    MerkleTree.prototype.equals = function (o) {
        var _this = this;
        var stringify = function (x) { return JSON.stringify((0, helpers_1.stringifyBigInts)(x)); };
        // Compare every element
        var eq = true;
        Object.keys(this).forEach(function (k) {
            eq = eq && stringify(_this[k]) === stringify(o[k]);
        });
        return eq;
    };
    MerkleTree.prototype.hashLeftRight = function (l, r) {
        return this.hashFunc([l, r]);
    };
    MerkleTree.prototype.insert = function (leaf, rawValue) {
        if (rawValue === void 0) { rawValue = {}; }
        var copyA = (0, helpers_1.copyObject)(this);
        if (copyA.nextLeafIndex + 1 >= copyA.maxLeafIndex) {
            throw new Error("Tree at max capacity");
        }
        copyA.insert_(leaf, rawValue);
        return copyA;
    };
    MerkleTree.prototype.update = function (leafIndex, leaf, rawValue) {
        if (rawValue === void 0) { rawValue = {}; }
        var copyA = (0, helpers_1.copyObject)(this);
        if (leafIndex >= copyA.nextLeafIndex) {
            throw new Error("Can't update leafIndex which hasn't been inserted yet!");
        }
        copyA.update_(leafIndex, leaf, rawValue);
        return copyA;
    };
    MerkleTree.prototype.update_ = function (leafIndex, leaf, rawValue) {
        if (rawValue === void 0) { rawValue = {}; }
        var pathElements = this.getUpdatePath(leafIndex).pathElements;
        this.updateWithManualPath_(leafIndex, leaf, rawValue, pathElements);
    };
    // Stateful update
    MerkleTree.prototype.updateWithManualPath_ = function (leafIndex, leaf, rawValue, pathElements) {
        if (leafIndex >= this.nextLeafIndex) {
            throw new Error("Can't update leafIndex which hasn't been inserted yet!");
        }
        var curIdx = leafIndex;
        var currentLevelHash = this.leaves[leafIndex];
        var left;
        var right;
        for (var i = 0; i < this.depth; i++) {
            if (curIdx % 2 === 0) {
                left = currentLevelHash;
                right = pathElements[i];
            }
            else {
                left = pathElements[i];
                right = currentLevelHash;
            }
            currentLevelHash = this.hashLeftRight(left, right);
            curIdx = parseInt((curIdx / 2).toString());
        }
        if (this.root !== currentLevelHash) {
            throw new Error("MerkleTree: tree root / current level has mismatch");
        }
        curIdx = leafIndex;
        currentLevelHash = leaf;
        for (var i = 0; i < this.depth; i++) {
            if (curIdx % 2 === 0) {
                left = currentLevelHash;
                right = pathElements[i];
                this.filledPaths[i][curIdx] = left;
                this.filledPaths[i][curIdx + 1] = right;
            }
            else {
                left = pathElements[i];
                right = currentLevelHash;
                this.filledPaths[i][curIdx - 1] = left;
                this.filledPaths[i][curIdx] = right;
            }
            currentLevelHash = this.hashLeftRight(left, right);
            curIdx = parseInt((curIdx / 2).toString());
        }
        this.root = currentLevelHash;
        this.leaves[leafIndex] = leaf;
        this.leavesRaw[leafIndex] = rawValue;
    };
    // Stateful Insert
    MerkleTree.prototype.insert_ = function (leaf, rawValue) {
        if (rawValue === void 0) { rawValue = {}; }
        if (this.nextLeafIndex + 1 >= this.maxLeafIndex) {
            throw new Error("Merkle Tree at max capacity");
        }
        var curIdx = this.nextLeafIndex;
        this.nextLeafIndex += 1;
        var currentLevelHash = leaf;
        var left;
        var right;
        for (var i = 0; i < this.depth; i++) {
            if (curIdx % 2 === 0) {
                left = currentLevelHash;
                right = this.zeros[i];
                this.filledSubtrees[i] = currentLevelHash;
                this.filledPaths[i][curIdx] = left;
                this.filledPaths[i][curIdx + 1] = right;
            }
            else {
                left = this.filledSubtrees[i];
                right = currentLevelHash;
                this.filledPaths[i][curIdx - 1] = left;
                this.filledPaths[i][curIdx] = right;
            }
            currentLevelHash = this.hashLeftRight(left, right);
            curIdx = parseInt((curIdx / 2).toString());
        }
        this.root = currentLevelHash;
        this.leaves.push(leaf);
        this.leavesRaw.push(rawValue);
    };
    /*  Gets the path needed to construct a the tree root
     *  Used for quick verification on updates.
     *  Runs in O(log(N)), where N is the number of leaves
     */
    MerkleTree.prototype.getUpdatePath = function (leafIndex) {
        if (leafIndex >= this.nextLeafIndex) {
            throw new Error("Path not constructed yet, leafIndex >= nextIndex");
        }
        var curIdx = leafIndex;
        var pathElements = [];
        var pathIndexes = [];
        for (var i = 0; i < this.depth; i++) {
            if (curIdx % 2 === 0) {
                pathElements.push(this.filledPaths[i][curIdx + 1]);
                pathIndexes.push(0);
            }
            else {
                pathElements.push(this.filledPaths[i][curIdx - 1]);
                pathIndexes.push(1);
            }
            curIdx = parseInt((curIdx / 2).toString());
        }
        return {
            pathElements: pathElements,
            pathIndexes: pathIndexes
        };
    };
    MerkleTree.prototype.getLeafRaw = function (leafIndex) {
        try {
            return this.leavesRaw[leafIndex];
        }
        catch (_a) {
            return null;
        }
    };
    return MerkleTree;
}());
exports.MerkleTree = MerkleTree;
var createMerkleTree = function (depth, zeroValue, hashFunc) {
    if (zeroValue === void 0) { zeroValue = (0, snarkjs_1.bigInt)(0); }
    if (hashFunc === void 0) { hashFunc = crypto_1.multiHash; }
    return new MerkleTree(depth, zeroValue, hashFunc);
};
exports.createMerkleTree = createMerkleTree;
var saveMerkleTreeToDb = function (pool, mtName, mt, leafIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var mtQuery, mtTreeRes, mtTreeId, selectedLeafIndex, leafQuery;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mtQuery = {
                    text: "INSERT INTO\n      merkletrees(\n        name,\n        depth,\n        next_index,\n        root,\n        zero_value,\n        zeros,\n        filled_sub_trees,\n        filled_paths\n      ) VALUES (\n        $1, $2, $3, $4, $5, $6, $7, $8\n      ) ON CONFLICT (name) DO UPDATE SET\n        name = excluded.name,\n        depth = excluded.depth,\n        next_index = excluded.next_index,\n        root = excluded.root,\n        zero_value = excluded.zero_value,\n        zeros = excluded.zeros,\n        filled_sub_trees = excluded.filled_sub_trees,\n        filled_paths = excluded.filled_paths\n      ;",
                    values: [
                        mtName,
                        mt.depth,
                        mt.nextLeafIndex,
                        (0, helpers_1.stringifyBigInts)(mt.root),
                        (0, helpers_1.stringifyBigInts)(mt.zeroValue),
                        (0, helpers_1.stringifyBigInts)(mt.zeros),
                        (0, helpers_1.stringifyBigInts)(mt.filledSubtrees),
                        (0, helpers_1.stringifyBigInts)(mt.filledPaths)
                    ]
                };
                // Saves merkle tree state
                return [4 /*yield*/, pool.query(mtQuery)];
            case 1:
                // Saves merkle tree state
                _a.sent();
                return [4 /*yield*/, pool.query({
                        text: "SELECT * FROM merkletrees WHERE name = $1 LIMIT 1;",
                        values: [mtName]
                    })];
            case 2:
                mtTreeRes = _a.sent();
                mtTreeId = mtTreeRes.rows[0].id;
                // Don't save any leaves if tree is empty
                if (leafIndex === undefined && mt.nextLeafIndex === 0) {
                    return [2 /*return*/];
                }
                selectedLeafIndex = leafIndex === undefined ? mt.nextLeafIndex - 1 : leafIndex;
                leafQuery = {
                    text: "INSERT INTO \n          leaves(merkletree_id, index, raw, hash)\n          VALUES($1, $2, $3, $4)\n          ON CONFLICT(merkletree_id, index) DO UPDATE SET\n            merkletree_id = excluded.merkletree_id,\n            index = excluded.index,\n            raw = excluded.raw,\n            hash = excluded.hash\n          ",
                    values: [
                        mtTreeId,
                        selectedLeafIndex,
                        {
                            data: JSON.stringify((0, helpers_1.stringifyBigInts)(mt.leavesRaw[selectedLeafIndex]))
                        },
                        (0, helpers_1.stringifyBigInts)(mt.leaves[selectedLeafIndex])
                    ]
                };
                // Saves latest leaf to merkletree id
                return [4 /*yield*/, pool.query(leafQuery)];
            case 3:
                // Saves latest leaf to merkletree id
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.saveMerkleTreeToDb = saveMerkleTreeToDb;
var loadMerkleTreeFromDb = function (pool, mtName) { return __awaiter(void 0, void 0, void 0, function () {
    var mtQuery, mtResp, mtRes, mtResBigInt, mt, leavesQuery, leavesResp, leaves, leavesRaw;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mtQuery = {
                    text: "SELECT * FROM merkletrees WHERE name = $1 LIMIT 1;",
                    values: [mtName]
                };
                return [4 /*yield*/, pool.query(mtQuery)];
            case 1:
                mtResp = _a.sent();
                if (mtResp.rows.length === 0) {
                    throw new Error("MerkleTree named ".concat(mtName, " not found in database"));
                }
                mtRes = mtResp.rows[0];
                mtResBigInt = (0, helpers_1.unstringifyBigInts)(mtResp.rows[0]);
                mt = (0, exports.createMerkleTree)(mtRes.depth, mtResBigInt.zero_value);
                mt.nextLeafIndex = mtRes.next_index;
                mt.root = mtResBigInt.root;
                mt.zeros = mtResBigInt.zeros;
                mt.filledSubtrees = mtResBigInt.filled_sub_trees;
                mt.filledPaths = mtResBigInt.filled_paths;
                leavesQuery = {
                    text: "SELECT * FROM leaves WHERE merkletree_id = $1 ORDER BY index ASC;",
                    values: [mtRes.id]
                };
                return [4 /*yield*/, pool.query(leavesQuery)];
            case 2:
                leavesResp = _a.sent();
                leaves = leavesResp.rows.map(function (x) { return (0, helpers_1.unstringifyBigInts)(x.hash); });
                leavesRaw = leavesResp.rows.map(function (x) {
                    return (0, helpers_1.unstringifyBigInts)(JSON.parse(x.raw.data));
                });
                mt.leaves = leaves;
                mt.leavesRaw = leavesRaw;
                return [2 /*return*/, mt];
        }
    });
}); };
exports.loadMerkleTreeFromDb = loadMerkleTreeFromDb;
