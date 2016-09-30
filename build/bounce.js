"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bounce;

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bounce(thing) {
  var fail = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  return new _bluebird2.default(function (resolve, reject) {
    return process.nextTick(function () {
      (fail === true ? reject : resolve)(typeof thing === "function" ? thing() : thing);
    });
  });
}