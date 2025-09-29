// Logger utility that respects environment
import { reactEnv } from "../config/envConfig";

export const logger = {
  log: (...args: unknown[]) => {
    if (reactEnv === "development") {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (reactEnv === "development") {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  info: (...args: unknown[]) => {
    if (reactEnv === "development") {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (reactEnv === "development") {
      console.debug(...args);
    }
  },
};

// For production builds
if (reactEnv === "production") {
  // Uncomment the lines below to completely disable console in production
  // console.log = () => {};
  // console.warn = () => {};
  // console.info = () => {};
  // console.debug = () => {};
}
