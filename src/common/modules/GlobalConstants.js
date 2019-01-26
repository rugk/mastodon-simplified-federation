/**
 * Constants of the whole add-on.
 *
 * @module GlobalConstants
 */

export const ADDON_VERSION = (browser.runtime.getManifest()).version;
export const ADDON_NAME = (browser.runtime.getManifest()).name;
export const ADDON_NAME_SHORT = "MastodonSimplifiedFederation";

// yes, pseudo-constants
export let BROWSER_IDENTIFIER = "N/A";

// automatically load them
browser.runtime.getBrowserInfo().then((info) => {
    // BROWSER_IDENTIFIER = `${info.vendor} ${info.name} ${info.version}`;

    // for privacy reasons (as user may spoof user agent), do not include browser version
    BROWSER_IDENTIFIER = `${info.vendor} ${info.name}`;
});
