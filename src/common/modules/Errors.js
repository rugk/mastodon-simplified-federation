/**
 * Module, that detects a GNU Social instance and returns the required values.
 *
 * @module Errors
 */

export class NotSupportedError extends Error {
    constructor(...params) {
        // Pass arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotSupportedError);
        }
    }
}
