/**
 * Module to verify whether the user properly setup the config.
 *
 * @module MastodonHandle/ConfigCheck
 */

import isPlainObject from "/common/modules/lodash/isPlainObject.js";

import { UnknownAccountError } from "/common/modules/Errors.js";

import * as Mastodon from "/common/modules/Mastodon.js";
import * as MastodonApi from "/common/modules/MastodonApi.js";
import * as ConfigError from "./ConfigError.js";

/**
 * Verifies, if the Mastodon handle is valid using just "static" syntax verification.
 *
 * The tests also end very fast and are quite syncronous, so the Promise is not
 * really going to be used.
 *
 * @public
 * @param  {string|Object|null} mastodonHandle
 * @returns {Object|null} split Mastodon handle or if not possible "null"
 * @throws {ConfigError.MastodonHandleError} rejects if invalid
 */
export function verifyStatically(mastodonHandle) {
    let splitHandle;

    // default option, string not yet set
    if (mastodonHandle === null) {
        // otherwise throw
        throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.NOT_CONFIGURED);
    }

    // simple empty check
    if (mastodonHandle === "") {
        throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.IS_EMPTY);
    }

    // ignore options directly loaded from the settings, these are always valid
    if (isPlainObject(mastodonHandle)) {
        return mastodonHandle;
    }

    // check vadility (syntax)
    try {
        splitHandle = Mastodon.splitUserHandle(mastodonHandle);
    } catch (error) {
        // re-throw to prevent saving
        throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.SYNTAX_IS_INVALID, error);
    }

    return splitHandle;
}

/**
 * Verifies, if the Mastodon handle is actually (semantically) valid, i.e. exists
 * on server.
 *
 * Note you should verify the handle statically before, obviously, see {@link verifyStatically}.
 *
 * @public
 * @param  {Object} splitHandle
 * @returns {Promise} Object with `accountLink` for link to user account
 * @throws {ConfigError.MastodonHandleError} rejects if invalid
 */
export async function verifyAccount(splitHandle) {
    // check whether server is really a Mastodon server
    const isMastodonServer = await MastodonApi.isMastodonServer(splitHandle.server).catch((error) => {
        if (error instanceof TypeError) {
            // error by .fetch, likely unknown/wrong server
            throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.NETWORK_ERROR, error);
        } else {
            throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.HANDLE_CHECK_FAILED, error);
        }
    }).then((isMastodonServer) => {
        // ignore, if it is a valid Mastodon server
        if (isMastodonServer) {
            return true;
        }


        throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.NO_MASTODON_SERVER);
    });

    // check existance of handle (and/on) server
    const accountLink = await Mastodon.getAccountLink(splitHandle).catch((error) => {
        // only if we are sure it is no Mastodon server display that as a result
        if (isMastodonServer === false) {
            // re-throw to prevent saving
            throw error;
        }

        if (error instanceof UnknownAccountError) {
            throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.ACCOUNT_NON_EXISTANT, error);
        } else if (error instanceof TypeError) {
            // error by .fetch, likely unknown/wrong server
            throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.NETWORK_ERROR, error);
        } else {
            throw new ConfigError.MastodonHandleError(ConfigError.ERROR_TYPE.HANDLE_CHECK_FAILED, error);
        }
    });

    return {accountLink};
}

/**
 * Verifies, if the Mastodon handle is actually syntactically and semantically
 * valid.
 *
 * @public
 * @param  {string|Object|null} mastodonHandle
 * @returns {Promise} Object with `splitHandle` and `accountLink` for link to user account
 * @throws {ConfigError.MastodonHandleError} rejects if invalid
 */
export async function verifyComplete(mastodonHandle) {
    // using await and async here, so error is converted into rejected promise
    const splitHandle = await verifyStatically(mastodonHandle);

    return verifyAccount(splitHandle).then((networkResults) => {
        // combine results
        networkResults.splitHandle = splitHandle;
        return networkResults;
    });
}
