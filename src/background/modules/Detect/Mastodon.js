/**
 * Module, that detects a Mastodon instance and returns the required values.
 *
 * @module Detect/Mastodon.js
 */

import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

// https://regex101.com/r/eKt3Fm/2
const REMOTE_FOLLOW_REGEX = /\/users\/(.+)\/remote_follow\/?$/;
// https://regex101.com/r/kyjiHj/2
const REMOTE_INTERACT_REGEX = /\/interact\/(\d+)\/?$/;

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, INTERACTION_TYPE.FOLLOW);
CATCH_URLS.set(REMOTE_INTERACT_REGEX, INTERACTION_TYPE.TOOT_INTERACT);

/**
 * Find the follow URL.
 *
 * Rejects, if it is not Mastodon.
 *
 * @function
 * @private
 * @returns {Promise}
 */
export function getTootUrl() {
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
 * Returns the username of the given remote_follow page.
 *
 * @private
 * @function
 * @param {URL} url
 * @returns {string|undefined}
 */
export function getUsername(url) {
    const match = REMOTE_FOLLOW_REGEX.exec(url.pathname);
    return match[1];
}

/**
 * Returns the server from the required URL.
 *
 * @function
 * @param {URL} url
 * @returns {string|undefined}
 */
export function getServer(url) {
    return url.host;
}
