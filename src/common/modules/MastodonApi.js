/**
 * Module, that uses the Mastodon API to retrieve information.
 *
 * @module common/modules/MastodonApi
 */

/**
 * Queries the status API for a toot.
 *
 * @public
 * @param {string} mastodonServer Mastodon server domain to query
 * @param {string} localTootId local ID of the toot
 * @returns {Promise} an (JSON) object
 */
export function getTootStatus(mastodonServer, localTootId) {
    // protcol specified HTTPS must be used
    return fetch(new URL(`https://${mastodonServer}/api/v1/statuses/${localTootId}`)).then((response) => {
        return response.json();
    });
}
