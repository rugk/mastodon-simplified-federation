/**
 * Module, that detects a Pleroma instance and returns the required values.
 *
 * @module Detect/Pleroma
 */

import * as NetworkTools from "/common/modules/NetworkTools.js";
import {NotSupportedError} from "/common/modules/Errors.js";
import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

// https://regex101.com/r/JaCimp/2
const REMOTE_FOLLOW_REGEX = /\/main\/ostatus\/?$/;
// https://regex101.com/r/fjPdgC/1
const USER_PAGE_URL_REGEX = /\/users\/(.+)\/?$/;

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, INTERACTION_TYPE.FOLLOW);

/**
 * Scrapes the user information from the HTML page, if needed.
 *
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
function scrapeUserFromPage(url) {
    return NetworkTools.waitForWebRequest(url, () => {
        // inject content script to get toot URL
        // default = current tab
        return browser.tabs.executeScript(
            {
                file: "/content_script/pleromaGetUsername.js",
                runAt: "document_end"
            }
        ).then((userUrl) => {
            if (!userUrl) {
                throw new Error("Could not get user from Pleroma page.");
            }

            userUrl = userUrl[0];

            // verify it is a real URL
            try {
                new URL(userUrl);
            } catch (e) {
                throw new Error(`HTML scraping returned invalid URL: ${userUrl}`);
            }

            return userUrl;
        });
    });
}

/**
 * Whether to enable replacing the previous site when redirecting or not.
 *
 * @public
 * @type {boolean}
 */
export const ENABLE_LOAD_REPLACE = false;

/**
 * Find the follow URL.
 *
 * @function
 * @private
 * @returns {Promise}
 */
export function getTootUrl() {
    throw new NotSupportedError("getTootUrl() is not supported");
}

/**
 * Returns the username of the given OStatus page.
 *
 * @private
 * @function
 * @param {URL} url
 * @param {Object} requestDetails
 * @returns {string|undefined}
 */
export function getUsername(url, requestDetails) {
    const originUrl = new URL(requestDetails.originUrl);
    const match = USER_PAGE_URL_REGEX.exec(originUrl.pathname);

    const username = match[1];

    // fallback to HTMl scarping
    if (!username) {
        return scrapeUserFromPage(url);
    }

    return username;
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
