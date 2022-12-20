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
    const username = window.location.pathname.split("/").find(pathPart => pathPart.startsWith('@'));
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
    const getId = () => {
        const rawId = articleElement.getAttribute("data-id");
        return rawId.slice(0, 2) === "f-" ? rawId.slice(2) : rawId;
    };
    const tootId = (
        articleElement === null
            ? window.location.pathname.split("/").slice(-1)[0]
            : getId()
    );
    // activate AutoRemoteFollow
    window.open(`/interact/${tootId}`, "_blank");
}

/**
 * Wait for element to appear.
 * 
 * @param {string} selector
 * @param {boolean} [multiple=false]
 * @param {number} [timeoutDuration=200000]
 * @see {@link https://github.com/storybookjs/test-runner/blob/6d41927154e8dd1e4c9e7493122e24e2739a7a0f/src/setup-page.ts#L134}
 *  from which this was adapted
 * @returns {Promise}
 */
function waitForElement(selector, multiple = false, timeoutDuration = 200000) {
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
        if (isElementFound(element)) {
            window.clearTimeout(timeout);
            return resolve(element);
        }

        const observer = new MutationObserver(() => {
            const element = getElement();
            if (isElementFound(element)) {
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
        const followButton = await waitForElement("#mastodon .account__header__tabs__buttons button:first-of-type", false);
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
    const TIMELINE_SELECTOR = "#mastodon .item-list[role='feed'] article[data-id] .status__action-bar button"; // timeline / user profile
    const STATUS_NO_REPLIES_SELECTOR = "#mastodon .detailed-status__wrapper .detailed-status__action-bar button"; // status with no replies
    const STATUS_WITH_REPLIES_SELECTOR = "#mastodon .status__wrapper .status__action-bar button"; // status with replies
    try {
        const replyButtons = await waitForElement([
            TIMELINE_SELECTOR,
            STATUS_NO_REPLIES_SELECTOR,
            STATUS_WITH_REPLIES_SELECTOR,
        ].join(","), true,);
        replyButtons.forEach((button) => {
            try {
                if (!button.classList.contains(INJECTED_REPLY_CLASS)) {
                    button.addEventListener("click", onClickInteract);
                    button.classList.add(INJECTED_REPLY_CLASS);
                }
            } catch (error) {
                // Failed to inject interaction buttons
            }
        });
    } catch (error) {
        // Interaction buttons failed to appear
    }


}

/**
 * Initialise injection for all remote Mastodon buttons.
 * 
 * @returns {void}
 */
function initInjections() {
    injectFollowButton().catch(console.error);
    injectInteractionButtons().catch(console.error);
}

/**
 * Initialise script and re-run if there are changes.
 * 
 * @returns {void}
 */
async function init() {
    const MASTODON_INJECTED_CLASS = "mastodon-simplified-federation-injected";

    if (document.body.classList.contains(MASTODON_INJECTED_CLASS)) {
        // init has already run
        return;
    }

    document.body.classList.add(MASTODON_INJECTED_CLASS);
    initInjections();

    const observer = new MutationObserver(() => {
        initInjections();
    });

    // monitor only the main column in the Mastodon UI
    const mainColumn = await waitForElement(
        "#mastodon .ui",
        false,
    );
    observer.observe(mainColumn, {
        childList: true,
        subtree: true,
    });
}

init().catch(console.error);