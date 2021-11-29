/**
 * Upgrades user data on installation of new updates.
 *
 * Attention: Currently you must not include this script asyncronously. See
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1506464 for details.
 *
 * @module InstallUpgrade
 */

/**
 * Checks whether an upgrade is needed.
 *
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onInstalled}
 * @private
 * @param {Object} details
 * @returns {Promise}
 */
async function handleInstalled(details) {
    // only trigger for usual addon updates
    if (details.reason !== "update") {
        return;
    }

    switch (details.previousVersion) {
    case "0.8": {
        console.log(`Doing upgrade from ${details.previousVersion}.`, details);

        const oldData = await browser.storage.sync.get();

        await browser.storage.sync.set({
            ownMastodon: {
                username: oldData.mastodonUsername,
                server: oldData.mastodonServer
            }
        });

        await browser.storage.sync.remove(["mastodonUsername", "mastodonServer"]);

        console.info("Data upgrade successful.", await browser.storage.sync.get());

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
