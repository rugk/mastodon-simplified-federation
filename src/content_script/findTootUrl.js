/**
 * Return the URL, you want to follow.
 *
 * @function
 * @returns {string}
 */
function getFollowUrl() {
    return document.querySelector(".status__info [href]").getAttribute("href");
}

getFollowUrl();
