/**
 * Controller intercepting tab loads and redirecting them to correct modules.
 *
 * @module AutoRemoteFollow
 */

import { INTERACTION_TYPE } from "./data/INTERACTION_TYPE.js";
import { ADDON_NAME } from "/common/modules/GlobalConstants.js";

import * as MastodonDetect from "./Detect/Mastodon.js";
import * as GnuSocialDetect from "./Detect/GnuSocial.js";
import * as PleromaDetect from "./Detect/Pleroma.js";
import * as FriendicaDetect from "./Detect/Friendica.js";
import * as MisskeyDetect from "./Detect/Misskey.js";

import * as NetworkTools from "/common/modules/NetworkTools.js";
import * as MastodonRedirect from "./MastodonRedirect.js";

import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";
import * as MastodonHandleCheck from "/common/modules/MastodonHandle/ConfigCheck.js";
import * as MastodonHandleError from "/common/modules/MastodonHandle/ConfigError.js";
import * as Notifications from "/common/modules/Notifications.js";

const FEDIVERSE_TYPE = Object.freeze({
    MASTODON: Symbol("Mastodon"),
    GNU_SOCIAL: Symbol("GNU Social"),
    PLEROMA: Symbol("Pleroma"),
    FRIENDICA: Symbol("Friendica"),
    MISSKEY: Symbol("Misskey"),
});
const FEDIVERSE_MODULE = Object.freeze({
    [FEDIVERSE_TYPE.MASTODON]: MastodonDetect,
    [FEDIVERSE_TYPE.GNU_SOCIAL]: GnuSocialDetect,
    [FEDIVERSE_TYPE.PLEROMA]: PleromaDetect,
    [FEDIVERSE_TYPE.FRIENDICA]: FriendicaDetect,
    [FEDIVERSE_TYPE.MISSKEY]: MisskeyDetect
});

/**
 * Listens for Mastodon requests at web request change.
 *
 * Analyses the web request and redirects it, if appropiate.
 *
 * @private
 * @param {Object} requestDetails
 * @returns {Promise}
 */
async function handleWebRequest(requestDetails) {
    // ignore when URL is not changed
    if (!requestDetails.url) {
        return Promise.reject(new Error("URL info not available"));
    }

    const url = new URL(requestDetails.url);

    // detect, which network/software it uses
    const [software, interaction] = getInteractionType(url);

    if (software === null) {
        // ignore unrelated sites, resolves so error handling is not triggered
        return Promise.resolve();
    }
    const detectModule = FEDIVERSE_MODULE[software];

    // clear cache of settings
    await AddonSettings.loadOptions();

    MastodonRedirect.setTabToModify(detectModule.getTabToModify.bind(null, requestDetails));
    MastodonRedirect.enableLoadReplace(detectModule.shouldLoadReplace.bind(null, requestDetails));

    // and get data and pass to redirect
    switch (interaction) {
    case INTERACTION_TYPE.FOLLOW: {
        const remoteUser = await detectModule.getUsername(url, requestDetails);
        const remoteServer = await detectModule.getServer(url, requestDetails);

        return MastodonRedirect.redirectFollow(remoteUser, remoteServer);
    }
    case INTERACTION_TYPE.TOOT_INTERACT: {
        const tootUrl = await detectModule.getTootUrl(url, requestDetails);

        return MastodonRedirect.redirectToot(tootUrl);
    }
    default:
        throw new Error(`unknown interaction type: ${interaction.toString()}`);
    }
}

/**
 * Handles errors if web request cannot be redirected.
 *
 * @private
 * @param {Error} error
 * @returns {Promise}
 */
async function handleError(error) {
    // open options on click
    const openOptions = () => {
        browser.notifications.onClicked.removeListener(openOptions);
        browser.runtime.openOptionsPage();
    };
    browser.notifications.onClicked.addListener(openOptions);

    let title = browser.i18n.getMessage("errorNotificationRedirectingTitle", ADDON_NAME);
    let errorIdentifier = "couldNotRedirect";
    // verify that Mastodon handle is correctly saved
    const mastodonHandle = await AddonSettings.get("ownMastodon");

    await MastodonHandleCheck.verifyComplete(mastodonHandle).then(() => {
        errorIdentifier = "couldNotRedirect";
    }).catch((error) => {
        if (error.errorType === MastodonHandleError.ERROR_TYPE.NOT_CONFIGURED) {
            errorIdentifier = "addonIsNotYetSetup";
            // also adjust title
            title = browser.i18n.getMessage("errorNotificationNotSetupTitle", ADDON_NAME);
        } else {
            errorIdentifier = MastodonHandleError.getMastodonErrorString(error);
        }
    }).finally(() => {
        // show actual error
        const errorMessage = browser.i18n.getMessage(errorIdentifier) || errorIdentifier;
        const message = (errorIdentifier === "couldNotRedirect") ? errorIdentifier : browser.i18n.getMessage("errorNotificationAdjustSettings", errorMessage);
        Notifications.showNotification(message, title);
    });

    // still throw out for debugging
    throw error;
}

/**
 * Checks what type of interaction the current URL denotes.
 *
 * @function
 * @private
 * @param {URL} url
 * @returns {[FEDIVERSE_TYPE, Symbol]|[null, null]}
 */
function getInteractionType(url) {
    for (const fedType of Object.values(FEDIVERSE_TYPE)) {
        for (const [checkRegEx, interactionType] of FEDIVERSE_MODULE[fedType].CATCH_URLS) {
            if (url.href.match(checkRegEx)) {
                return [fedType, interactionType];
            }
        }
    }

    return [null, null];
}

/**
 * Handles changes to the URL of a tab.
 * 
 * @param {string} tabId
 * @param {Object} changeInfo
 * @returns {void}
 */
async function onTabUpdate(tabId, changeInfo) {
    const ownMastodon = await AddonSettings.get("ownMastodon");
    const currentURL = new URL(changeInfo.url);
    if (ownMastodon.server !== currentURL.hostname){
        browser.tabs.executeScript(tabId, {
            file: "/content_script/mastodonInject.js",
        });
        browser.tabs.executeScript(tabId, {
            file: "/content_script/misskeyInject.js",
        });
    }
}

/**
 * Init AutoRemoteFollower module.
 *
 * @function
 * @returns {Promise}
 */
function init() {
    NetworkTools.webRequestListen(["http://*/*", "https://*/*"], "onBeforeRequest", (requestDetails) => {
        return handleWebRequest(requestDetails).catch(handleError).catch(console.error);
    }, ["requestBody"]);

    browser.tabs.onUpdated.addListener(onTabUpdate, {
        properties: ["url"]
    });
}

init();
