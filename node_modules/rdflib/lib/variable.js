'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ClassOrder = require('./class-order');

var Node = require('./node');

var Uri = require('./uri');
/**
 * Variables are placeholders used in patterns to be matched.
 * In cwm they are symbols which are the formula's list of quantified variables.
 * In sparql they are not visibly URIs.  Here we compromise, by having
 * a common special base URI for variables. Their names are uris,
 * but the ? notation has an implicit base uri of 'varid:'
 * @class Variable
 */


var Variable =
/*#__PURE__*/
function (_Node) {
  _inherits(Variable, _Node);

  function Variable() {
    var _this;

    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, Variable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Variable).call(this));
    _this.termType = Variable.termType;
    _this.value = name;
    _this.base = 'varid:';
    _this.uri = Uri.join(name, _this.base);
    return _this;
  }

  _createClass(Variable, [{
    key: "equals",
    value: function equals(other) {
      if (!other) {
        return false;
      }

      return this.termType === other.termType && this.value === other.value;
    }
  }, {
    key: "hashString",
    value: function hashString() {
      return this.toString();
    }
  }, {
    key: "substitute",
    value: function substitute(bindings) {
      var ref;
      return (ref = bindings[this.toNT()]) != null ? ref : this;
    }
  }, {
    key: "toString",
    value: function toString() {
      if (this.uri.slice(0, this.base.length) === this.base) {
        return '?' + this.uri.slice(this.base.length);
      }

      return '?' + this.uri;
    }
  }]);

  return Variable;
}(Node);

Variable.termType = 'Variable';
Variable.prototype.classOrder = ClassOrder['Variable'];
Variable.prototype.isVar = 1;
module.exports = Variable;