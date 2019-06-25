import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

/* global RequestInfo, Response */
import * as authorization from 'auth-header';
import RelyingParty from '@solid/oidc-rp';
import PoPToken from '@solid/oidc-rp/lib/PoPToken';
import { currentUrl, navigateTo, toUrlString } from './url-util';
import { defaultStorage, getData, updateStorage } from './storage';
export function login(_x, _x2) {
  return _login.apply(this, arguments);
}

function _login() {
  _login = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(idp, options) {
    var rp;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return getRegisteredRp(idp, options);

          case 3:
            rp = _context.sent;
            _context.next = 6;
            return saveAppHashFragment(options.storage);

          case 6:
            return _context.abrupt("return", sendAuthRequest(rp, options));

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            console.warn('Error logging in with WebID-OIDC');
            console.error(_context.t0);
            return _context.abrupt("return", null);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 9]]);
  }));
  return _login.apply(this, arguments);
}

export function currentSession() {
  return _currentSession.apply(this, arguments);
}

function _currentSession() {
  _currentSession = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var storage,
        rp,
        url,
        storeData,
        session,
        _args2 = arguments;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            storage = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : defaultStorage();
            _context2.prev = 1;
            _context2.next = 4;
            return getStoredRp(storage);

          case 4:
            rp = _context2.sent;

            if (rp) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", null);

          case 7:
            // Obtain and clear the OIDC URL fragment
            url = currentUrl();

            if (/#(.*&)?access_token=/.test(url)) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", null);

          case 10:
            window.location.hash = '';
            _context2.next = 13;
            return restoreAppHashFragment(storage);

          case 13:
            _context2.next = 15;
            return getData(storage);

          case 15:
            storeData = _context2.sent;
            _context2.next = 18;
            return rp.validateResponse(url, storeData);

          case 18:
            session = _context2.sent;

            if (session) {
              _context2.next = 21;
              break;
            }

            return _context2.abrupt("return", null);

          case 21:
            return _context2.abrupt("return", _objectSpread({}, session, {
              webId: session.idClaims.sub,
              idp: session.issuer
            }));

          case 24:
            _context2.prev = 24;
            _context2.t0 = _context2["catch"](1);
            console.warn('Error finding a WebID-OIDC session');
            console.error(_context2.t0);
            return _context2.abrupt("return", null);

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 24]]);
  }));
  return _currentSession.apply(this, arguments);
}

export function logout(_x3, _x4) {
  return _logout.apply(this, arguments);
}

function _logout() {
  _logout = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3(storage, fetch) {
    var rp;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return getStoredRp(storage);

          case 2:
            rp = _context3.sent;

            if (!rp) {
              _context3.next = 20;
              break;
            }

            _context3.prev = 4;
            _context3.next = 7;
            return rp.logout();

          case 7:
            _context3.prev = 7;
            _context3.next = 10;
            return fetch('/.well-known/solid/logout', {
              credentials: 'include'
            });

          case 10:
            _context3.next = 14;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](7);

          case 14:
            _context3.next = 20;
            break;

          case 16:
            _context3.prev = 16;
            _context3.t1 = _context3["catch"](4);
            console.warn('Error logging out of the WebID-OIDC session');
            console.error(_context3.t1);

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[4, 16], [7, 12]]);
  }));
  return _logout.apply(this, arguments);
}

export function getRegisteredRp(_x5, _x6) {
  return _getRegisteredRp.apply(this, arguments);
}

