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

var BlankNode =
/*#__PURE__*/
function (_Node) {
  _inherits(BlankNode, _Node);

  function BlankNode(id) {
    var _this;

    _classCallCheck(this, BlankNode);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BlankNode).call(this));
    _this.termType = BlankNode.termType;

    if (id) {
      if (typeof id !== 'string') {
        console.log('Bad blank id:', id);
        throw new Error('Bad id argument to new blank node: ' + id);
      }

      if (id.includes('#')) {
        // Is a URI with hash fragment
        var fragments = id.split('#');
        id = fragments[fragments.length - 1];
      }

      _this.id = id; // this.id = '' + BlankNode.nextId++
    } else {
      _this.id = 'n' + BlankNode.nextId++;
    }

    _this.value = _this.id;
    return _this;
  }

  _createClass(BlankNode, [{
    key: "compareTerm",
    value: function compareTerm(other) {
      if (this.classOrder < other.classOrder) {
        return -1;
      }

      if (this.classOrder > other.classOrder) {
        return +1;
      }

      if (this.id < other.id) {
        return -1;
      }

      if (this.id > other.id) {
        return +1;
      }

      return 0;
    }
  }, {
    key: "copy",
    value: function copy(formula) {
      // depends on the formula
      var bnodeNew = new BlankNode();
      formula.copyTo(this, bnodeNew);
      return bnodeNew;
    }
  }, {
    key: "toCanonical",
    value: function toCanonical() {
      return '_:' + this.value;
    }
  }, {
    key: "toString",
    value: function toString() {
      return BlankNode.NTAnonymousNodePrefix + this.id;
    }
  }]);

  return BlankNode;
}(Node);

BlankNode.nextId = 0;
BlankNode.termType = 'BlankNode';
BlankNode.NTAnonymousNodePrefix = '_:';
BlankNode.prototype.classOrder = ClassOrder['BlankNode'];
BlankNode.prototype.isBlank = 1;
BlankNode.prototype.isVar = 1;
module.exports = BlankNode;