/**
 * Retrieve information via WebFinger.
 *
 * @module common/modules/WebFinger
 * @see {@link https://tools.ietf.org/html/rfc7033}
 */

/**
 * Do a webfinger request for Mastodon account at server.
 *
 * @private
 * @param {string} mastodonServer Mastodon server domain to query
 * @param {string} mastodonHandle
 * @returns {Promise} an (JSON) object
 */
function queryWebfinger(mastodonServer, mastodonHandle) {
    // Protocol MUST BE HTTPS (as per RFC7033 4.2.)
    return fetch(new URL(`https://${mastodonServer}/.well-known/webfinger?resource=acct:${mastodonHandle}`)).then(
        (response) => response.json()
    );
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
