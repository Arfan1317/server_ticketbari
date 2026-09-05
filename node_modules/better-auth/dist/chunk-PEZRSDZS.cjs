'use strict';

// src/error/index.ts
var BetterAuthError = class extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "BetterAuthError";
    this.message = message;
    this.cause = cause;
    this.stack = "";
  }
};
var MissingDependencyError = class extends BetterAuthError {
  constructor(pkgName) {
    super(
      `The package "${pkgName}" is required. Make sure it is installed.`,
      pkgName
    );
  }
};

exports.BetterAuthError = BetterAuthError;
exports.MissingDependencyError = MissingDependencyError;
