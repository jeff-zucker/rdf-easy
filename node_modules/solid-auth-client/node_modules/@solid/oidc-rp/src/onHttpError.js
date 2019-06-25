'use strict'

/**
 * Throws an error when a fetch response status code indicates a 400 or 500
 * HTTP error. (The whatwg fetch api does not normally reject on http error
 * responses).
 *
 * Usage:
 *
 * ```
 * return fetch(url)
 *   .then(onHttpError('Error while fetching resource')
 *   .catch(err => console.log(err))
 *
 * // -> 'Error while fetching resource: 404 Not Found' error
 * // if a 404 response is encountered
 * ```
 *
 * @param [message] {string} Optional error message to clarify context
 *
 * @throws {Error} For http status codes > 300
 *
 * @return {Object} fetch response object (passed through if no error)
 */
function onHttpError (message = 'fetch error') {
  return (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response
    }

    let errorMessage = `${message}: ${response.status} ${response.statusText}`
    let error = new Error(errorMessage)
    error.response = response
    error.statusCode = response.status
    throw error
  }
}

module.exports = onHttpError
