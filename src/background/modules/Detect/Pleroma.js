/**
 * Module, that detects a Pleroma instance and returns the required values.
 *
 * @module Detect/Pleroma
 */

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
