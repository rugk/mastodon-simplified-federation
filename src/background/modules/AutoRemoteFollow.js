// https://regex101.com/r/eKt3Fm/2
const REMOTE_FOLLOW_REGEX = /\/users\/(.+)\/remote_follow\/?$/;
// https://regex101.com/r/kyjiHj/2
const REMOTE_INTERACT_REGEX = /\/interact\/(\d+)\/?$/;

import {splitMastodonHandle} from "/common/modules/mastodonHandle.js";

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
        return Promise.resolve();
    }

    const url = new URL(changeInfo.url);

    // ignore non-Mastodon URLs
    const mastodonInteraction = isMastodonInteraction(url);
    if (mastodonInteraction === false) {
        return Promise.resolve();
    }

    // fallback to content script, if page is unsure
    if (mastodonInteraction === null) {
        // default = current tab
        browser.tabs.executeScript(
            {
                file: "/content_script/mastodon.js",
                runAt: "document_end"
            }
        );
        return Promise.resolve();
    }

    const gettingHandle = browser.storage.sync.get("insertHandle");

    // Redirect remote_follow page to own instance directly
    const remoteUser = getUsername(url);
    if (!remoteUser) {
        throw new Error("Could not get remote username for Mastodon page.");
    }

    return gettingHandle.then((handleObject) => {
        const ownMastodon = splitMastodonHandle(handleObject.insertHandle);
        const remoteServer = url.host;

        // construct new URL and redirect
        return browser.tabs.update({
            loadReplace: true,
            // NOTE: This assumes the own server runs on HTTPS, but hey, it really should nowadays!
            url: (new URL(`https://${ownMastodon.server}/authorize_follow?acct=${remoteUser}@${remoteServer}`)).toString()
        });
    });
}

/**
 * Checks whether the given URL is (likely) a social remote interaction/follow
 * URL of Mastodon.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {boolean|null} it returns "null" when it is not sure whether it is
 * a Mastodon instance or not.
 */
function isMastodonInteraction(url) {
    if (url.pathname.match(REMOTE_FOLLOW_REGEX)) {
        return true;
    }

    if (url.pathname.match(REMOTE_INTERACT_REGEX)) {
        return null; // url is not so stable
    }

    return false;
}

/**
 * Returns the username of the given remote_follow page.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {string}
 */
function getUsername(url) {
    const match = REMOTE_FOLLOW_REGEX.exec(url.pathname);
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
