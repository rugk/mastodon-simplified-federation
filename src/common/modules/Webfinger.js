/**
 * Retrieve information via WebFinger.
 *
 * @module common/modules/WebFinger
 * @see {@link https://tools.ietf.org/html/rfc7033}
 */

import { UnknownAccountError } from "/common/modules/Errors.js";
import * as NetworkTools from "/common/modules/NetworkTools.js";

/**
 * Do a webfinger request for Mastodon account at server.
 *
 * @private
 * @param {string} mastodonServer Mastodon server domain to query
 * @param {string} mastodonHandle
 * @returns {Promise} an (JSON) object
 */
function queryWebfinger(mastodonServer, mastodonHandle) {
    // Protocol MUST BE HTTPS (as per RFC 7033 4.2.)
    return NetworkTools.fetch(new URL(`https://${mastodonServer}/.well-known/webfinger?resource=acct:${mastodonHandle}`)).then((response) => {
        if (!response.ok) {
            console.error(`Error when fetching WebFinger for "${mastodonHandle}":`, response);

            // If, as per [RFC 7033 section 4.2](https://tools.ietf.org/html/rfc7033#section-4.2),
            // the server has no information about the account, they are required to return a
            // 404 error.
            if (response.status === 404) {
                throw new UnknownAccountError(mastodonHandle, `Mastodon account "${mastodonHandle}" does not exist.`);
            } else {
                // otherwise, we have a server outage or another serious problem
                throw new Error("Error while trying to fetch Webfinger.");
            }
        }

        return response.json();
    });
}

/**
 * Return some information from the WebFinger request of the server.
 *
 * @public
 * @param {{username: string, server: string}} mastodon User handle split by splitUserHandle
 * @param {string} [requestedRel] the "rel" attribute requested in the link object
 * @returns {Promise} resulting in Object or undefined
 */
export async function getWebfingerInfo(mastodon, requestedRel) {
    console.log(`Fetch "${requestedRel}" for "${mastodon.server}" via Webfinger.`);
    const webfinger = await queryWebfinger(mastodon.server, `${mastodon.username}@${mastodon.server}`);

    return webfinger.links.find((link) => {
        return link.rel === requestedRel;
    });
}
