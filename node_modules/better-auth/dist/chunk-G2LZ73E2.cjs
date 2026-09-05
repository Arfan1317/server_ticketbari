'use strict';

var hash = require('@better-auth/utils/hash');
var chacha = require('@noble/ciphers/chacha');
var utils$1 = require('@noble/ciphers/utils');
var webcrypto = require('@noble/ciphers/webcrypto');
var jose = require('jose');
var scrypt = require('@noble/hashes/scrypt');
var utils = require('@better-auth/utils');
var hex = require('@better-auth/utils/hex');
var random = require('@better-auth/utils/random');

// src/crypto/index.ts

// src/crypto/buffer.ts
function constantTimeEqual(a, b) {
  const aBuffer = new Uint8Array(a);
  const bBuffer = new Uint8Array(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < aBuffer.length; i++) {
    c |= aBuffer[i] ^ bBuffer[i];
  }
  return c === 0;
}
async function hashToBase64(data) {
  const buffer = await hash.createHash("SHA-256").digest(data);
  return Buffer.from(buffer).toString("base64");
}
async function compareHash(data, hash$1) {
  const buffer = await hash.createHash("SHA-256").digest(
    typeof data === "string" ? new TextEncoder().encode(data) : data
  );
  const hashBuffer = Buffer.from(hash$1, "base64");
  return constantTimeEqual(buffer, hashBuffer);
}
async function signJWT(payload, secret, expiresIn = 3600) {
  const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + expiresIn).sign(new TextEncoder().encode(secret));
  return jwt;
}
var config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};
async function generateKey(password, salt) {
  return await scrypt.scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2
  });
}
var hashPassword = async (password) => {
  const salt = hex.hex.encode(utils.getRandomValues(new Uint8Array(16)));
  const key = await generateKey(password, salt);
  return `${salt}:${hex.hex.encode(key)}`;
};
var verifyPassword = async ({
  hash,
  password
}) => {
  const [salt, key] = hash.split(":");
  const targetKey = await generateKey(password, salt);
  return constantTimeEqual(targetKey, new Uint8Array(Buffer.from(key, "hex")));
};
var generateRandomString = random.createRandomStringGenerator(
  "a-z",
  "0-9",
  "A-Z",
  "-_"
);

// src/crypto/index.ts
var symmetricEncrypt = async ({
  key,
  data
}) => {
  const keyAsBytes = await hash.createHash("SHA-256").digest(key);
  const dataAsBytes = utils$1.utf8ToBytes(data);
  const chacha$1 = webcrypto.managedNonce(chacha.xchacha20poly1305)(new Uint8Array(keyAsBytes));
  return utils$1.bytesToHex(chacha$1.encrypt(dataAsBytes));
};
var symmetricDecrypt = async ({
  key,
  data
}) => {
  const keyAsBytes = await hash.createHash("SHA-256").digest(key);
  const dataAsBytes = utils$1.hexToBytes(data);
  const chacha$1 = webcrypto.managedNonce(chacha.xchacha20poly1305)(new Uint8Array(keyAsBytes));
  return new TextDecoder().decode(chacha$1.decrypt(dataAsBytes));
};

exports.compareHash = compareHash;
exports.constantTimeEqual = constantTimeEqual;
exports.generateRandomString = generateRandomString;
exports.hashPassword = hashPassword;
exports.hashToBase64 = hashToBase64;
exports.signJWT = signJWT;
exports.symmetricDecrypt = symmetricDecrypt;
exports.symmetricEncrypt = symmetricEncrypt;
exports.verifyPassword = verifyPassword;
