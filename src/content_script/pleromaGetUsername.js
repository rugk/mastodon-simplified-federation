"use strict";

/**
 * Return the username, you want to follow.
 *
 * @function
 * @returns {string}
 */
function getUsername() {
    const hiddenInputFied = document.querySelector('[name="user[nickname]"]') || document.getElementById("user_nickname");

    return hiddenInputFied.value;
    // TODO: test!
}

getUsername();
