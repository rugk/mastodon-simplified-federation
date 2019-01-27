/**
 * This mdoules contains the custom triggers for some options that are added.
 *
 * @module MastodonHandleError
 */

import * as CommonMessages from "/common/modules/MessageHandler/CommonMessages.js";

/**
 * Constants defining the different errors a Mastodon handle can be invalid.
 *
 * @public
 * @const
 * @type {Object}
 */
export const MASTODON_HANDLE_ERROR = Object.freeze({
    SYNTAX_IS_INVALID: Symbol("invalid Mastodon handle"),
    IS_EMPTY: Symbol("empty Mastodon handle"),
    ACCOUNT_NON_EXISTANT: Symbol("Mastodon account does not exist"),
    NETWORK_ERROR: Symbol("Mastodon server could not be contacted, network error."),
    NO_MASTODON_SERVER: Symbol("Server is no Mastodon server"),
    HANDLE_CHECK_FAILED: Symbol("Could not check Mastodon handle")
});

let mastodonHandleErrorShown = null;

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @public
 * @param {Object} options
 * @returns {void}
 */
export function hideMastodonError(options = {animate: true}) {
    switch (getErrorShown()) {
    case MASTODON_HANDLE_ERROR.IS_EMPTY:
        CommonMessages.hideWarning(options);
        break;
    case MASTODON_HANDLE_ERROR.SYNTAX_IS_INVALID:
    case MASTODON_HANDLE_ERROR.ACCOUNT_NON_EXISTANT:
    case MASTODON_HANDLE_ERROR.NETWORK_ERROR:
    case MASTODON_HANDLE_ERROR.NO_MASTODON_SERVER:
    case MASTODON_HANDLE_ERROR.HANDLE_CHECK_FAILED:
        CommonMessages.hideError(options);
        break;
    case null:
        // no error show, so cannot hide anything
        // console.warn("Tried to hide Mastodon handle error altghough no one is shown.");
        return;
    default:
        throw new Error(`invalid error type "${getErrorShown()}" is saved`);
    }

    mastodonHandleErrorShown = null;
}

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @public
 * @param {MASTODON_HANDLE_ERROR} type
 * @returns {void}
 */
export function showMastodonHandleError(type) {
    // hide "old" error, if needed
    hideMastodonError({animate: false});

    switch (type) {
    case MASTODON_HANDLE_ERROR.IS_EMPTY:
        CommonMessages.showWarning("mastodonHandleIsEmpty");
        break;
    case MASTODON_HANDLE_ERROR.SYNTAX_IS_INVALID:
        CommonMessages.showError("mastodonHandleIsInvalid");
        break;
    case MASTODON_HANDLE_ERROR.ACCOUNT_NON_EXISTANT:
        CommonMessages.showError("mastodonHandleDoesNotExist");
        break;
    case MASTODON_HANDLE_ERROR.NETWORK_ERROR:
        CommonMessages.showError("mastodonHandleServerCouldNotBeContacted");
        break;
    case MASTODON_HANDLE_ERROR.NO_MASTODON_SERVER:
        CommonMessages.showError("isNoMastodonServer");
        break;
    case MASTODON_HANDLE_ERROR.HANDLE_CHECK_FAILED:
        CommonMessages.showError("mastodonHandleCheckFailed");
        break;
    default:
        throw new TypeError(`invalid error type "${type.toString()}" has been given`);
    }

    mastodonHandleErrorShown = type;
}

/**
 * Returns the error that is currently shown.
 *
 * Returns "null" if no error is shown.
 *
 * @public
 * @returns {MASTODON_HANDLE_ERROR|null}
 */
export function getErrorShown() {
    return mastodonHandleErrorShown;
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
