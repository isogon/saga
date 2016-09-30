"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExtendableError = function (_Error) {
  _inherits(ExtendableError, _Error);

  function ExtendableError(message) {
    _classCallCheck(this, ExtendableError);

    var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));

    _this.name = _this.constructor.name;
    _this.message = message;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return ExtendableError;
}(Error);

exports.default = ExtendableError;

var SagaError = exports.SagaError = function (_ExtendableError) {
  _inherits(SagaError, _ExtendableError);

  function SagaError(results) {
    _classCallCheck(this, SagaError);

    var _this2 = _possibleConstructorReturn(this, (SagaError.__proto__ || Object.getPrototypeOf(SagaError)).call(this, "The saga encountered an error."));

    _this2.results = results;
    return _this2;
  }

  return SagaError;
}(ExtendableError);

var TransactionError = exports.TransactionError = function (_ExtendableError2) {
  _inherits(TransactionError, _ExtendableError2);

  function TransactionError() {
    _classCallCheck(this, TransactionError);

    return _possibleConstructorReturn(this, (TransactionError.__proto__ || Object.getPrototypeOf(TransactionError)).apply(this, arguments));
  }

  return TransactionError;
}(ExtendableError);