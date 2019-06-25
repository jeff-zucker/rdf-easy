"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSession = getSession;
exports.saveSession = saveSession;
exports.clearSession = clearSession;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _storage = require("./storage");

async function getSession(storage) {
  const data = await (0, _storage.getData)(storage);
  return data.session || null;
}

function saveSession(storage) {
  return async session => {
    const data = await (0, _storage.updateStorage)(storage, data => (0, _objectSpread2.default)({}, data, {
      session
    }));
    return data.session;
  };
}

async function clearSession(storage) {
  await (0, _storage.updateStorage)(storage, data => (0, _objectSpread2.default)({}, data, {
    session: null
  }));
}