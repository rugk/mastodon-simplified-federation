/**
 * Module, that uses the Mastodon API to retrieve information.
 *
 * @module common/modules/MastodonApi
 */

import * as NetworkTools from "/common/modules/NetworkTools.js";

/**
 * Mastodon Server API error
 *
 * @class
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types}
 */
class MastodonApiError extends Error {
    /**
     * Error to use, when the Mastodon API returns an error.
     *
     * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types}
     * @param {string} mastodonServer the affected server
     * @param {Response} response result of fetch
     */
    constructor(mastodonServer, response, ...params) {
        // Pass arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MastodonApiError);
        }

        // Custom debugging information
        this.mastodonServer = mastodonServer;

        // default error message
        if (!this.message) {
            this.message = `Mastodon server API at "${mastodonServer}" replied with an ${response.status} error.`;
        }
    }
}

/**
 * Queries the server to find out information about the Mastodon server/instance.
 *
 * @private
 * @param {string} mastodonServer Mastodon server domain to query
 * @returns {Promise} a JSON object
 */
function getMastodonInstanceInfo(mastodonServer) {
    // protcol specified HTTPS must be used
    return NetworkTools.fetch(new URL(`https://${mastodonServer}/api/v1/instance`)).then((response) => {
        if (!response.ok) {
            throw new MastodonApiError(mastodonServer, response, `"${mastodonServer}" is no Mastodon server.`);
        }

        return response.json();
    });
}

/**
 * Queries the server to find out whether it is a Mastodon server.
 *
 * @public
 * @param {string} mastodonServer Mastodon server domain to query
 * @returns {Promise} a boolean
 */
export function isMastodonServer(mastodonServer) {
    // protcol specified HTTPS must be used
    return getMastodonInstanceInfo(mastodonServer).then(
        () => true
    ).catch((error) => {
        // "soften" any valid server response that "just" errors to indicate
        // that this is not a Mastodon server.
        if (error instanceof MastodonApiError) {
            return false;
        }

        // otherwise rethrow
        throw error;
    });
}

/**
 * Queries the status API for a toot.
 *
 * @public
 * @param {string} mastodonServer Mastodon server domain to query
 * @param {string} localTootId local ID of the toot
 * @returns {Promise} an (JSON) object
 * @throws {MastodonApiError} in case the data cannot be fetched
 */
export function getTootStatus(mastodonServer, localTootId) {
    // protcol specified HTTPS must be used
    return NetworkTools.fetch(new URL(`https://${mastodonServer}/api/v1/statuses/${localTootId}`)).then((response) => {
        if (!response.ok) {
            throw new MastodonApiError(mastodonServer, response, `"${mastodonServer}" .`);
        }

        return response.json();
    });
}