function _getRegisteredRp() {
  _getRegisteredRp = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee4(idp, options) {
    var rp;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getStoredRp(options.storage);

          case 2:
            rp = _context4.sent;

            if (!(!rp || rp.provider.url !== idp || !rp.registration.redirect_uris.includes(options.callbackUri))) {
              _context4.next = 9;
              break;
            }

            _context4.next = 6;
            return registerRp(idp, options);

          case 6:
            rp = _context4.sent;
            _context4.next = 9;
            return storeRp(options.storage, idp, rp);

          case 9:
            return _context4.abrupt("return", rp);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return _getRegisteredRp.apply(this, arguments);
}

function getStoredRp(_x7) {
  return _getStoredRp.apply(this, arguments);
}

function _getStoredRp() {
  _getStoredRp = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee5(storage) {
    var data, rpConfig;
    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return getData(storage);

          case 2:
            data = _context5.sent;
            rpConfig = data.rpConfig;

            if (!rpConfig) {
              _context5.next = 9;
              break;
            }

            rpConfig.store = storage;
            return _context5.abrupt("return", RelyingParty.from(rpConfig));

          case 9:
            return _context5.abrupt("return", null);

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
  return _getStoredRp.apply(this, arguments);
}

function storeRp(_x8, _x9, _x10) {
  return _storeRp.apply(this, arguments);
}

function _storeRp() {
  _storeRp = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee6(storage, idp, rp) {
    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return updateStorage(storage, function (data) {
              return _objectSpread({}, data, {
                rpConfig: rp
              });
            });

          case 2:
            return _context6.abrupt("return", rp);

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return _storeRp.apply(this, arguments);
}

function registerRp(idp, _ref) {
  var storage = _ref.storage,
      callbackUri = _ref.callbackUri;
  var responseType = 'id_token token';
  var registration = {
    issuer: idp,
    grant_types: ['implicit'],
    redirect_uris: [callbackUri],
    response_types: [responseType],
    scope: 'openid profile'
  };
  var options = {
    defaults: {
      authenticate: {
        redirect_uri: callbackUri,
        response_type: responseType
      }
    },
    store: storage
  };
  return RelyingParty.register(idp, registration, options);
}

function sendAuthRequest(_x11, _x12) {
  return _sendAuthRequest.apply(this, arguments);
}

function _sendAuthRequest() {
  _sendAuthRequest = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee7(rp, _ref2) {
    var callbackUri, storage, data, url;
    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            callbackUri = _ref2.callbackUri, storage = _ref2.storage;
            _context7.next = 3;
            return getData(storage);

          case 3:
            data = _context7.sent;
            _context7.next = 6;
            return rp.createRequest({
              redirect_uri: callbackUri
            }, data);

          case 6:
            url = _context7.sent;
            _context7.next = 9;
            return updateStorage(storage, function () {
              return data;
            });

          case 9:
            return _context7.abrupt("return", navigateTo(url));

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));
  return _sendAuthRequest.apply(this, arguments);
}

function saveAppHashFragment(_x13) {
  return _saveAppHashFragment.apply(this, arguments);
}

function _saveAppHashFragment() {
  _saveAppHashFragment = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee8(store) {
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return updateStorage(store, function (data) {
              return _objectSpread({}, data, {
                appHashFragment: window.location.hash
              });
            });

          case 2:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));
  return _saveAppHashFragment.apply(this, arguments);
}

function restoreAppHashFragment(_x14) {
  return _restoreAppHashFragment.apply(this, arguments);
}
/**
 * Answers whether a HTTP response requires WebID-OIDC authentication.
 */


function _restoreAppHashFragment() {
  _restoreAppHashFragment = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee9(store) {
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return updateStorage(store, function (_ref3) {
              var _ref3$appHashFragment = _ref3.appHashFragment,
                  appHashFragment = _ref3$appHashFragment === void 0 ? '' : _ref3$appHashFragment,
                  data = _objectWithoutProperties(_ref3, ["appHashFragment"]);

              window.location.hash = appHashFragment;
              return data;
            });

          case 2:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
  return _restoreAppHashFragment.apply(this, arguments);
}

export function requiresAuth(resp) {
  if (resp.status !== 401) {
    return false;
  }

  var wwwAuthHeader = resp.headers.get('www-authenticate');

  if (!wwwAuthHeader) {
    return false;
  }

  var auth = authorization.parse(wwwAuthHeader);
  return auth.scheme === 'Bearer' && auth.params && auth.params.scope === 'openid webid';
}
/**
 * Fetches a resource, providing the WebID-OIDC ID Token as authentication.
 * Assumes that the resource has requested those tokens in a previous response.
 */

export function fetchWithCredentials(_x15, _x16, _x17, _x18) {
  return _fetchWithCredentials.apply(this, arguments);
}

function _fetchWithCredentials() {
  _fetchWithCredentials = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee10(session, fetch, input, options) {
    var popToken, authenticatedOptions;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return PoPToken.issueFor(toUrlString(input), session);

          case 2:
            popToken = _context10.sent;
            authenticatedOptions = _objectSpread({}, options, {
              credentials: 'include',
              headers: _objectSpread({}, options && options.headers ? options.headers : {}, {
                authorization: "Bearer ".concat(popToken)
              })
            });
            return _context10.abrupt("return", fetch(input, authenticatedOptions));

          case 5:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));
  return _fetchWithCredentials.apply(this, arguments);
}