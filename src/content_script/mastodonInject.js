"use strict";

const TIMEOUT_DURATION = 20000;

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
 * Replacement onClick handler for interaction buttons.
 * 
 * @param {Event} event
 * @returns {void}
 */
function onClickInteract(event) {
    event.stopPropagation();
    event.preventDefault();
    const articleElement = event.target.closest("article[data-id]");
    const tootId = (
        articleElement === null
            ? window.location.pathname.split("/").slice(-1)[0]
            : articleElement.getAttribute("data-id")
    );
    // activate AutoRemoteFollow
    window.open(`/interact/${tootId}`, "_blank");
}

/**
 * Wait for element to appear.
 * 
 * @param {string} selector
 * @param {boolean} [multiple=false]
 * @param {number} timeoutDuration
 * @see {@link https://github.com/storybookjs/test-runner/blob/6d41927154e8dd1e4c9e7493122e24e2739a7a0f/src/setup-page.ts#L134}
 *  from which this was adapted
 * @returns {Promise}
 */
function waitForElement(selector, multiple = false, timeoutDuration) {
    return new Promise((resolve, reject) => {
        const getElement = () => (
            multiple
                ? document.querySelectorAll(selector)
                : document.querySelector(selector)
        );
        const isElementFound = (el) => (!multiple && el) || (multiple && el.length > 0);

        const timeout = window.setTimeout(() => {
            reject(new Error("waitForElement timed out"));
        }, timeoutDuration);

        const element = getElement();
        if (isElementFound(element)){
            window.clearTimeout(timeout);
            return resolve(element);
        }

        const observer = new MutationObserver(() => {
            const element = getElement();
            if (isElementFound(element)){
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
        const followButton = await waitForElement("#mastodon .account__header__tabs__buttons button:first-of-type", false, TIMEOUT_DURATION);
        followButton.addEventListener("click", onClickFollow);
    } catch (error) {
        // Follow button failed to appear
    }
}

/**
 * Inject replacement onClick handler for Interaction buttons.
 * 
 * @returns {void}
 */
async function injectInteractionButtons() {
    const INJECTED_REPLY_CLASS = "mastodon-simplified-federation-injected-interaction";
    const replyButtons = await waitForElement(
        "#mastodon .item-list[role='feed'] article[data-id] .status__action-bar button," +
        "#mastodon .detailed-status__wrapper .detailed-status__action-bar button",
        true,
        TIMEOUT_DURATION,
    );
    replyButtons.forEach((button) => {
        try {
            if (!button.classList.contains(INJECTED_REPLY_CLASS)){
                button.addEventListener("click", onClickInteract);
                button.classList.add(INJECTED_REPLY_CLASS);
            }
        } catch (error) {
            // Interaction buttons failed to appear
        }
    });
}

/**
 * Initialise injection for all remote Mastodon buttons.
 * 
 * @returns {void}
 */
async function init() {
    injectFollowButton();

    const ogType = document.querySelector("meta[property='og:type']");

    // inject only once on detail toots view pages
    if (ogType && ogType.getAttribute("content") === "article"){
        injectInteractionButtons();
        // otherwise listen to the feed for new posts
    } else {
        const observer = new MutationObserver(() => {
            injectInteractionButtons();
        });

        try {
            const feedElement = await waitForElement(
                "#mastodon .item-list[role='feed']",
                false,
                TIMEOUT_DURATION
            );

            observer.observe(feedElement, {
                childList: true, subtree: true,
            });
        } catch (error){
            // feedElement not found
        }
        
    }
}

init();