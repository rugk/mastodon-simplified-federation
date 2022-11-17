"use strict";

/**
 * Replacement onClick handler for Follow button
 * @param {Event} event 
 */
function onClickFollow(event) {
  event.stopPropagation();
  event.preventDefault();
  const username = window.location.pathname.split(`/`).slice(-1)[0];
  // activate AutoRemoteFollow
  window.open(`/users/${username}/remote_follow`, `_blank`);
}

/**
 * wait for element to appear
 * @param {string} selector
 * @param {number} timeout
 * @see {@link https://github.com/storybookjs/test-runner/blob/6d41927154e8dd1e4c9e7493122e24e2739a7a0f/src/setup-page.ts#L134} from which this was adapted
 */
function waitForElement(selector, timeout) {
  return new Promise((resolve, reject) => {
    function getElement() {
      return document.querySelector(selector);
    }

    const element = getElement();
    if(element){
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = getElement();
      if(element){
        resolve(element);
        observer.disconnect();
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => {
      reject();
    }, timeout);
  }) 
}

/**
 * Inject replacement onClick handler for Follow button
 */
async function injectFollowButton() {
  try {
    const followButton = await waitForElement(`.account__header__tabs__buttons button.button`, 20000);
    followButton.addEventListener(`click`, onClickFollow);
  } catch {
    // Follow button failed to appear
  }
}

async function init() {
  await injectFollowButton();
}

init();