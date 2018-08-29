
import * as MastodonRedirect from "./MastodonRedirect.js";

const FEDIVERSE_TYPE = Object.freeze({
    MASTODON: Symbol("mastodon"),
    GNU_SOCIAL: Symbol("GNU Social")
});

/**
 * Listens for Mastodon requests at tab update.
 *
 * @function
 * @private
 * @param {integer} tabId
 * @param {Object} changeInfo
 * @throws {Error}
 * @returns {Promise}
 */
function handleTabUpdate(tabId, changeInfo) {
    // ignore when URL is not changed
    if (!changeInfo.url) {
        return Promise.reject(new Error("URL info not available"));
    }

    const url = new URL(changeInfo.url);

    const [software, interaction] = getInteractionType(url);

    switch (software) {
    case null:
        // ignore other sites
        return Promise.resolve();
    case FEDIVERSE_TYPE.MASTODON:
        return MastodonRedirect.handleSite(url, interaction);
    default:
        throw new Error(`known fediverse type: ${software}`);
    }
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {[FEDIVERSE_TYPE, Symbol]|null}
 */
function getInteractionType(url) {
    for (const [checkRegEx, interactionType] of MastodonRedirect.CATCH_URLS) {
        if (url.pathname.match(checkRegEx)) {
            return [FEDIVERSE_TYPE.MASTODON, interactionType];
        }
    }

    return [null, null];
}

/**
 * Init AutoRemoteFollower module.
 *
 * @function
 * @returns {Promise}
 */
function init() {
    browser.tabs.onUpdated.addListener(handleTabUpdate);
}

init();
