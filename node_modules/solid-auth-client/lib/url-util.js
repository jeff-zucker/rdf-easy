"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toUrlString = exports.originOf = exports.navigateTo = exports.currentUrlNoParams = exports.currentUrl = void 0;

/* eslint-env browser */
const currentUrl = () => window.location.href;

exports.currentUrl = currentUrl;

const currentUrlNoParams = () => window.location.origin + window.location.pathname;

exports.currentUrlNoParams = currentUrlNoParams;

const navigateTo = url => {
  window.location.href = url;
};

exports.navigateTo = navigateTo;

const originOf = url => new URL(url).origin;

exports.originOf = originOf;

const toUrlString = url => {
  if (typeof url !== 'string') {
    url = 'url' in url ? url.url : url.toString();
  }

  return new URL(url, currentUrl()).toString();
};

exports.toUrlString = toUrlString;