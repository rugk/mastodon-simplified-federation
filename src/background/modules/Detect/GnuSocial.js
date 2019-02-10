/**
 * Module, that detects a GNU Social instance and returns the required values.
 *
 * @module Detect/GnuSocial
 */

import {NotSupportedError} from "/common/modules/Errors.js";
import {INTERACTION_TYPE} from "../data/INTERACTION_TYPE.js";

// https://regex101.com/r/8vTzty/1
const REMOTE_FOLLOW_REGEX = /\/main\/ostatus\/nickname\/(.+)\/?$/;

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
