import * as mastodon from "/common/modules/mastodon.js";

import * as NetworkTools from "./NetworkTools.js";

// https://regex101.com/r/eKt3Fm/2
const REMOTE_FOLLOW_REGEX = /\/users\/(.+)\/remote_follow\/?$/;
// https://regex101.com/r/kyjiHj/2
const REMOTE_INTERACT_REGEX = /\/interact\/(\d+)\/?$/;

const MASTODON_INTERACTION_TYPE = Object.freeze({
    FOLLOW: Symbol("remote follow"),
    TOOT_INTERACT: Symbol("remote toot interact")
});

export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, MASTODON_INTERACTION_TYPE.FOLLOW);
CATCH_URLS.set(REMOTE_INTERACT_REGEX, MASTODON_INTERACTION_TYPE.TOOT_INTERACT);

/**
 * Find the follow URL.
 *
 * Rejects, if it is not Mastodon.
 *
 * @function
 * @private
 * @returns {Promise}
 */
function getFollowUrl() {
    // default = current tab
    return browser.tabs.executeScript(
        {
            file: "/content_script/findTootUrl.js",
            runAt: "document_end"
        }
    ).then((followUrl) => {
        if (!followUrl) {
            return Promise.reject(new Error("not Mastodon"));
        }

        return followUrl[0]; // I have no idea, why it is an array, here.
    });
}

/**
 * Redirects to a API endpoint of Mastodon for remote following.
 *
 * @function
 * @private
 * @param {string} uri a Mastodon hanlde (user account) to follow or toot URL
 * @returns {Promise}
 */
async function triggerRemoteAction(uri) {
    const handleObject = await browser.storage.sync.get("insertHandle");

    const ownMastodon = mastodon.splitUserHandle(handleObject.insertHandle);
    const mastodonApiUrl = await mastodon.getSubscribeApiUrl(ownMastodon, uri);

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
        const mastodonApiUrl = await mastodon.getSubscribeApiUrl(ownMastodon, uri, true);
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
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @returns {Promise}
 */
async function redirectToot() {
    const tootUrl = await getFollowUrl();

    return triggerRemoteAction(tootUrl);
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
function redirectFollow(url) {
    // Redirect remote_follow page to own instance directly
    const remoteUser = getUsername(url);
    if (!remoteUser) {
        throw new Error("Could not get remote from for Mastodon page.");
    }

    const remoteServer = url.host;
    return triggerRemoteAction(`${remoteUser}@${remoteServer}`);
}

/**
 * Returns the username of the given remote_follow page.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {string|undefined}
 */
function getUsername(url) {
    const match = REMOTE_FOLLOW_REGEX.exec(url.pathname);
    return match[1];
}

/**
 * Handle Mastodon URL.
 *
 * @function
 * @param {URL} url
 * @param {MASTODON_INTERACTION_TYPE} interactionType
 * @throws {Error}
 * @returns {Promise}
 */
export function handleSite(url, interactionType) {
    // ignore non-Mastodon URLs
    switch (interactionType) {
    case MASTODON_INTERACTION_TYPE.TOOT_INTERACT:
        // verify it is really Mastodon first
        return redirectToot();

    case MASTODON_INTERACTION_TYPE.FOLLOW:
        return redirectFollow(url);

    default:
        throw new Error(`unknown interaction type: ${interactionType.toString()}`);
    }
}
