// src/utils/env.ts
var _envShim = /* @__PURE__ */ Object.create(null);
var _getEnv = (useShim) => globalThis.process?.env || //@ts-expect-error
globalThis.Deno?.env.toObject() || //@ts-expect-error
globalThis.__env__ || (useShim ? _envShim : globalThis);
var env = new Proxy(_envShim, {
  get(_, prop) {
    const env2 = _getEnv();
    return env2[prop] ?? _envShim[prop];
  },
  has(_, prop) {
    const env2 = _getEnv();
    return prop in env2 || prop in _envShim;
  },
  set(_, prop, value) {
    const env2 = _getEnv(true);
    env2[prop] = value;
    return true;
  },
  deleteProperty(_, prop) {
    if (!prop) {
      return false;
    }
    const env2 = _getEnv(true);
    delete env2[prop];
    return true;
  },
  ownKeys() {
    const env2 = _getEnv(true);
    return Object.keys(env2);
  }
});
function toBoolean(val) {
  return val ? val !== "false" : false;
}
var nodeENV = typeof process !== "undefined" && process.env && process.env.NODE_ENV || "";
var isProduction = nodeENV === "production";
var isDevelopment = nodeENV === "dev" || nodeENV === "development";
var isTest = nodeENV === "test" || toBoolean(env.TEST);

export { env, isDevelopment, isProduction, isTest };
