import { env } from './chunk-TQQSPPNA.js';
import { BetterAuthError } from './chunk-UNWCXKMP.js';

// src/utils/url.ts
function checkHasPath(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname !== "/";
  } catch (error) {
    throw new BetterAuthError(
      `Invalid base URL: ${url}. Please provide a valid base URL.`
    );
  }
}
function withPath(url, path = "/api/auth") {
  const hasPath = checkHasPath(url);
  if (hasPath) {
    return url;
  }
  path = path.startsWith("/") ? path : `/${path}`;
  return `${url.replace(/\/+$/, "")}${path}`;
}
function getBaseURL(url, path) {
  if (url) {
    return withPath(url, path);
  }
  const fromEnv = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL || env.PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_AUTH_URL || (env.BASE_URL !== "/" ? env.BASE_URL : void 0);
  if (fromEnv) {
    return withPath(fromEnv, path);
  }
  if (typeof window !== "undefined" && window.location) {
    return withPath(window.location.origin, path);
  }
  return void 0;
}
function getOrigin(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin;
  } catch (error) {
    return null;
  }
}
function getProtocol(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol;
  } catch (error) {
    return null;
  }
}
function getHost(url) {
  if (url.includes("://")) {
    const parsedUrl = new URL(url);
    return parsedUrl.host;
  }
  return url;
}

export { getBaseURL, getHost, getOrigin, getProtocol };
