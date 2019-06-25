"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authnFetch = authnFetch;

require("isomorphic-fetch");

var _urlUtil = require("./url-util");

var _host = require("./host");

var _session = require("./session");

var _webidOidc = require("./webid-oidc");

async function authnFetch(storage, fetch, input, options) {
  // If not authenticated, perform a regular fetch
  const session = await (0, _session.getSession)(storage);

  if (!session) {
    return fetch(input, options);
  } // If we know the server expects credentials, send them


  if (await shouldShareCredentials(storage, input)) {
    return (0, _webidOidc.fetchWithCredentials)(session, fetch, input, options);
  } // If we don't know for sure, try a regular fetch first


  let resp = await fetch(input, options); // If the server then requests credentials, send them

  if (resp.status === 401) {
    await (0, _host.updateHostFromResponse)(storage)(resp);

    if (await shouldShareCredentials(storage, input)) {
      resp = (0, _webidOidc.fetchWithCredentials)(session, fetch, input, options);
    }
  }

  return resp;
}

async function shouldShareCredentials(storage, input) {
  const requestHost = await (0, _host.getHost)(storage)((0, _urlUtil.toUrlString)(input));
  return requestHost != null && requestHost.requiresAuth;
}