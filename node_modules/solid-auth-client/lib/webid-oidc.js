"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;
exports.currentSession = currentSession;
exports.logout = logout;
exports.getRegisteredRp = getRegisteredRp;
exports.requiresAuth = requiresAuth;
exports.fetchWithCredentials = fetchWithCredentials;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var authorization = _interopRequireWildcard(require("auth-header"));

var _oidcRp = _interopRequireDefault(require("@solid/oidc-rp"));

var _PoPToken = _interopRequireDefault(require("@solid/oidc-rp/lib/PoPToken"));

var _urlUtil = require("./url-util");

var _storage = require("./storage");

/* global RequestInfo, Response */
async function login(idp, options) {
  try {
    const rp = await getRegisteredRp(idp, options);
    await saveAppHashFragment(options.storage);
    return sendAuthRequest(rp, options);
  } catch (err) {
    console.warn('Error logging in with WebID-OIDC');
    console.error(err);
    return null;
  }
}

async function currentSession(storage = (0, _storage.defaultStorage)()) {
  try {
    // Obtain the Relying Party
    const rp = await getStoredRp(storage);

    if (!rp) {
      return null;
    } // Obtain and clear the OIDC URL fragment


    const url = (0, _urlUtil.currentUrl)();

    if (!/#(.*&)?access_token=/.test(url)) {
      return null;
    }

    window.location.hash = '';
    await restoreAppHashFragment(storage); // Obtain a session from the Relying Party

    const storeData = await (0, _storage.getData)(storage);
    const session = await rp.validateResponse(url, storeData);

    if (!session) {
      return null;
    }

    return (0, _objectSpread2.default)({}, session, {
      webId: session.idClaims.sub,
      idp: session.issuer
    });
  } catch (err) {
    console.warn('Error finding a WebID-OIDC session');
    console.error(err);
    return null;
  }
}

async function logout(storage, fetch) {
  const rp = await getStoredRp(storage);

  if (rp) {
    try {
      // First log out from the IDP
      await rp.logout(); // Then, log out from the RP

      try {
        await fetch('/.well-known/solid/logout', {
          credentials: 'include'
        });
      } catch (e) {// Ignore errors for when we are not on a Solid pod
      }
    } catch (err) {
      console.warn('Error logging out of the WebID-OIDC session');
      console.error(err);
    }
  }
}

async function getRegisteredRp(idp, options) {
  // To reuse a possible previous RP,
  // it be for the same IDP and redirect URI
  let rp = await getStoredRp(options.storage);

  if (!rp || rp.provider.url !== idp || !rp.registration.redirect_uris.includes(options.callbackUri)) {
    // Register a new RP
    rp = await registerRp(idp, options);
    await storeRp(options.storage, idp, rp);
  }

  return rp;
}

async function getStoredRp(storage) {
  const data = await (0, _storage.getData)(storage);
  const rpConfig = data.rpConfig;

  if (rpConfig) {
    rpConfig.store = storage;
    return _oidcRp.default.from(rpConfig);
  } else {
    return null;
  }
}

async function storeRp(storage, idp, rp) {
  await (0, _storage.updateStorage)(storage, data => (0, _objectSpread2.default)({}, data, {
    rpConfig: rp
  }));
  return rp;
}

function registerRp(idp, {
  storage,
  callbackUri
}) {
  const responseType = 'id_token token';
  const registration = {
    issuer: idp,
    grant_types: ['implicit'],
    redirect_uris: [callbackUri],
    response_types: [responseType],
    scope: 'openid profile'
  };
  const options = {
    defaults: {
      authenticate: {
        redirect_uri: callbackUri,
        response_type: responseType
      }
    },
    store: storage
  };
  return _oidcRp.default.register(idp, registration, options);
}

async function sendAuthRequest(rp, {
  callbackUri,
  storage
}) {
  const data = await (0, _storage.getData)(storage);
  const url = await rp.createRequest({
    redirect_uri: callbackUri
  }, data);
  await (0, _storage.updateStorage)(storage, () => data);
  return (0, _urlUtil.navigateTo)(url);
}

async function saveAppHashFragment(store) {
  await (0, _storage.updateStorage)(store, data => (0, _objectSpread2.default)({}, data, {
    appHashFragment: window.location.hash
  }));
}

async function restoreAppHashFragment(store) {
  await (0, _storage.updateStorage)(store, (_ref) => {
    let _ref$appHashFragment = _ref.appHashFragment,
        appHashFragment = _ref$appHashFragment === void 0 ? '' : _ref$appHashFragment,
        data = (0, _objectWithoutProperties2.default)(_ref, ["appHashFragment"]);
    window.location.hash = appHashFragment;
    return data;
  });
}
/**
 * Answers whether a HTTP response requires WebID-OIDC authentication.
 */


function requiresAuth(resp) {
  if (resp.status !== 401) {
    return false;
  }

  const wwwAuthHeader = resp.headers.get('www-authenticate');

  if (!wwwAuthHeader) {
    return false;
  }

  const auth = authorization.parse(wwwAuthHeader);
  return auth.scheme === 'Bearer' && auth.params && auth.params.scope === 'openid webid';
}
/**
 * Fetches a resource, providing the WebID-OIDC ID Token as authentication.
 * Assumes that the resource has requested those tokens in a previous response.
 */


async function fetchWithCredentials(session, fetch, input, options) {
  const popToken = await _PoPToken.default.issueFor((0, _urlUtil.toUrlString)(input), session);
  const authenticatedOptions = (0, _objectSpread2.default)({}, options, {
    credentials: 'include',
    headers: (0, _objectSpread2.default)({}, options && options.headers ? options.headers : {}, {
      authorization: `Bearer ${popToken}`
    })
  });
  return fetch(input, authenticatedOptions);
}