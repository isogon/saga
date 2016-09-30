"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bounce = require("./bounce");

var _bounce2 = _interopRequireDefault(_bounce);

var _Errors = require("./Errors");

var _Statuses = require("./Statuses");

var _Statuses2 = _interopRequireDefault(_Statuses);

var _Outcomes = require("./Outcomes");

var _Outcomes2 = _interopRequireDefault(_Outcomes);

var _Transaction = require("./Transaction");

var _Transaction2 = _interopRequireDefault(_Transaction);

var _Result = require("./Result");

var _Result2 = _interopRequireDefault(_Result);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EMPTY_ARRAY_LENGTH = 0;
var STARTING_ARRAY_INDEX = 0;

var Saga = function () {
  function Saga() {
    _classCallCheck(this, Saga);

    for (var _len = arguments.length, transactions = Array(_len), _key = 0; _key < _len; _key++) {
      transactions[_key] = arguments[_key];
    }

    this.transactions = transactions;
  }

  //Lots of local scope in here, because we can run the same saga multiple times
  //possibly with different arguments


  _createClass(Saga, [{
    key: "run",
    value: function run() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var toRun = this.transactions.slice(STARTING_ARRAY_INDEX);
      var previousCompensationResults = [];
      var previousResults = [];
      var compensatingFor = null;

      function compensateNext() {
        if (previousResults.length === EMPTY_ARRAY_LENGTH) {
          return (0, _bounce2.default)(function () {
            return new _Errors.SagaError(previousCompensationResults.map(function (result) {
              return Object.assign({}, result, { outcome: _Outcomes2.default.COMPENSATED });
            }));
          }, true);
        }
        var currentlyCompensating = previousResults.pop();

        return currentlyCompensating.compensate(compensatingFor).then(function (result) {
          previousCompensationResults.unshift(result);

          return (0, _bounce2.default)(compensateNext);
        });
      }
      function runNext() {
        if (toRun.length === EMPTY_ARRAY_LENGTH) {
          return (0, _bounce2.default)(function () {
            return previousResults.map(function (result) {
              return Object.assign({}, result, { outcome: _Outcomes2.default.COMPLETED });
            });
          });
        }
        var currentlyRunning = toRun.shift();

        return currentlyRunning.run.apply(currentlyRunning, [previousResults.map(function (previousResult) {
          return previousResult.data;
        })].concat(args)).then(function (result) {
          if (result.status === _Statuses2.default.SUCCESS) {
            previousResults.push(result);

            return (0, _bounce2.default)(runNext);
          }

          compensatingFor = result.data;

          return (0, _bounce2.default)(compensateNext);
        });
      }

      return (0, _bounce2.default)(runNext);
    }
  }, {
    key: "revert",
    value: function revert() {
      return this;
    }
  }]);

  return Saga;
}();

exports.default = Saga;