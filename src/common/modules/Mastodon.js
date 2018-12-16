/**
 * Module, that allows to retrieve general information about Mastodon.
 *
 * @module common/modules/Mastodon
 */

import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";

// https://regex101.com/r/dlnnSq/2
const MASTODON_HANDLE_SPLIT = /^@?([^@ ]+)@([^@ ]+)$/;

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
    return fetch(new URL(`https://${mastodonServer}/.well-known/webfinger?resource=acct:${mastodonHandle}`)).then(
        (response) => response.json()
    );
}

/**
 * Splits a Mastodon handle to return the username and server URL.
 *
 * @public
 * @param {string} mastodonHandle
 * @throws {TypeError}
 * @returns {{username: string, server: string}} username/server
 */
export function splitUserHandle(mastodonHandle) {
    const matches = MASTODON_HANDLE_SPLIT.exec(mastodonHandle);

    if (matches === null) {
        throw new TypeError("invalid Mastodon handle");
    }

    return {
        username: matches[1],
        server: matches[2]
    };
}

/**
 * Concatenates a Mastodon username and server to return the full user handle.
 *
 * In this definition a Mastodon handle is not prefixed with '@', i.e. not
 * '@user@example.com', but just 'user@example.com'. The function will remove
 * the 'at' char if it is prepended to the username.
 *
 * @public
 * @param {string} username
 * @param {string} server
 * @throws {TypeError} if the format is invalid
 * @returns {string}
 */
export function concatUserHandle(username, server) {
    // remove prefixed @ if needed
    if (username && username.startsWith("@")) {
        username = username.substring(1);
    }

    // sanity checks
    if (!server) {
        throw new TypeError("Server must not be empty.");
    }
    if (!username) {
        throw new TypeError("Username must not be empty.");
    }

    const mastodonHandle = `${username}@${server}`;

    if (!MASTODON_HANDLE_SPLIT.test(mastodonHandle)) {
        throw new TypeError("Username or server has invalid format.");
    }

    return mastodonHandle;
}

/**
 * Return the API endpoint (path) that handles these remote follows/interactions.
 *
 * You need to provide an existing Mastodon account/handle on that server.
 *
 * @function
 * @see https://github.com/tootsuite/mastodon/pull/8202
 * @param {{username: string, server: string}} mastodon User handle split by splitUserHandle
 * @param {string} uri a Mastodon handle (user account) to follow or toot URL
 * @param {boolean} [skipCache=false] set to true to ignore the cache
 * @returns {Promise} resulting in String (URL)
 */
export async function getSubscribeApiUrl(mastodon, uri, skipCache = false) {
    const templatePlaceholder = "{uri}";
    let apiTemplate = await AddonSettings.get("subscriptionUri");

    // fetch from WebFinger, if needed
    if (skipCache || !apiTemplate || !apiTemplate.startsWith(`https://${mastodon.server}/`)) {
        // default URI, if no cached value
        if (!apiTemplate) {
            apiTemplate = `https://${mastodon.server}/authorize_interaction?uri=${templatePlaceholder}`;
        }

        console.log(`Fetch subscribe API for "${mastodon.server}" via Webfinger.`);
        const webfinger = await getWebfinger(mastodon.server, `${mastodon.username}@${mastodon.server}`);

        for (const link of webfinger.links) {
            if (link.rel !== "http://ostatus.org/schema/1.0/subscribe") {
                continue;
            }

            apiTemplate = link.template;

            // save subscribe API in cache
            browser.storage.sync.set({
                subscriptionUri: apiTemplate
            });
            break;
        }
    }

    return apiTemplate.replace(templatePlaceholder, uri);
}
