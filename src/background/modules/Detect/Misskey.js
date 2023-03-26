/**
 * Module, that detects a Misskey instance and returns the required values.
 *
 * @module Detect/Misskey
 */

import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

const REMOTE_INTERACT_REGEX = /\/notes\/(\w|\d)+\/?#interact$/;

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_INTERACT_REGEX, INTERACTION_TYPE.TOOT_INTERACT);

/**
 * Whether the OAUTH site finished loading.
 *
 * @private
 * @type {boolean}
 */
let redirectSiteFinishedLoading = false;

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
        resolve(`https://${url.host}${url.pathname}`);
    });
}

/**
 * Returns the username.
 *
 * @public
 * @returns {string|undefined}
 */
export function getUsername() {
    throw new NotSupportedError("getUsername() is not supported");
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
