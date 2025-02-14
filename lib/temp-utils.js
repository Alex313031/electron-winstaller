"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTempDir = void 0;
var _pify = _interopRequireDefault(require("pify"));
var _temp = _interopRequireDefault(require("temp"));
_temp["default"].track();
var createTempDir = exports.createTempDir = (0, _pify["default"])(_temp["default"].mkdir);