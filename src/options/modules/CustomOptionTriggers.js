/**
 * This mdoules contains the custom triggers for some options that are added.
 *
 * @module modules/CustomOptionTriggers
 */

import isPlainObject from "/common/modules/lodash/isPlainObject.js";

import * as Mastodon from "/common/modules/Mastodon.js";
import * as AutomaticSettings from "/common/modules/AutomaticSettings/AutomaticSettings.js";
import * as CommonMessages from "/common/modules/MessageHandler/CommonMessages.js";

// Mastodon handle state management
const MASTODON_HANDLE_IS_INVALID = Symbol("invalid Mastodon handle");
const MASTODON_HANDLE_IS_EMPTY = Symbol("empty Mastodon handle");
let mastodonHandleErrorShown = null;

/**
 * Hides the error/warning shown for the Mastodon handle.
 *
 * @function
 * @param {Object} options
 * @private
 * @returns {void}
 */
function hideMastodonError(options = {animate: true}) {
    switch (mastodonHandleErrorShown) {
    case MASTODON_HANDLE_IS_EMPTY:
        CommonMessages.hideWarning(options);
        break;
    case MASTODON_HANDLE_IS_INVALID:
        CommonMessages.hideError(options);
        break;
    }

    mastodonHandleErrorShown = null;
}

/**
 * Checks if the Mastodon handle is valid and shows an error, if needed.
 *
 * @function
 * @private
 * @param  {boolean} optionValue
 * @param  {string} [option]
 * @returns {Object}
 */
function checkMastodonHandle(optionValue) {
    // default option, string not yet set
    if (optionValue === null) {
        // hide "old" error, if needed
        hideMastodonError({animate: false});

        CommonMessages.showWarning("mastodonHandleIsEmpty");
        mastodonHandleErrorShown = MASTODON_HANDLE_IS_EMPTY;
        // do NOT throw error as first loading has to suceed!
        return null;
    }

    // ignore options directly loaded from the settings, these are always valid
    if (isPlainObject(optionValue)) {
        // hide "old" error, if needed
        hideMastodonError({animate: false});

        return null;
    }

    if (optionValue === "") {
        // hide "old" error, if needed
        hideMastodonError({animate: false});

        CommonMessages.showWarning("mastodonHandleIsEmpty");
        mastodonHandleErrorShown = MASTODON_HANDLE_IS_EMPTY;
        throw new Error("empty Mastodon handle");
    }

    let splitHandle;
    try {
        splitHandle = Mastodon.splitUserHandle(optionValue);
    } catch (e) {
        // hide "old" error, if needed
        hideMastodonError({animate: false});

        CommonMessages.showError("mastodonHandleIsInvalid");
        mastodonHandleErrorShown = MASTODON_HANDLE_IS_INVALID;

        // re-throw to prevent saving
        throw e;
    }

    // if saving worked, maybe we need to hide the error though
    hideMastodonError();
    mastodonHandleErrorShown = null;
    return splitHandle;
}

/**
 * Saves the Mastodon handle.
 *
 * @private
 * @param {Object} param
 * @param {Object} param.optionValue the value of the changed option
 * @param {string} param.option the name of the option that has been changed
 * @param {Array} param.saveTriggerValues all values returned by potentially
 *                                          previously run safe triggers
 * @returns {Promise}
 */
function saveMastodonHandle(param) {
    // our split handle from {@see checkMastodonHandle()} is saved in saveTriggerValues
    const splitHandle = param.saveTriggerValues[0];

    return AutomaticSettings.Trigger.overrideContinue(splitHandle);
}

/**
 * Concatenates the Mastodon handle, so an object fits into a text input field. ;)
 *
 * @private
 * @param {Object} param
 * @param {Object} param.optionValue the value of the option to be loaded
 * @param {string} param.option the name of the option that has been changed
 * @param {HTMLElement} param.elOption where the data is supposed to be loaded
 *                     into
 * @param {Object} param.optionValues result of a storage.[…].get call, which
 *                  contains the values that should be applied to the file
 * @returns {Promise}
 */
function prepareMastodonHandleForInput(param) {
    // our split handle in a split form
    let ownMastodon = param.optionValue;

    // if default, we show an empty string
    if (ownMastodon === null) {
        return AutomaticSettings.Trigger.overrideContinue("");
    }

    if (ownMastodon.username && ownMastodon.server) {
        ownMastodon = Mastodon.concatUserHandle(ownMastodon.username, ownMastodon.server);
    }

    return AutomaticSettings.Trigger.overrideContinue(ownMastodon);
}

/**
 * Checks whether Mastodon handle is valid again, and – if so – hides the errors.
 *
 * Note this does not show any errors in order not to annoy a user when they are
 * typing.
 *
 * @function
 * @private
 * @param  {boolean} optionValue
 * @param  {string} [option]
 * @returns {void}
 */
function checkMastodonHandleFast(optionValue) {
    if (!mastodonHandleErrorShown) {
        return;
    }

    switch (mastodonHandleErrorShown) {
    case MASTODON_HANDLE_IS_EMPTY:
        if (optionValue !== "") {
            return;
        }
        break;
    case MASTODON_HANDLE_IS_INVALID:
        try {
            Mastodon.splitUserHandle(optionValue);

        } catch (e) {
            // ignore all errors
            return;
        }
        break;
    }

    // if it works, the user managed to fix the previously reported error! :)
    hideMastodonError();
}

/**
 * Binds the triggers.
 *
 * This is basically the "init" method.
 *
 * @function
 * @returns {void}
 */
export function registerTrigger() {
    // override load/safe behaviour for custom fields
    AutomaticSettings.Trigger.addCustomLoadOverride("ownMastodon", prepareMastodonHandleForInput);
    AutomaticSettings.Trigger.addCustomSaveOverride("ownMastodon", saveMastodonHandle);

    // register triggers
    AutomaticSettings.Trigger.registerSave("ownMastodon", checkMastodonHandle);

    AutomaticSettings.Trigger.registerUpdate("ownMastodon", checkMastodonHandleFast);

    // handle loading of options correctly
    AutomaticSettings.Trigger.registerAfterLoad(AutomaticSettings.Trigger.RUN_ALL_SAVE_TRIGGER);
}
