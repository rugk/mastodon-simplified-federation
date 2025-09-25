"use strict";

/**
 * Replacement onClick handler for interaction buttons.
 * 
 * @param {Event} event
 * @returns {void}
 */
function onClickInteractMisskey(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    const articleElement = event.target.closest("article");
    let headerElement = (
        articleElement === null
            ? null
            : articleElement.querySelector("header > div > a") // misskey
    );
    headerElement = (
        (articleElement !== null && headerElement === null)
            ? articleElement.querySelector(".created-at") // calckey
            : headerElement
    );
    const tootId = (
        headerElement === null
            ? window.location.pathname.toString()
            : headerElement.getAttribute("href")
    );
    // activate AutoRemoteFollow
    window.open(`${tootId}#interact`, "_blank");
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
            observer.disconnect();
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
 * Inject replacement onClick handler for Interaction buttons.
 * 
 * @returns {void}
 */
async function injectInteractionButtons() {
    const INJECTED_REPLY_CLASS = "mastodon-simplified-federation-injected-interaction";
    const SELECTOR = ".mk-app > .main > .contents article footer > button:not(:last-child)";
    try {
        const replyButtons = await waitForElement(SELECTOR, true);
        replyButtons.forEach((button) => {
            try {
                if (!button.classList.contains(INJECTED_REPLY_CLASS)) {
                    button.classList.add(INJECTED_REPLY_CLASS);
                    button.addEventListener("click", onClickInteractMisskey);
                    button.removeEventListener("mousedown");
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
 * Initialise injection for all remote Misskey buttons.
 * 
 * @returns {void}
 */
function initInjections() {
    injectInteractionButtons().catch(console.error);
}

/**
 * Initialise script and re-run if there are changes.
 * 
 * @returns {void}
 */
async function init() {
    if (typeof MISSKEY_INJECTED === "undefined"){
        globalThis.MISSKEY_INJECTED = true;
    } else {
        // init has already run
        return;
    }

    initInjections();

    const observer = new MutationObserver(() => {
        initInjections();
    });

    try {
        // monitor only the main column in the Misskey UI
        const mainColumn = await waitForElement(
            ".mk-app > .main",
            false,
        );
        observer.observe(mainColumn, {
            childList: true,
            subtree: true,
        });
    } catch(error) {
        // is not a misskey website, do nothing
    }
}

init().catch(console.error);
