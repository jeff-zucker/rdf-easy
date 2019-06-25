'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * None
 */
var None = function () {
  function None() {
    _classCallCheck(this, None);
  }

  _createClass(None, [{
    key: 'sign',

    /**
     * sign
     */
    value: function sign() {
      return Promise.resolve('');
    }

    /**
     * verify
     */

  }, {
    key: 'verify',
    value: function verify() {
      // this will never get called. but you looked.
    }
  }]);

  return None;
}();

/**
 * Export
 */


module.exports = None;