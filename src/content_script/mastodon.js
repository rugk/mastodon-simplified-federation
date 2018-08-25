/**
 * Saves the information about the parent tab and their state.
 *
 * @function
 * @private
 * @returns {HtmlElement}
 */
function findMastodonTags() {
    return document.getElementById("remote_follow_acct");
}

/**
 * Inserts the required mastodon handle.
 *
 * @function
 * @private
 * @param {HtmlElement} inputField
 * @returns {Promise}
 */
async function insertMastodonHandle(inputField) {
    const handleObject = await browser.storage.sync.get("insertHandle");

    inputField.value = handleObject.insertHandle;
}

/**
 * "Click" the button to submit the form.
 *
 * @function
 * @private
 * @returns {void}
 */
function confirmMastodonEntry() {
    document.querySelector("form").submit();
}

/**
 * Init AutoRemoteFollower module.
 *
 * @function
 * @returns {Promise}
 */
async function init() {
    const mastodon = findMastodonTags();
    if (!mastodon) {
        return;
    }

    await insertMastodonHandle(mastodon);

    confirmMastodonEntry();
}

init();
