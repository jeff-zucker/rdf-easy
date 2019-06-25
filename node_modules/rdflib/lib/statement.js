'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Node = require('./node');

var Statement =
/*#__PURE__*/
function () {
  /* Construct a new statment
  **
  ** @param {Term} subject - The subject of the triple.  What the efact is about
  ** @ param {Term} predciate - The relationship which is assrted between the subject and object
  ** @param {Term} object - The thing or data value which is asserted to be related to the subject
  ** @param {NamedNode} why - The document where thr triple is or was or will be stored on the web.
  **
  ** The why param is a named node of the document in which the triple when
  ** it is stored on the web.
  ** It is called “why” because when you have read data from varou slaces the
  **  “why” tells you why you have the triple. (At the moment, it is just the
  ** document, in future it could be an inference step). When you do
  ** UpdateManager.update() then the why’s of all the statmemts must be the same,
  ** and give the document you are patching. In future, we may have a more
  ** powerful update() which can update more than one docment.
  */
  function Statement(subject, predicate, object, graph) {
    _classCallCheck(this, Statement);

    this.subject = Node.fromValue(subject);
    this.predicate = Node.fromValue(predicate);
    this.object = Node.fromValue(object);
    this.why = graph; // property currently used by rdflib
  }

  _createClass(Statement, [{
    key: "equals",
    value: function equals(other) {
      return other.subject.equals(this.subject) && other.predicate.equals(this.predicate) && other.object.equals(this.object) && other.graph.equals(this.graph);
    }
  }, {
    key: "substitute",
    value: function substitute(bindings) {
      var y = new Statement(this.subject.substitute(bindings), this.predicate.substitute(bindings), this.object.substitute(bindings), this.why.substitute(bindings)); // 2016

      console.log('@@@ statement substitute:' + y);
      return y;
    }
  }, {
    key: "toCanonical",
    value: function toCanonical() {
      var terms = [this.subject.toCanonical(), this.predicate.toCanonical(), this.object.toCanonical()];

      if (this.graph && this.graph.termType !== 'DefaultGraph') {
        terms.push(this.graph.toCanonical());
      }

      return terms.join(' ') + ' .';
    }
  }, {
    key: "toNT",
    value: function toNT() {
      return [this.subject.toNT(), this.predicate.toNT(), this.object.toNT()].join(' ') + ' .';
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.toNT();
    }
  }, {
    key: "graph",
    get: function get() {
      return this.why;
    },
    set: function set(g) {
      this.why = g;
    }
  }]);

  return Statement;
}();

module.exports = Statement;