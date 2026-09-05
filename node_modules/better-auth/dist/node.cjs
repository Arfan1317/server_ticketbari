'use strict';

var betterCall = require('better-call');

// src/integrations/node.ts
var toNodeHandler = (auth) => {
  return "handler" in auth ? betterCall.toNodeHandler(auth.handler) : betterCall.toNodeHandler(auth);
};
function fromNodeHeaders(nodeHeaders) {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (value !== void 0) {
      if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      } else {
        webHeaders.set(key, value);
      }
    }
  }
  return webHeaders;
}

exports.fromNodeHeaders = fromNodeHeaders;
exports.toNodeHandler = toNodeHandler;
