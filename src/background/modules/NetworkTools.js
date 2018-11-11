/**
 * Provides small wrapper functions around browser APIs for listening to web requests.
 *
 * @module NetworkTools
 */

/**
 * Listen to a web request of this URL.
 *
 * @function
 * @private
 * @param {string} expectedUrl
 * @param {string} onAction
 * @param {function} handleWebRequest
 * @param {string[]} [extraInfoSpec] {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
 * @returns {void}
 */
export function webRequestListen(expectedUrl, onAction, handleWebRequest, extraInfoSpec) {
    return browser.webRequest[onAction].addListener(
        handleWebRequest,
        {urls: [expectedUrl], types: ["main_frame"]},
        extraInfoSpec
    );
}

/**
 * Stops listening to a web request of this URL.
 *
 * @function
 * @private
 * @param {string} onAction
 * @param {function} handleWebRequest
 * @returns {void}
 */
export function webRequestListenStop(onAction, handleWebRequest) {
    return browser.webRequest[onAction].removeListener(
        handleWebRequest
    );
}
