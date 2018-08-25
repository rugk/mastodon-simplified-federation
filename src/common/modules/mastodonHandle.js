// https://regex101.com/r/tZjwx7/1
const MASTODON_HANDLE_SPLIT = /^@?(.+)@(.*)$/;

/**
 * Splits a Mastodon handle to return the username and server URL.
 *
 * @function
 * @param {string} mastodonHandle
 * @returns {{username: string, server: string}} username/server
 */
export function splitMastodonHandle(mastodonHandle) {
    const matches = MASTODON_HANDLE_SPLIT.exec(mastodonHandle);

    return {
        username: matches[1],
        server: matches[2]
    };
}
