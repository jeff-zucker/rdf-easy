/**
 * Dependencies
 */

/**
 * FormUrlEncoded
 */
class FormUrlEncoded {

  /**
   * Encode
   *
   * @description
   * Represent an object as x-www-form-urlencoded string.
   *
   * @param {Object} data
   * @returns {string}
   */
  static encode (data) {
     let pairs = []

     Object.keys(data).forEach(function (key) {
       pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
     })

     return pairs.join('&')
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
  static decode (data) {
    let obj = {}

    data.split('&').forEach(function (property) {
      let pair = property.split('=')
      let key = decodeURIComponent(pair[0])
      let val = decodeURIComponent(pair[1])

      obj[key] = val
    })

    return obj
  }
}

/**
 * Export
 */
module.exports = FormUrlEncoded
