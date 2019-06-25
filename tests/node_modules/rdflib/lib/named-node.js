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
/**
 * @class NamedNode
 * @extends Node
 */


var NamedNode =
/*#__PURE__*/
function (_Node) {
  _inherits(NamedNode, _Node);

  /**
   * @constructor
   * @param iri {String}
   */
  function NamedNode(iri) {
    var _this;

    _classCallCheck(this, NamedNode);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NamedNode).call(this));
    _this.termType = NamedNode.termType;

    if (iri && iri.termType === NamedNode.termType) {
      // param is a named node
      iri = iri.value;
    }

    if (!iri) {
      throw new Error('Missing IRI for NamedNode');
    }

    if (!iri.includes(':')) {
      throw new Error('NamedNode IRI "' + iri + '" must be absolute.');
    }

    if (iri.includes(' ')) {
      var message = 'Error: NamedNode IRI "' + iri + '" must not contain unencoded spaces.';
      throw new Error(message);
    }

    _this.value = iri;
    return _this;
  }
  /**
   * Returns an $rdf node for the containing directory, ending in slash.
   */


  _createClass(NamedNode, [{
    key: "dir",
    value: function dir() {
      var str = this.uri.split('#')[0];
      var p = str.slice(0, -1).lastIndexOf('/');
      var q = str.indexOf('//');
      if (q >= 0 && p < q + 2 || p < 0) return null;
      return new NamedNode(str.slice(0, p + 1));
    }
    /**
     * Returns an NN for the whole web site, ending in slash.
     * Contrast with the "origin" which does NOT have a trailing slash
     */

  }, {
    key: "site",
    value: function site() {
      var str = this.uri.split('#')[0];
      var p = str.indexOf('//');
      if (p < 0) throw new Error('This URI does not have a web site part (origin)');
      var q = str.indexOf('/', p + 2);
      if (q < 0) throw new Error('This URI does not have a web site part. (origin)');
      return new NamedNode(str.slice(0, q + 1));
    }
  }, {
    key: "doc",
    value: function doc() {
      if (this.uri.indexOf('#') < 0) {
        return this;
      } else {
        return new NamedNode(this.uri.split('#')[0]);
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return '<' + this.uri + '>';
    }
    /**
     * Legacy getter and setter alias, node.uri
     */

  }, {
    key: "uri",
    get: function get() {
      return this.value;
    },
    set: function set(uri) {
      this.value = uri;
    }
  }], [{
    key: "fromValue",
    value: function fromValue(value) {
      if (typeof value === 'undefined' || value === null) {
        return value;
      }

      var isNode = value && value.termType;

      if (isNode) {
        return value;
      }

      return new NamedNode(value);
    }
  }]);

  return NamedNode;
}(Node);

NamedNode.termType = 'NamedNode';
NamedNode.prototype.classOrder = ClassOrder['NamedNode'];
NamedNode.prototype.isVar = 0;
module.exports = NamedNode;