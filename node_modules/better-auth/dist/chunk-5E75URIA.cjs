'use strict';

var chunkG2LZ73E2_cjs = require('./chunk-G2LZ73E2.cjs');
var zod = require('zod');
var betterCall = require('better-call');

async function generateState(c, link) {
  const callbackURL = c.body?.callbackURL || c.context.options.baseURL;
  if (!callbackURL) {
    throw new betterCall.APIError("BAD_REQUEST", {
      message: "callbackURL is required"
    });
  }
  const codeVerifier = chunkG2LZ73E2_cjs.generateRandomString(128);
  const state = chunkG2LZ73E2_cjs.generateRandomString(32);
  const data = JSON.stringify({
    callbackURL,
    codeVerifier,
    errorURL: c.body?.errorCallbackURL,
    newUserURL: c.body?.newUserCallbackURL,
    link,
    /**
     * This is the actual expiry time of the state
     */
    expiresAt: Date.now() + 10 * 60 * 1e3
  });
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  const verification = await c.context.internalAdapter.createVerificationValue({
    value: data,
    identifier: state,
    expiresAt
  });
  if (!verification) {
    c.context.logger.error(
      "Unable to create verification. Make sure the database adapter is properly working and there is a verification table in the database"
    );
    throw new betterCall.APIError("INTERNAL_SERVER_ERROR", {
      message: "Unable to create verification"
    });
  }
  return {
    state: verification.identifier,
    codeVerifier
  };
}
async function parseState(c) {
  const state = c.query.state || c.body.state;
  const data = await c.context.internalAdapter.findVerificationValue(state);
  if (!data) {
    c.context.logger.error("State Mismatch. Verification not found", {
      state
    });
    throw c.redirect(
      `${c.context.baseURL}/error?error=please_restart_the_process`
    );
  }
  const parsedData = zod.z.object({
    callbackURL: zod.z.string(),
    codeVerifier: zod.z.string(),
    errorURL: zod.z.string().optional(),
    newUserURL: zod.z.string().optional(),
    expiresAt: zod.z.number(),
    link: zod.z.object({
      email: zod.z.string(),
      userId: zod.z.string()
    }).optional()
  }).parse(JSON.parse(data.value));
  if (!parsedData.errorURL) {
    parsedData.errorURL = `${c.context.baseURL}/error`;
  }
  if (parsedData.expiresAt < Date.now()) {
    await c.context.internalAdapter.deleteVerificationValue(data.id);
    c.context.logger.error("State expired.", {
      state
    });
    throw c.redirect(
      `${c.context.baseURL}/error?error=please_restart_the_process`
    );
  }
  await c.context.internalAdapter.deleteVerificationValue(data.id);
  return parsedData;
}

exports.generateState = generateState;
exports.parseState = parseState;
