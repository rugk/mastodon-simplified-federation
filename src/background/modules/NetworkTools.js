/**
 * Listen to a web request of this URL.
 *
 * @function
 * @private
 * @param {string} expectedUrl
 * @param {string} onAction
 * @param {function} handleWebRequest
 * @returns {string|undefined}
 */
export function webRequestListen(expectedUrl, onAction, handleWebRequest) {
    browser.webRequest[onAction].addListener(
        handleWebRequest,
        {urls: [expectedUrl], types: ["main_frame"]}
    );
}
