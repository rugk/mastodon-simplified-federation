/**
 * Module, that detects a Pleroma instance and returns the required values.
 *
 * @module Detect/Pleroma
 */

import * as NetworkTools from "/common/modules/NetworkTools.js";
import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";
import isString from "/common/modules/lodash/isString.js";

// https://regex101.com/r/JaCimp/2
const REMOTE_FOLLOW_REGEX = /\/main\/ostatus\/?$/;
// https://regex101.com/r/fjPdgC/1
const USER_PAGE_URL_REGEX = /\/users\/(.+)\/?$/;
// really just REMOTE_FOLLOW_REGEX with status_id query
const REMOTE_INTERACT_REGEX = /\/main\/ostatus\/?\?status_id=\w+$/;

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_INTERACT_REGEX, INTERACTION_TYPE.TOOT_INTERACT);
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, INTERACTION_TYPE.FOLLOW);

/**
 * Whether the OAUTH site finished loading.
 *
 * @private
 * @type {boolean}
 */
let redirectSiteFinishedLoading = false;

/**
 * Scrapes the user information from the HTML page, if needed.
 *
 * @private
 * @param {URL} url
 * @returns {Promise}
 */
function scrapeUserFromPage(url) {
    return NetworkTools.waitForWebRequest(url).then(() => {
        redirectSiteFinishedLoading = true;

        // inject content script to get toot URL
        // default = current tab
        return browser.tabs.executeScript(
            {
                file: "/content_script/pleromaGetUsername.js",
                runAt: "document_end"
            }
        ).then((username) => {
            if (!username) {
                throw new Error("Could not get user from Pleroma page.");
            }

            username = username[0];

            // verify it is a real URL
            if (!isString(username)) {
                throw new Error(`HTML scraping returned invalid username, not a string: ${username}`);
            }

            return username;
        });
    });
}

/**
 * Determinates whether the redirect should replace the site before or not.
 *
 * @public
 * @returns {boolean}
 */
export function shouldLoadReplace() {
    // if site finished loading, replace it
    return redirectSiteFinishedLoading;
}

/**
 * Determinates which tab should be redirected.
 *
 * @public
 * @param {Object} requestDetails
 * @returns {int}
 */
export function getTabToModify(requestDetails) {
    return requestDetails.tabId;
}

/**
 * Find the status URL.
 *
 * @public
 * @param {URL} url
 * @returns {Promise}
 */
export function getTootUrl(url) {
    return new Promise((resolve, reject) => {
        resolve(`https://${url.host}/notice/${url.searchParams.get("status_id")}`);
    });
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
    redirectSiteFinishedLoading = false;

    try {
        return requestDetails.requestBody.formData.nickname[0];
    } catch (e) {
        console.error("Could not get username from request body. Error: ", e);
    }

    try {
        const originUrl = new URL(requestDetails.originUrl);
        const match = USER_PAGE_URL_REGEX.exec(originUrl.pathname);

        const username = match[1];

        if (username) {
            return username;
        } else {
            console.error("Could not get valid username from request details. Got", originUrl, "from", requestDetails);
        }
    } catch (e) {
        console.error("Could not get username from request origin. Error: ", e);
    }

    // fallback to HTML scraping
    console.warn("Falling back to HTML scraping from ", url, "– details:", requestDetails);

    return scrapeUserFromPage(url);
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
