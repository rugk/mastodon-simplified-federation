/**
 * Provides small wrapper functions around browser APIs for listening to web requests.
 *
 * @module NetworkTools
 */

/**
 * Listen to a web request of this URL.
 *
 * @public
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
 * @public
 * @param {string} onAction
 * @param {function} handleWebRequest
 * @returns {void}
 */
export function webRequestListenStop(onAction, handleWebRequest) {
    return browser.webRequest[onAction].removeListener(
        handleWebRequest
    );
}

/**
 * Redirects the current tab to a new site.
 *
 * It does try to replace the site's history so the old URL does not appear
 * in the history, but this is not always possible.
 *
 * @public
 * @param {string|URL} url
 * @returns {Promise}
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update}
 */
export function redirectToWebsite(url) {
    if (url instanceof URL) {
        url = (new URL(url)).toString();
    }

    // Firefox for Android e.g. does not support "loadReplace"
    try {
        return browser.tabs.update({
            loadReplace: true,
            url: url
        });
    } catch (e) {
        return browser.tabs.update({ url });
    }
}
