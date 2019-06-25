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

var BlankNode = require('./blank-node');

var ClassOrder = require('./class-order');

var Node = require('./node');

var Collection =
/*#__PURE__*/
function (_Node) {
  _inherits(Collection, _Node);

  function Collection(initial) {
    var _this;

    _classCallCheck(this, Collection);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Collection).call(this));
    _this.termType = Collection.termType;
    _this.id = BlankNode.nextId++;
    _this.elements = [];
    _this.closed = false;

    if (initial && initial.length > 0) {
      initial.forEach(function (element) {
        _this.elements.push(Node.fromValue(element));
      });
    }

    return _this;
  }

  _createClass(Collection, [{
    key: "append",
    value: function append(element) {
      return this.elements.push(element);
    }
  }, {
    key: "close",
    value: function close() {
      this.closed = true;
      return this.closed;
    }
  }, {
    key: "shift",
    value: function shift() {
      return this.elements.shift();
    }
  }, {
    key: "substitute",
    value: function substitute(bindings) {
      var elementsCopy = this.elements.map(function (ea) {
        ea.substitute(bindings);
      });
      return new Collection(elementsCopy);
    }
  }, {
    key: "toNT",
    value: function toNT() {
      return BlankNode.NTAnonymousNodePrefix + this.id;
    }
  }, {
    key: "toString",
    value: function toString() {
      return '(' + this.elements.join(' ') + ')';
    }
  }, {
    key: "unshift",
    value: function unshift(element) {
      return this.elements.unshift(element);
    }
  }]);

  return Collection;
}(Node);

Collection.termType = 'Collection';
Collection.prototype.classOrder = ClassOrder['Collection'];
Collection.prototype.compareTerm = BlankNode.prototype.compareTerm;
Collection.prototype.isVar = 0;
module.exports = Collection;