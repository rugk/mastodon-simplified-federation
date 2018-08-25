/**
 * Checks whether the current site is really a Mastodon site.
 *
 * @function
 * @returns {boolean}
 */
function isMastodon() {
    if (document.getElementById("remote_follow_acct")) {
        return true;
    }
    if (document.querySelector("title").textContent.includes("Mastodon")) {
        return true;
    }

    return false;
}

isMastodon();
