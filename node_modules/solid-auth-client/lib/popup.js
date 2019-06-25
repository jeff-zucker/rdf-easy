"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openIdpPopup = openIdpPopup;
exports.obtainSession = obtainSession;
exports.popupHandler = popupHandler;

var _ipc = require("./ipc");

var _urlUtil = require("./url-util");

function openIdpPopup(popupUri) {
  const width = 650;
  const height = 400;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;
  const settings = `width=${width},height=${height},left=${left},top=${top}`;
  return window.open(popupUri, 'solid-auth-client', settings);
}

function obtainSession(store, popup, options) {
  return new Promise((resolve, reject) => {
    const popupServer = new _ipc.Server(popup, (0, _urlUtil.originOf)(options.popupUri || ''), popupHandler(store, options, session => {
      popupServer.stop();
      resolve(session);
    }));
    popupServer.start();
  });
}

function popupHandler(store, {
  popupUri,
  callbackUri
}, foundSessionCb) {
  return async (method, ...args) => {
    switch (method) {
      // Origin
      case 'getAppOrigin':
        return window.location.origin;
      // Storage

      case 'storage/getItem':
        return store.getItem(...args);

      case 'storage/setItem':
        return store.setItem(...args);

      case 'storage/removeItem':
        return store.removeItem(...args);
      // Login

      case 'getLoginOptions':
        return {
          popupUri,
          callbackUri
        };

      case 'foundSession':
        foundSessionCb(...args);
    }
  };
}