/**
 * Custom JS error types.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types}
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
