"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bounce = require("./bounce");

var _bounce2 = _interopRequireDefault(_bounce);

var _Statuses = require("./Statuses");

var _Statuses2 = _interopRequireDefault(_Statuses);

var _Result = require("./Result");

var _Result2 = _interopRequireDefault(_Result);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//const EMPTY_ARRAY_LENGTH = 0;

var Transaction = function () {
  function Transaction(onRun, onCompensate) {
    _classCallCheck(this, Transaction);

    this.onRun = onRun;
    this.onCompensate = onCompensate;
  }

  _createClass(Transaction, [{
    key: "run",
    value: function run() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var context = {};

      return (0, _bounce2.default)(function () {
        return Reflect.apply(_this.onRun, context, args);
      }).then(function (data) {
        return {
          data: data,
          status: _Statuses2.default.SUCCESS
        };
      }, function (data) {
        return {
          data: data,
          status: _Statuses2.default.ERROR
        };
      }).then(function (_ref) {
        var data = _ref.data;
        var status = _ref.status;
        return new _Result2.default(_this, args, context, status, data);
      });
    }
  }], [{
    key: "all",
    value: function all() {
      for (var _len2 = arguments.length, transactions = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        transactions[_key2] = arguments[_key2];
      }

      return new Transaction(function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return Promise.all(transactions.map(function (transaction) {
          return transaction.run(args);
        }));
      }, function (resultSet, upstreamError) {
        return Promise.all(resultSet.map(function (result) {
          return result.compensate(upstreamError);
        }));
      });
    }
  }, {
    key: "fromSaga",
    value: function fromSaga() {
      //TODO
    }
  }]);

  return Transaction;
}();

exports.default = Transaction;