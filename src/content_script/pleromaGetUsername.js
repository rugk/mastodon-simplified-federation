"use strict";

/**
 * Return the username, you want to follow.
 *
 * @function
 * @returns {string}
 */
function getUsername() {
    const hiddenInputField = document.querySelector('[name="user[nickname]"]') || document.getElementById("user_nickname");

    return hiddenInputField.value;
}

getUsername();
