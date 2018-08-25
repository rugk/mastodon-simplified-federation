// https://regex101.com/r/tZjwx7/1
const MASTODON_HANDLE_SPLIT = /^@?(.+)@(.*)$/;

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
 * Return the API endpoint (path) that handles these remote follows.
 *
 * @function
 * @see https://github.com/tootsuite/mastodon/pull/8202
 * @todo Make check dynamic!
 * @param {string} mastodonServer Mastodon server domain
 * @returns {string}
 */
export function getRemoteApi(mastodonServer) {
    if (mastodonServer === "mastodon.social") {
        // new API
        return "/authorize_interaction";
    }

    return "/authorize_follow";
}
