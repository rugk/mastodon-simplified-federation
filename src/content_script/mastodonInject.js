"use strict";

/**
 * Replacement onClick handler for Follow button.
 * 
 * @param {Event} event 
 * @returns {void}
 */
function onClickFollow(event) {
    event.stopPropagation();
    event.preventDefault();
    const username = window.location.pathname.split("/").slice(-1)[0];
    // activate AutoRemoteFollow
    window.open(`/users/${username}/remote_follow`, "_blank");
}

/**
 * Wait for element to appear.
 * 
 * @param {string} selector
 * @param {number} timeoutDuration
 * @see {@link https://github.com/storybookjs/test-runner/blob/6d41927154e8dd1e4c9e7493122e24e2739a7a0f/src/setup-page.ts#L134}
 *  from which this was adapted
 * @returns {Promise}
 */
function waitForElement(selector, timeoutDuration) {
    return new Promise((resolve, reject) => {
        const getElement = () => document.querySelector(selector);

        const timeout = window.setTimeout(() => {
            reject(new Error("waitForElement timed out"));
        }, timeoutDuration);

        const element = getElement();
        if(element){
            window.clearTimeout(timeout);
            return resolve(element);
        }

        const observer = new MutationObserver(() => {
            const element = getElement();
            if(element){
                window.clearTimeout(timeout);
                resolve(element);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return null;
    }); 
}

/**
 * Inject replacement onClick handler for Follow button.
 * 
 * @returns {void}
 */
async function injectFollowButton() {
    try {
        const followButton = await waitForElement(".account__header__tabs__buttons button:first-of-type", 20000);
        followButton.addEventListener("click", onClickFollow);
    } catch (error) {
        // Follow button failed to appear
    }
}

/**
 * Initialise injection for Mastodon Follow button.
 * 
 * @returns {void}
 */
async function init() {
    await injectFollowButton();
}

init();