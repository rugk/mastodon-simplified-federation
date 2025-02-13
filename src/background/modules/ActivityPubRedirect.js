import * as NetworkTools from "/common/modules/NetworkTools.js";
import * as AddonSettings from "/common/modules/AddonSettings/AddonSettings.js";
import { resolveActivityPubId } from "/common/modules/MastodonApi.js";

/**
 * Scrapes the ActivityPub <link> destination from the HTML page, if needed and exists.
 *
 * @param {number} tabId
 * @param {URL} url
 * @returns {Promise}
 */
export async function redirectByActivityPubLink(tabId, url) {
    if (!tabId || !url) {
        throw new Error("Needs a tab id and a page URL");
    }

    const [objectId] = await browser.tabs.executeScript(tabId, {
        code: `document.querySelector("link[rel=alternate][type='application/activity+json']")?.href`,
        runAt: "document_end",
    });
    if (!objectId) {
        return;
    }

    const ownMastodon = await AddonSettings.get("ownMastodon");
    if (ownMastodon.server === url.hostname) {
        return;
    }

    const body = await resolveActivityPubId(ownMastodon.server, objectId);

    const baseUrl = `https://${ownMastodon.server}`;
    let homeUrl;
    if (body.accounts[0]) {
        homeUrl = new URL(`@${body.accounts[0].acct}`, baseUrl);
    } else if (body.statuses[0]) {
        homeUrl = new URL(
            `@${body.statuses[0].account.acct}/${body.statuses[0].id}`,
            baseUrl
        );
    } else {
        return;
    }

    await NetworkTools.redirectToWebsite(homeUrl, tabId);
}
