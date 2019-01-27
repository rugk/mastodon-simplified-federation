/**
 * Module to verify whether the user properly setup the config.
 *
 * @module MastodonHandle/ConfigCheck
 */

import isPlainObject from "/common/modules/lodash/isPlainObject.js";

import { UnknownAccountError } from "/common/modules/Errors.js";

import * as Mastodon from "/common/modules/Mastodon.js";
import * as MastodonApi from "/common/modules/MastodonApi.js";
import * as MastodonHandleError from "./ConfigError.js";

/**
 * Callback to run when an error is found.
 *
 * It is called _before_ the actual error is shown, so you can prepare showing
 * that error.
 *
 * @async
 * @callback errorCallback
 * @param {MastodonHandleError.MASTODON_HANDLE_ERROR} type the detected error
 * @param {string} mastodonHandle the original Mastodon handle value
 * @return {void}
 */

let errorCallback;

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @private
 * @param {MastodonHandleError.MASTODON_HANDLE_ERROR} type the detected error
 * @param {string} mastodonHandle the original Mastodon handle value
 * @returns {type}
 */
function showMastodonHandleError(type, mastodonHandle) {
    errorCallback(type, mastodonHandle);

    MastodonHandleError.showMastodonHandleError(type);
    return type;
}

/**
 * Set an callback for when an error is detected.
 *
 * @public
 * @param {errorCallback} callback
 * @returns {void}
 */
export function setErrorCallback(callback) {
    errorCallback = callback;
}

/**
 * Verifies, if the user properly setup the option on the options page.
 *
 * If verification worked, it returns the `splitHandle` and `accountLink` in an
 * object. Note the `accountLink` is not there, if you set "options.ignoreSplitHandles"
 * to true or disable network checks via "options.networkChecks".
 *
 * @public
 * @param  {string|Object|null} mastodonHandle
 * @param  {Object} options additional options
 * @param  {Object} [options.ignoreSplitHandles=false] ignore, if handle is
 *              already split, i.e. show no error
 * @param  {Object} [options.doNotThrowForNull=false] ignores, if the mastodon
 *              handle is already null
 * @param  {Object} [options.networkChecks=true] disable to not query any
 *              network during verifying, but just "static" verification.
 *              If you do so, the tests also end very fast and are quite
 *              syncronous, so the Promise is not really going to be used.
 * @returns {Promise}
 * @throws {Error} if invalid
 */
export async function verifyUserConfig(mastodonHandle, options = {
    ignoreSplitHandles: false,
    doNotThrowForNull: false,
    networkChecks: true
}) {
    let splitHandle;

    // default option, string not yet set
    if (mastodonHandle === null) {
        showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.IS_EMPTY, mastodonHandle);

        if (options.doNotThrowForNull === true) {
            // do NOT throw error as first loading has to suceed!
            return null;
        }

        // otherwise throw
        throw new Error(MastodonHandleError.MASTODON_HANDLE_ERROR.IS_EMPTY.toString());
    }

    // simple empty check
    if (mastodonHandle === "") {
        showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.IS_EMPTY, mastodonHandle);
        throw new Error(MastodonHandleError.MASTODON_HANDLE_ERROR.IS_EMPTY.toString());
    }

    // ignore options directly loaded from the settings, these are always valid
    if (isPlainObject(mastodonHandle)) {
        if (options.ignoreSplitHandles === true) {
            // hide "old" error, if needed
            MastodonHandleError.hideMastodonError({animate: false});

            return {splitHandle: mastodonHandle};
        }

        // otherwise, we can continue checking
        splitHandle = mastodonHandle;
    }

    // check vadility (syntax)
    try {
        splitHandle = Mastodon.splitUserHandle(mastodonHandle);
    } catch (error) {
        showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.SYNTAX_IS_INVALID, mastodonHandle);

        // re-throw to prevent saving
        throw error;
    }

    // stop here if no network checks are allowed, these are done further down
    if (options.networkChecks === false) {
        return {splitHandle};
    }

    // check whether server is really a Mastodon server
    const isMastodonServer = await MastodonApi.isMastodonServer(splitHandle.server).catch((error) => {
        if (error instanceof TypeError) {
            // error by .fetch, likely unknown/wrong server
            showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.NETWORK_ERROR, mastodonHandle);
        } else {
            showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.HANDLE_CHECK_FAILED, mastodonHandle);
        }

        // re-throw to prevent saving
        throw error;
    }).then((isMastodonServer) => {
        // ignore, if it is a valid Mastodon server
        if (isMastodonServer) {
            return true;
        }

        showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.NO_MASTODON_SERVER, mastodonHandle);

        throw new Error(MastodonHandleError.MASTODON_HANDLE_ERROR.NO_MASTODON_SERVER.toString());
    });

    // check existance of handle (and/on) server
    const accountLink = await Mastodon.getAccountLink(splitHandle).catch((error) => {
        // only if we are sure it is no Mastodon server display that as a result
        if (isMastodonServer === false) {
            // re-throw to prevent saving
            throw error;
        }

        if (error instanceof UnknownAccountError) {
            showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.ACCOUNT_NON_EXISTANT, mastodonHandle);
        } else if (error instanceof TypeError) {
            // error by .fetch, likely unknown/wrong server
            showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.NETWORK_ERROR, mastodonHandle);
        } else {
            showMastodonHandleError(MastodonHandleError.MASTODON_HANDLE_ERROR.HANDLE_CHECK_FAILED, mastodonHandle);
        }

        // re-throw to prevent saving
        throw error;
    });

    return {splitHandle, accountLink};
}
