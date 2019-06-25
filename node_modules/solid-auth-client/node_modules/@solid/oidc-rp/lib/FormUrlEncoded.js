'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Dependencies
 */

/**
 * FormUrlEncoded
 */
var FormUrlEncoded = function () {
  function FormUrlEncoded() {
    _classCallCheck(this, FormUrlEncoded);
  }

  _createClass(FormUrlEncoded, null, [{
    key: 'encode',


    /**
     * Encode
     *
     * @description
     * Represent an object as x-www-form-urlencoded string.
     *
     * @param {Object} data
     * @returns {string}
     */
    value: function encode(data) {
      var pairs = [];

      Object.keys(data).forEach(function (key) {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      });

      return pairs.join('&');
    }

    /**
     * Decode
     *
     * @description
     * Parse a x-www-form-urlencoded into an object.
     *
     * @param {string} data
     * @returns {Object}
     */

  }, {
    key: 'decode',
    value: function decode(data) {
      var obj = {};

      data.split('&').forEach(function (property) {
        var pair = property.split('=');
        var key = decodeURIComponent(pair[0]);
        var val = decodeURIComponent(pair[1]);

        obj[key] = val;
      });

      return obj;
    }
  }]);

  return FormUrlEncoded;
}();

/**
 * Export
 */


module.exports = FormUrlEncoded;