/**
 * This modules contains the custom triggers for some options that are added.
 *
 * @module modules/CustomOptionTriggers
 */

import isPlainObject from "/common/modules/lodash/isPlainObject.js";

import * as Mastodon from "/common/modules/Mastodon.js";
import * as AutomaticSettings from "/common/modules/AutomaticSettings/AutomaticSettings.js";

import * as MastodonHandleError from "/common/modules/MastodonHandle/ConfigError.js";
import * as MastodonHandleCheck from "/common/modules/MastodonHandle/ConfigCheck.js";

// whether the handle was once entered in a valid way
let validSyntaxHandleOnceEntered = false;
let lastInvalidHandleWithError = null;

/**
 * Checks if the Mastodon handle is valid and shows an error, if needed.
 *
 * @function
 * @private
 * @param  {boolean} optionValue
 * @param  {string} option
 * @param  {Object} event
 * @returns {Promise} (split mastodon handle & accountLink)
 */
async function checkMastodonHandle(optionValue, option, event) {
    // ignore options directly loaded from the settings, these are always valid
    if (isPlainObject(optionValue)) {
        return {splitHandle: optionValue};
    }

    let splitHandle, accountLink;
    try {
        const splitHandle = MastodonHandleCheck.verifyStatically(optionValue);

        // if it does not throw, it has been verified
        validSyntaxHandleOnceEntered = true;

        await MastodonHandleCheck.verifyAccount(splitHandle).then((networkResults) => {
            accountLink = networkResults.accountLink;
        });
    } catch (error) {
        // if user clears input field (i.e. they enter a new handle), reset syntax check
        // and show no error
        if (validSyntaxHandleOnceEntered && error.errorType === MastodonHandleError.ERROR_TYPE.IS_EMPTY) {
            validSyntaxHandleOnceEntered = false;
        }

        // show error to user only when they already entered a valid syntax or
        // explicitly left the element
        //
        // Or, if the last input with error is entered again…
        // ..., because if error has been hidden by typing only, and user reverts
        // to invalid input we need to show the error again
        // The problem is that for the same input the "change" event is not triggered.
        if (validSyntaxHandleOnceEntered || event.type === "change" || lastInvalidHandleWithError === optionValue) {
            MastodonHandleError.showMastodonHandleError(error);

            lastInvalidHandleWithError = optionValue;
        } else {
            MastodonHandleError.hideMastodonError();
        }

        if (error.errorType === MastodonHandleError.ERROR_TYPE.NOT_CONFIGURED) {
            // do NOT throw error as first loading has to suceed!
            return null;
        }

        // re-throw error to prevent saving
        throw error;
    }

    // if saving worked, maybe we need to hide the error though
    MastodonHandleError.hideMastodonError();
    return {splitHandle, accountLink};
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
    const splitHandle = param.saveTriggerValues[0].splitHandle;

    // while we have time, also pre-query subscribe API template
    Mastodon.getSubscribeApiTemplate(splitHandle, true);

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

    // handle loading of options correctly
    AutomaticSettings.Trigger.registerAfterLoad(AutomaticSettings.Trigger.RUN_ALL_SAVE_TRIGGER);
}
