// https://regex101.com/r/eKt3Fm/2
const REMOTE_FOLLOW_REGEX = /\/users\/(.+)\/remote_follow\/?$/;
// https://regex101.com/r/kyjiHj/2
const REMOTE_INTERACT_REGEX = /\/interact\/(\d+)\/?$/;

import {splitMastodonHandle} from "/common/modules/mastodonHandle.js";

const MASTODON_INTERACTION_TYPE = Object.freeze({
    FOLLOW: Symbol("mastodon remote follow"),
    TOOT_INTERACT: Symbol("mastodon remote toot interact")
});

/**
 * Saves the information about the parent tab and their state.
 *
 * @function
 * @private
 * @param {integer} tabId
 * @param {Object} changeInfo
 * @returns {Promise}
 */
function handleTabUpdate(tabId, changeInfo) {
    // ignore when URL is not changed
    if (!changeInfo.url) {
        return Promise.reject(new Error("URL info not available"));
    }

    const url = new URL(changeInfo.url);

    const mastodonInteraction = getMastodonInteractionType(url);

    // ignore non-Mastodon URLs
    switch (mastodonInteraction) {
    case null:
        return Promise.resolve();

    case MASTODON_INTERACTION_TYPE.TOOT_INTERACT: {
        // verify it is really Mastodon first
        return verifyItIsMastodon().then(() => {
            return redirectToot(url);
        });
    }
    case MASTODON_INTERACTION_TYPE.FOLLOW:
        return redirectFollow(url);

    default:
        throw new Error(`unknown interaction type: ${mastodonInteraction.toString()}`);
    }
}


/**
 * Verifies the current tab is a Mastodon instance.
 *
 * Rejects, if it is not Mastodon.
 *
 * @function
 * @private
 * @returns {Promise}
 */
function verifyItIsMastodon() {
    // default = current tab
    return browser.tabs.executeScript(
        {
            file: "/content_script/verifyItIsMastodon.js",
            runAt: "document_end"
        }
    ).then((isMastodon) => {
        if (!isMastodon) {
            return Promise.reject(new Error("not Mastodon"));
        }

        return true;
    });

}

/**
 * Redirects to a given path on your own instance.
 *
 * @function
 * @private
 * @param {string} path
 * @param {Promise} [gettingHandle] storage call to get own Mastodon handle
 * @returns {Promise}
 */
async function redirectTo(path, gettingHandle) {
    if (gettingHandle === undefined) {
        gettingHandle = browser.storage.sync.get("insertHandle");
    }

    const handleObject = await gettingHandle;

    const ownMastodon = splitMastodonHandle(handleObject.insertHandle);

    // construct new URL and redirect
    return browser.tabs.update({
        loadReplace: true,
        // NOTE: This assumes the own server runs on HTTPS, but hey, it really should nowadays!
        url: (new URL(`https://${ownMastodon.server}${path}`)).toString()
    });
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {MASTODON_INTERACTION_TYPE|null}
 */
function getMastodonInteractionType(url) {
    if (url.pathname.match(REMOTE_FOLLOW_REGEX)) {
        return MASTODON_INTERACTION_TYPE.FOLLOW;
    }

    if (url.pathname.match(REMOTE_INTERACT_REGEX)) {
        return MASTODON_INTERACTION_TYPE.TOOT_INTERACT;
    }

    return null;
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
function redirectToot(url) {
    const gettingHandle = browser.storage.sync.get("insertHandle");

    // Redirect remote_follow page to own instance directly
    const tootId = getTootId(url);
    if (!tootId) {
        throw new Error("Could not get toot ID from Mastodon page.");
    }

    // https://mastodon.social/authorize_interaction?uri=
    return redirectTo(`/web/statuses/${tootId}`, gettingHandle);
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
    const gettingHandle = browser.storage.sync.get("insertHandle");

    // Redirect remote_follow page to own instance directly
    const remoteUser = getUsername(url);
    if (!remoteUser) {
        throw new Error("Could not get remote from for Mastodon page.");
    }

    const remoteServer = url.host;
    return redirectTo(`/authorize_follow?acct=${remoteUser}@${remoteServer}`, gettingHandle);
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
 * Returns the toot ID of the given interact page.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {string|undefined}
 */
function getTootId(url) {
    const match = REMOTE_INTERACT_REGEX.exec(url.pathname);
    return match[1];
}

/**
 * Init AutoRemoteFollower module.
 *
 * @function
 * @returns {Promise}
 */
function init() {
    browser.tabs.onUpdated.addListener(handleTabUpdate);
}

init();
