/**
 * Module, that actually redirects to your own Mastodon instance.
 *
 * @module MastodonRedirects
 */

import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";
import * as Mastodon from "/common/modules/Mastodon.js";

import * as NetworkTools from "/common/modules/NetworkTools.js";

let loadReplace = true; // default

/**
 * Enable or disable replacing of the current website when redirecting.
 *
 * @private
 * @param {boolean} newLoadReplace
 * @returns {void}
 */
export function enableLoadReplace(newLoadReplace) {
    if (newLoadReplace !== true && newLoadReplace !== false) {
        throw new TypeError(`Expected boolean, but got ${typeof newLoadReplace}.`);
    }

    loadReplace = newLoadReplace;
}

/**
 * Redirects to a API endpoint of Mastodon for remote following.
 *
 * @private
 * @param {string} uri a Mastodon handle (user account) to follow or toot URL
 * @returns {Promise}
 */
async function triggerRemoteAction(uri) {
    // get and assemble Mastodon object
    const ownMastodon = await AddonSettings.get("ownMastodon");

    // skip the subscribe/interact API if it is not needed, because it is your
    // own server
    if (uri.startsWith(`https://${ownMastodon.server}`)) {
        // just redirect to given input URL, if it is one the same server
        return NetworkTools.redirectToWebsite(uri, loadReplace);
    }

    const mastodonApiUrl = await Mastodon.getSubscribeApiUrl(ownMastodon, uri);

    // observe triggered request, so we can make sure it worked
    NetworkTools.waitForWebRequest(mastodonApiUrl, async (requestDetails) => {
        // if everything is okay, we are fine with that
        // Note even when a redirect is issued, we may want to clean cache and potentially redirect again
        if (requestDetails.statusCode === 200) {
            return;
        }

        // error happened, let's try redirect again without cache
        // (the API endpoint could have been changed)
        const mastodonApiUrl = await Mastodon.getSubscribeApiUrl(ownMastodon, uri, true);

        // only if this rettry fails, throw error
        NetworkTools.waitForWebRequest(mastodonApiUrl, (requestDetails) => {
            // if everything is okay, we are fine with that
            const firstDigit = requestDetails.statusCode.toString()[0];
            if (firstDigit !== "2" && firstDigit !== "3") {
                console.error(`Could not successful redirect to ${mastodonApiUrl}`, requestDetails);
                throw new Error(`Redirecting to "${mastodonApiUrl}" failed with error code ${requestDetails.statusCode}.`);
            }
        });

        // redirect and always replace site, as before an invalid site has been loaded
        // (we never need to preserve an invalid site)
        NetworkTools.redirectToWebsite(mastodonApiUrl, true);
    });

    // finally redirect
    return NetworkTools.redirectToWebsite(mastodonApiUrl, loadReplace);
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
