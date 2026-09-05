import { createRandomStringGenerator } from '@better-auth/utils/random';

// src/utils/logger.ts
var levels = ["info", "success", "warn", "error", "debug"];
function shouldPublishLog(currentLogLevel, logLevel) {
  return levels.indexOf(logLevel) <= levels.indexOf(currentLogLevel);
}
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  underscore: "\x1B[4m",
  blink: "\x1B[5m",
  reverse: "\x1B[7m",
  hidden: "\x1B[8m",
  fg: {
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m"
  },
  bg: {
    black: "\x1B[40m",
    red: "\x1B[41m",
    green: "\x1B[42m",
    yellow: "\x1B[43m",
    blue: "\x1B[44m",
    magenta: "\x1B[45m",
    cyan: "\x1B[46m",
    white: "\x1B[47m"
  }
};
var levelColors = {
  info: colors.fg.blue,
  success: colors.fg.green,
  warn: colors.fg.yellow,
  error: colors.fg.red,
  debug: colors.fg.magenta
};
var formatMessage = (level, message) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  return `${colors.dim}${timestamp}${colors.reset} ${levelColors[level]}${level.toUpperCase()}${colors.reset} ${colors.bright}[Better Auth]:${colors.reset} ${message}`;
};
var createLogger = (options) => {
  const enabled = options?.disabled !== true;
  const logLevel = options?.level ?? "error";
  const LogFunc = (level, message, args = []) => {
    if (!enabled || !shouldPublishLog(logLevel, level)) {
      return;
    }
    const formattedMessage = formatMessage(level, message);
    if (!options || typeof options.log !== "function") {
      if (level === "error") {
        console.error(formattedMessage, ...args);
      } else if (level === "warn") {
        console.warn(formattedMessage, ...args);
      } else {
        console.log(formattedMessage, ...args);
      }
      return;
    }
    options.log(level === "success" ? "info" : level, message, ...args);
  };
  return Object.fromEntries(
    levels.map((level) => [
      level,
      (...[message, ...args]) => LogFunc(level, message, args)
    ])
  );
};
var logger = createLogger();

// src/utils/hide-metadata.ts
var HIDE_METADATA = {
  isAction: false
};
var generateId = (size) => {
  return createRandomStringGenerator("a-z", "A-Z", "0-9")(size || 32);
};

export { HIDE_METADATA, createLogger, generateId, levels, logger, shouldPublishLog };
