/**
 * Upgrades user data on installation of new updates.
 *
 * Attention: Currently you must not include this script asyncronously. See
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1506464 for details.
 *
 * @module InstallUpgrade
 */

import * as Mastodon from "/common/modules/Mastodon.js";

/**
 * Checks whether an upgrade is needed.
 *
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onInstalled}
 * @private
 * @param {Object} details
 * @returns {void}
 */
async function handleInstalled(details) {
    // only trigger for usual addon updates
    if (details.reason !== "update") {
        return;
    }

    switch (details.previousVersion) {
    case "0.7": {
        console.log(`Doing upgrade from ${details.previousVersion}.`, details);

        const ownMastodonSplit = await browser.storage.sync.get("insertHandle").then((handleObject) => {
            return Mastodon.splitUserHandle(handleObject.insertHandle);
        });

        await browser.storage.sync.set({
            mastodonUsername: ownMastodonSplit.username,
            mastodonServer: ownMastodonSplit.server,
        });

        await browser.storage.sync.remove("insertHandle");

        console.log("Data upgrade successful.", await browser.storage.sync.get());

        break;
    }
    default:
        console.log(`Addon upgrade from ${details.previousVersion}. No data upgrade needed.`, details);
    }
}

/**
 * Inits module.
 *
 * @private
 * @returns {void}
 */
function init() {
    browser.runtime.onInstalled.addListener(handleInstalled);
}

init();
