/**
 * Module, that detects a Mastodon instance and returns the required values.
 *
 * @module Detect/Mastodon.js
 */

import * as NetworkTools from "/common/modules/NetworkTools.js";

import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";
import * as MastodonApi from "/common/modules/MastodonApi.js";

import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

// https://regex101.com/r/eKt3Fm/2
const REMOTE_FOLLOW_REGEX = /\/users\/(.+)\/remote_follow\/?$/;
// https://regex101.com/r/kyjiHj/2
const REMOTE_INTERACT_REGEX = /\/interact\/(\d+)\/?$/;

// static URL of Mastodon server,
const TOOT_INTERACTION_URL = "https://{mastodonServer}/web/statuses/{tootId}";

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, INTERACTION_TYPE.FOLLOW);
CATCH_URLS.set(REMOTE_INTERACT_REGEX, INTERACTION_TYPE.TOOT_INTERACT);

/**
 * Whether to enable replacing the previous site when redirecting or not.
 *
 * @public
 * @type {boolean}
 */
export const ENABLE_LOAD_REPLACE = true;

/**
 * Scrapes the toot URL from the HTML page, if needed.
 *
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
function scrapeTootUrlFromPage(url) {
    return NetworkTools.waitForWebRequest(url, () => {
        // inject content script to get toot URL
        // default = current tab
        return browser.tabs.executeScript(
            {
                file: "/content_script/mastodonFindTootUrl.js",
                runAt: "document_end"
            }
        ).then((followUrl) => {
            if (!followUrl) {
                throw new Error("Could not get toot URL from Mastodon page.");
            }

            // I have no idea, why it is an array, here.
            followUrl = followUrl[0];

            // verify it is a real URL
            try {
                new URL(followUrl);
            } catch (e) {
                throw new Error(`HTML scraping returned invalid URL: ${followUrl}`);
            }

            return followUrl;
        });
    });
}

/**
 * Returns the (local) toot ID of the given interact page.
 *
 * Note the returned ID is the local one of the current server, as it is just
 * extracted from the URL.
 *
 * Also notice a string is returned and not a number, as JS cannot safely handle
 * such big numbers.
 * This does expect a valid input and does not re-check the URL format.
 *
 * @private
 * @param {URL} url
 * @returns {string}
 */
function getTootId(url) {
    // just find number at the end
    return url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
}

/**
 * Find the follow URL.
 *
 * Rejects, if it is not Mastodon.
 *
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
export function getTootUrl(url) {
    const mastodonServer = url.host;
    // query the server about the remote URL
    const localTootId = getTootId(url);

    // if this is your local server, you can obviously directly redirect and
    // use the local toot ID/URL
    const fromStaticOwnServer = AddonSettings.get("ownMastodon").then((ownMastodon) => {
        if (mastodonServer !== ownMastodon.server) {
            return Promise.reject(new Error(`${mastodonServer} is not own server.`));
        }

        // this does skip the usual subscripe/interact API
        let newUrl = TOOT_INTERACTION_URL;
        newUrl = newUrl.replace("{mastodonServer}", mastodonServer);
        newUrl = newUrl.replace("{tootId}", localTootId);

        return newUrl;
    });

    // try scrape method
    const scrapFromHtml = scrapeTootUrlFromPage(url);

    // thanks https://discourse.joinmastodon.org/t/how-to-get-url-of-toot-from-toot-id/1335/2?u=rugk
    const getFromApiQuery = MastodonApi.getTootStatus(mastodonServer, localTootId).then((tootStatus) => {
        return tootStatus.url;
    });

    // We can reasonably assume that the special shortcut, fromStaticOwnServer
    // will often fail and we can ignore the error and test the other universal
    // methods.
    return fromStaticOwnServer.catch(() => {
        // prefer fastest result
        return Promise.race([getFromApiQuery, scrapFromHtml]);
    }).then((url) => {
        // log result for debugging purposes
        console.log(`Got toot URL "${url}".`, {fromStaticOwnServer, getFromApiQuery, scrapFromHtml});

        // pass through
        return url;
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
