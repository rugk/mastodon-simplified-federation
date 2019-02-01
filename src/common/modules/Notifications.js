/**
 * Show a notification.
 *
 * @module common/modules/Notifications
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/user_interface/Notifications}
 */

import { ADDON_NAME } from "./GlobalConstants.js";

const ICON = (browser.runtime.getManifest()).icons[32];

/**
 * Return some information from the WebFinger request of the server.
 *
 * @public
 * @param {string} content the message content
 * @param {string} [title] the title, defaults to ADDON NAME
 * @param {Object[]} [buttons] add button object if needed (not yet implemented!)
 *                   Buttons are not yet supported by Firefox.
 * @returns {Promise}
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/notifications/create}
 */
export function showNotification(content, title = ADDON_NAME) {
    title = title || ADDON_NAME;

    title = browser.i18n.getMessage(title) || title;
    content = browser.i18n.getMessage(content) || content;

    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL(ICON),
        "title": title,
        "message": content
    });
}
