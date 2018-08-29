/**
 * Module, that actually redirects to your own Mastodon instance.
 *
 * @module MastodonRedirects
 */

import * as Mastodon from "/common/modules/Mastodon.js";

import * as NetworkTools from "./NetworkTools.js";

/**
 * Redirects to a API endpoint of Mastodon for remote following.
 *
 * @private
 * @function
 * @param {string} uri a Mastodon hanlde (user account) to follow or toot URL
 * @returns {Promise}
 */
async function triggerRemoteAction(uri) {
    const handleObject = await browser.storage.sync.get("insertHandle");

    const ownMastodon = Mastodon.splitUserHandle(handleObject.insertHandle);
    const mastodonApiUrl = await Mastodon.getSubscribeApiUrl(ownMastodon, uri);

    const url = (new URL(mastodonApiUrl)).toString();

    // observe triggered request, so we can make sure it
    const verifyRequest = async (requestDetails) => {
        // cleanup listener
        browser.webRequest.onCompleted.removeListener(verifyRequest);

        // if everything is okay, we are fine with that
        if (requestDetails.statusCode === 200) {
            return;
        }

        // error happened, let's try redirect again without cache
        // (the APi endpoint could have been changed)
        const mastodonApiUrl = await Mastodon.getSubscribeApiUrl(ownMastodon, uri, true);
        const url = (new URL(mastodonApiUrl)).toString();

        browser.tabs.update({
            loadReplace: true,
            url: url
        });
    };

    NetworkTools.webRequestListen(url, "onCompleted", verifyRequest);

    // finally redirect
    return browser.tabs.update({
        loadReplace: true,
        url: url
    });
}

/**
 * Redirects to your toot interaction site.
 *
 * @private
 * @param {string} tootUrl the URL to redirect too
 * @returns {Promise}
 */
export function redirectToot(tootUrl) {
    return triggerRemoteAction(tootUrl);
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @param {string} remoteUser
 * @param {string} remoteServer
 * @returns {Promise}
 */
export function redirectFollow(remoteUser, remoteServer) {
    if (!remoteUser) {
        throw new Error("Could not get remote from for Mastodon page.");
    }

    return triggerRemoteAction(`${remoteUser}@${remoteServer}`);
}
