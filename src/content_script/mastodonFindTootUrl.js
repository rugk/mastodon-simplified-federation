/**
 * Return the URL, you want to follow.
 *
 * @function
 * @returns {string}
 */
function getTootUrl() {
    return document.querySelector(".status__info [href]").getAttribute("href");
}

getTootUrl();
