import { createHash } from '@better-auth/utils/hash';
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/ciphers/utils';
import { managedNonce } from '@noble/ciphers/webcrypto';
import { SignJWT } from 'jose';
import { scryptAsync } from '@noble/hashes/scrypt';
import { getRandomValues } from '@better-auth/utils';
import { hex } from '@better-auth/utils/hex';
import { createRandomStringGenerator } from '@better-auth/utils/random';

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
  const buffer = await createHash("SHA-256").digest(data);
  return Buffer.from(buffer).toString("base64");
}
async function compareHash(data, hash) {
  const buffer = await createHash("SHA-256").digest(
    typeof data === "string" ? new TextEncoder().encode(data) : data
  );
  const hashBuffer = Buffer.from(hash, "base64");
  return constantTimeEqual(buffer, hashBuffer);
}
async function signJWT(payload, secret, expiresIn = 3600) {
  const jwt = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + expiresIn).sign(new TextEncoder().encode(secret));
  return jwt;
}
var config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};
async function generateKey(password, salt) {
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2
  });
}
var hashPassword = async (password) => {
  const salt = hex.encode(getRandomValues(new Uint8Array(16)));
  const key = await generateKey(password, salt);
  return `${salt}:${hex.encode(key)}`;
};
var verifyPassword = async ({
  hash,
  password
}) => {
  const [salt, key] = hash.split(":");
  const targetKey = await generateKey(password, salt);
  return constantTimeEqual(targetKey, new Uint8Array(Buffer.from(key, "hex")));
};
var generateRandomString = createRandomStringGenerator(
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
  const keyAsBytes = await createHash("SHA-256").digest(key);
  const dataAsBytes = utf8ToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes));
  return bytesToHex(chacha.encrypt(dataAsBytes));
};
var symmetricDecrypt = async ({
  key,
  data
}) => {
  const keyAsBytes = await createHash("SHA-256").digest(key);
  const dataAsBytes = hexToBytes(data);
  const chacha = managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes));
  return new TextDecoder().decode(chacha.decrypt(dataAsBytes));
};

export { compareHash, constantTimeEqual, generateRandomString, hashPassword, hashToBase64, signJWT, symmetricDecrypt, symmetricEncrypt, verifyPassword };
