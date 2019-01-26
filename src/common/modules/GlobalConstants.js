/**
 * Constants of the whole add-on.
 *
 * @module GlobalConstants
 */

// yes, pseudo-constants
export let ADDON_VERSION = "N/A";
export let ADDON_NAME = "N/A";
export const ADDON_NAME_SHORT = "MastodonSimplifiedFederation";

export let BROWSER_IDENTIFIER = "N/A";

// automatically load them
browser.runtime.getManifest().then((manifest) => {
    ADDON_VERSION = manifest.version;
    ADDON_NAME = manifest.name;
});

browser.runtime.getBrowserInfo().then((info) => {
    BROWSER_IDENTIFIER = `${info.vendor} ${info.name} ${info.version}`;
});
