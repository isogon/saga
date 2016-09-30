"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bounce = require("./bounce");

var _bounce2 = _interopRequireDefault(_bounce);

var _Transaction = require("./Transaction");

var _Transaction2 = _interopRequireDefault(_Transaction);

var _Statuses = require("./Statuses");

var _Statuses2 = _interopRequireDefault(_Statuses);

var _Outcomes = require("./Outcomes");

var _Outcomes2 = _interopRequireDefault(_Outcomes);

var _Errors = require("./Errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ALREADY_COMPENSATED = "This transaction has already been compensated.";
var CANNOT_COMPENSATE = "This transaction failed and cannot be compensated.";

var Result = function () {
  function Result(transaction, args, context, status, data) {
    _classCallCheck(this, Result);

    this.outcome = _Outcomes2.default.COMPLETED;
    this.transaction = transaction;
    this.args = args;
    this.context = context;
    this.status = status;
    this.data = data;
  }

  _createClass(Result, [{
    key: "compensate",
    value: function compensate(upstreamError) {
      var _this = this;

      if (this.outcome === _Outcomes2.default.COMPENSATED) {
        return (0, _bounce2.default)(new _Errors.TransactionError(ALREADY_COMPENSATED), true);
      }

      if (this.status === _Statuses2.default.ERROR) {
        return (0, _bounce2.default)(new _Errors.TransactionError(CANNOT_COMPENSATE), true);
      }

      var compensateArgs = [this.data, upstreamError].concat(_toConsumableArray(this.args));

      return Reflect.apply(this.transaction.onCompensate, this.context, compensateArgs).then(function () {
        return _this;
      });
    }
  }]);

  return Result;
}();

exports.default = Result;