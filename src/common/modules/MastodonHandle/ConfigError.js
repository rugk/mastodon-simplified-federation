/**
 * This mdoules contains the custom triggers for some options that are added.
 *
 * @module MastodonHandle/ConfigError
 */

import * as CommonMessages from "/common/modules/MessageHandler/CommonMessages.js";

/**
 * Explains the different errors a Mastodon handle can be invalid.
 *
 * @export
 * @class
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types}
 */
export class MastodonHandleError extends Error {
    /**
     * Error to use, when the Mastodon handle is invalid.
     *
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types}
     * @param {ERROR_TYPE} errorType the detected error type
     * @param {Error} [originalError] original thrown error, if available
     * @param {string} [message]
     */
    constructor(errorType, originalError, message, ...params) {
        // default error message
        if (!message) {
            message = errorType.toString();
        }

        // Pass arguments (including vendor specific ones) to parent constructor
        super(message, ...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MastodonHandleError);
        }

        // Custom debugging information
        this.errorType = errorType;
        this.originalError = originalError;
    }
}

/**
 * Constants defining the different errors a Mastodon handle can be invalid.
 *
 * @public
 * @const
 * @type {Object}
 */
export const ERROR_TYPE = Object.freeze({
    NOT_CONFIGURED: Symbol("empty Mastodon handle, not yet configured"),
    IS_EMPTY: Symbol("empty Mastodon handle"),
    SYNTAX_IS_INVALID: Symbol("invalid Mastodon handle"),
    ACCOUNT_NON_EXISTANT: Symbol("Mastodon account does not exist"),
    NETWORK_ERROR: Symbol("Mastodon server could not be contacted, network error."),
    NO_MASTODON_SERVER: Symbol("Server is no Mastodon server"),
    HANDLE_CHECK_FAILED: Symbol("Could not check Mastodon handle")
});

let mastodonHandleErrorTypeShown = null;

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @public
 * @param {Object} options
 * @returns {void}
 */
export function hideMastodonError(options = {animate: true}) {
    switch (getErrorShown()) {
    case ERROR_TYPE.NOT_CONFIGURED:
    case ERROR_TYPE.IS_EMPTY:
        CommonMessages.hideWarning(options);
        break;
    case ERROR_TYPE.SYNTAX_IS_INVALID:
    case ERROR_TYPE.ACCOUNT_NON_EXISTANT:
    case ERROR_TYPE.NETWORK_ERROR:
    case ERROR_TYPE.NO_MASTODON_SERVER:
    case ERROR_TYPE.HANDLE_CHECK_FAILED:
        CommonMessages.hideError(options);
        break;
    case null:
        // no error show, so cannot hide anything
        // console.warn("Tried to hide Mastodon handle error altghough no one is shown.");
        return;
    default:
        throw new Error(`invalid error type "${getErrorShown()}" is saved`);
    }

    mastodonHandleErrorTypeShown = null;
}

/**
 * Returns the error type from an input value as error type or full error.
 *
 * @private
 * @param {ERROR_TYPE|MastodonHandleError} type error type or error itself
 * @returns {ERROR_TYPE}
 * @throws {Error}
 */
function getErrorType(type) {
    if (type instanceof MastodonHandleError) {
        return type.errorType;
    } else if (Object.values(ERROR_TYPE).includes(type)) {
        return type;
    } else {
        throw new TypeError(`Input error type "${type.toString()}" is invalid.`);
    }
}

/**
 * Return the (i18n) message for an error.
 *
 * @public
 * @param {ERROR_TYPE|MastodonHandleError} type error type or error itself
 * @returns {string}
 * @throws {TypeError} if invalid type is passed
 */
export function getMastodonErrorString(type) {
    type = getErrorType(type);

    switch (type) {
    case ERROR_TYPE.NOT_CONFIGURED:
    case ERROR_TYPE.IS_EMPTY:
        return "mastodonHandleIsEmpty";
    case ERROR_TYPE.SYNTAX_IS_INVALID:
        return "mastodonHandleIsInvalid";
    case ERROR_TYPE.ACCOUNT_NON_EXISTANT:
        return "mastodonHandleDoesNotExist";
    case ERROR_TYPE.NETWORK_ERROR:
        return "mastodonHandleServerCouldNotBeContacted";
    case ERROR_TYPE.NO_MASTODON_SERVER:
        return "isNoMastodonServer";
    case ERROR_TYPE.HANDLE_CHECK_FAILED:
        return "mastodonHandleCheckFailed";
    default:
        throw new TypeError(`Invalid error type "${type.toString()}" has been passed.`);
    }
}

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @public
 * @param {ERROR_TYPE|MastodonHandleError} type error type or error itself
 * @returns {void}
 */
export function showMastodonHandleError(type) {
    type = getErrorType(type);

    // if error is already shown, return
    if (getErrorShown() === type) {
        return;
    }

    // hide "old" error, if needed
    hideMastodonError({animate: false});

    const message = getMastodonErrorString(type);

    switch (type) {
    case ERROR_TYPE.NOT_CONFIGURED:
    case ERROR_TYPE.IS_EMPTY:
        CommonMessages.showWarning("mastodonHandleIsEmpty");
        break;
    default:
        CommonMessages.showError(message);
        break;
    }

    mastodonHandleErrorTypeShown = type;
}

/**
 * Returns the error that is currently shown.
 *
 * Returns "null" if no error is shown.
 *
 * @public
 * @returns {ERROR_TYPE|null}
 */
export function getErrorShown() {
    return mastodonHandleErrorTypeShown;
}

/**
 * Return whether an error si currently shown.
 *
 * @public
 * @returns {boolean}
 */
export function isErrorShown() {
    return getErrorShown() !== null;
}
