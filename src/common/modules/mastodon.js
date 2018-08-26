// https://regex101.com/r/tZjwx7/1
const MASTODON_HANDLE_SPLIT = /^@?(.+)@(.*)$/;

/**
 * Do a webfinger request for Mastodon account at server.
 *
 * @private
 * @function
 * @param {string} mastodonServer Mastodon server domain to query
 * @param {string} mastodonHandle
 * @returns {Promise} an (JSON) object
 */
function getWebfinger(mastodonServer, mastodonHandle) {
    // protcol specified HTTPS must be used
    return fetch(new URL(`https://${mastodonServer}/.well-known/webfinger?resource=acct:${mastodonHandle}`)).then((response) => {
        return response.json();
    });
}

/**
 * Splits a Mastodon handle to return the username and server URL.
 *
 * @function
 * @param {string} mastodonHandle
 * @returns {{username: string, server: string}} username/server
 */
export function splitUserHandle(mastodonHandle) {
    const matches = MASTODON_HANDLE_SPLIT.exec(mastodonHandle);

    return {
        username: matches[1],
        server: matches[2]
    };
}

/**
 * Return the API endpoint (path) that handles these remote follows/interactions.
 *
 * You need to provide an existing Mastodon account/handle on that server.
 *
 * @function
 * @see https://github.com/tootsuite/mastodon/pull/8202
 * @param {{username: string, server: string}} mastodon User handle split by splitUserHandle
 * @param {string} uri a Mastodon hanlde (user account) to follow or toot URL
 * @returns {Promise} resulting in String (URL)
 */
export async function getSubscribeApiUrl(mastodon, uri) {
    const templatePlaceholder = "{uri}";
    const webfinger = await getWebfinger(mastodon.server, `${mastodon.username}@${mastodon.server}`);

    // TODO: change default to "/authorize_interaction?uri=" later
    let apiTemplate = `https://${mastodon.server}/authorize_follow?acct=${templatePlaceholder}`;

    for (const link of webfinger.links) {
        if (link.rel !== "http://ostatus.org/schema/1.0/subscribe") {
            continue;
        }

        apiTemplate = link.template;
    }

    return apiTemplate.replace(templatePlaceholder, uri);
}
