/**
 * Provides small wrapper functions around browser APIs for listening to web requests.
 *
 * @module NetworkTools
 */

/**
 * Convert URL parameter to string, if needed.
 *
 * @private
 * @param {string|URL} url
 * @returns {string}
 */
function convertUrlToString(url) {
    if (url instanceof URL) {
        return url.href;
    }

    return url;
}

/**
 * Listen to a web request of this URL.
 *
 * @public
 * @param {string|string[]} expectedUrl one or more URLs
 * @param {string} onAction
 * @param {function} handleWebRequest
 * @param {string[]} [extraInfoSpec] {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest}
 * @returns {void}
 */
export function webRequestListen(expectedUrl, onAction, handleWebRequest, extraInfoSpec) {
    let urls = expectedUrl;
    if (!Array.isArray(urls)) {
        urls = [expectedUrl];
    }

    return browser.webRequest[onAction].addListener(
        handleWebRequest,
        {urls: urls, types: ["main_frame"]},
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
 * @param {boolean} loadReplace whether to replace the existing site
 * @returns {Promise}
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update}
 */
export function redirectToWebsite(url, loadReplace = true) {
    // convert URL object, if needed
    url = convertUrlToString(url);

    // Firefox for Android e.g. does not support "loadReplace"
    try {
        return browser.tabs.update({
            loadReplace,
            url
        });
    } catch (e) {
        return browser.tabs.update({ url });
    }
}

/**
 * Waits until the loading of a specific URL completes.
 * Basically wraps the webRequest listener in a nice promise.
 *
 * The callback will only be triggered once, after the loading event has been
 * triggered, and will automatically be unregistered again.
 *
 * The callback must return a Promise itself, which will be included (chained)
 * hee, too.
 *
 * @public
 * @param {string|URL|string[]} url
 * @param {function} callback
 * @param {string} [onAction="onCompleted"]
 * @param {int|null} [timeout=5000] time after which the Promise is rejected if
 *                                  the required event for the URL does not trigger,
*                                   set to "null" to disable
 * @returns {Promise}
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onCompleted}
 */
export function waitForWebRequest(url, callback, onAction = "onCompleted", timeout = 5000) {
    return new Promise((resolve, reject) => {
        let timerId = null;
        if (timeout) {
            // set timeout
            timerId = setTimeout(() => {
                // cleanup listener
                webRequestListenStop(onAction, listenForPageLoad);
                reject(new Error(`Waiting for request for URL "${url}" timed out.`));
            }, timeout);
        }

        const listenForPageLoad = (requestDetails) => {
            // cleanup timeout & listener
            if (timerId) {
                clearTimeout(timerId);
            }
            webRequestListenStop(onAction, listenForPageLoad);

            // now call callback
            callback(requestDetails).then(resolve).catch(reject);
        };

        // convert URL object, if needed
        url = convertUrlToString(url);

        webRequestListen(url, onAction, listenForPageLoad);
    });
}
