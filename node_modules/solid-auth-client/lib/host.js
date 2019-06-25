"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHost = getHost;
exports.saveHost = saveHost;
exports.updateHostFromResponse = updateHostFromResponse;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _session = require("./session");

var _storage = require("./storage");

var WebIdOidc = _interopRequireWildcard(require("./webid-oidc"));

/* globalRequest, Response, URL */
function getHost(storage) {
  return async url => {
    const _ref = new URL(url),
          host = _ref.host;

    const session = await (0, _session.getSession)(storage);

    if (session && host === new URL(session.idp).host) {
      return {
        url: host,
        requiresAuth: true
      };
    }

    const _ref2 = await (0, _storage.getData)(storage),
          hosts = _ref2.hosts;

    return hosts && hosts[host];
  };
}

function saveHost(storage) {
  return async ({
    url,
    requiresAuth
  }) => {
    await (0, _storage.updateStorage)(storage, data => (0, _objectSpread2.default)({}, data, {
      hosts: (0, _objectSpread2.default)({}, data.hosts, {
        [url]: {
          requiresAuth
        }
      })
    }));
  };
}

function updateHostFromResponse(storage) {
  return async resp => {
    if (WebIdOidc.requiresAuth(resp)) {
      const _ref3 = new URL(resp.url),
            host = _ref3.host;

      await saveHost(storage)({
        url: host,
        requiresAuth: true
      });
    }
  };
}