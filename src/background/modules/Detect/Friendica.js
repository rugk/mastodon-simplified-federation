/**
 * Module, that detects a Friendica instance and returns the required values.
 *
 * @module Detect/Friendica
 */

import {NotSupportedError} from "/common/modules/Errors.js";
import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

// https://regex101.com/r/Khzf4S/1
const REMOTE_FOLLOW_REGEX = /\/dfrn_request\/(.+)\/?$/;

/** The URLs to intercept and pass to this module. */
export const CATCH_URLS = new Map();
CATCH_URLS.set(REMOTE_FOLLOW_REGEX, INTERACTION_TYPE.FOLLOW);

/**
 * Whether to enable replacing the previous site when redirecting or not.
 *
 * @private
 * @type {boolean}
 */
const ENABLE_LOAD_REPLACE = false;

/**
 * Determinates whether the redirect should replace the site before or not.
 *
 * @public
 * @returns {boolean}
 */
export function shouldLoadReplace() {
    return ENABLE_LOAD_REPLACE;
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
 * Find the follow URL.
 *
 * @public
 * @returns {Promise}
 */
export function getTootUrl() {
    throw new NotSupportedError("getTootUrl() is not supported");
}

/**
 * Returns the username of the given "dfrn_request" page.
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
