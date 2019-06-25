import SolidAuthClient from './solid-auth-client'; // Export a singleton instance of SolidAuthClient

var auth = new SolidAuthClient();
export default auth; // Bind methods to instance, so they can be invoked as regular functions
// (e.g., to pass around the fetch function)

Object.getOwnPropertyNames(SolidAuthClient.prototype).forEach(function (property) {
  var value = auth[property];

  if (typeof value === 'function') {
    auth[property] = value.bind(auth);
  }
}); // Expose window.SolidAuthClient for backward compatibility

if (typeof window !== 'undefined') {
  if ('SolidAuthClient' in window) {
    console.warn('Caution: multiple versions of solid-auth-client active.');
  } else {
    var warned = false;
    Object.defineProperty(window, 'SolidAuthClient', {
      enumerable: true,
      get: function get() {
        if (!warned) {
          warned = true;
          console.warn('window.SolidAuthClient has been deprecated.');
          console.warn('Please use window.solid.auth instead.');
        }

        return auth;
      }
    });
  }
}