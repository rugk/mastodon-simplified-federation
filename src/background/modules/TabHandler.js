/**
 * Handles operations in tabs.
 *
 * @module TabHandler
 */

/**
 * Return the owner of the popup tab, i.e the tab that opened this tab.
 *
 * @public
 * @param {int} tabId
 * @param {Object} requestDetails
 * @returns {int|null} opener tab ID
 */
export async function getPopupOwnerTab(tabId, requestDetails) {
    const ownTab = await browser.tabs.get(tabId);
    let openerTabId = ownTab.openerTabId;

    if (!openerTabId) {
        openerTabId = (await findBrowserTab({
            url: requestDetails.originUrl,
            excludeTabId: tabId,
            active: true
        })).id; // get ID
    }
    return openerTabId || null;
}

/**
 * Return the currently active tab.
 *
 * @private
 * @param {Object} data
 * @returns {Promise} int|null, opener tab ID
 */
async function findBrowserTab({
    url, excludeTabId, active
}) {
    const tabsFind = await browser.tabs.query({
        url,
        active
    });

    // filter tabs
    const tabFilter = tabsFind.filter((tab) => tab.id !== excludeTabId);

    if (!tabFilter || tabFilter.length === 0) {
        // fallback to non-active search
        if (active) {
            return findBrowserTab({url: url, excludeTabId: excludeTabId, active: false});
        }
        return null;
    }

    return tabFilter[0];
}
