/**
 * @typedef {Object} VersionNumber
 * @property {string} major
 * @property {string} minor
 * @property {string} patch
 */

/**
 * parses a versionNumber string
 * @returns {VersionNumber}
 */
function parseVersionNumber() {
  const versionElement = document.querySelector(`.link-footer`).textContent
  const versionNumber = versionElement.match(/v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/)
  return versionNumber.groups
}


/**
 * Replacement onClick handler for Follow button
 * @param {Event} event 
 */
function onClickFollow (event) {
  event.stopPropagation()
  event.preventDefault()
  const username = window.location.pathname.split(`/`).slice(-1)[0]
  // activate AutoRemoteFollow
  window.open(`/users/${username}/remote_follow`, `_blank`)
}

/**
 * wait for element to appear
 * @param {string} selector
 * @param {number} timeout
 */
function waitForElement (selector, timeout) {
  return new Promise((resolve, reject) => {
    function getElement() {
      return document.querySelector(selector)
    }

    const element = getElement()
    if(element){
      return resolve(element)
    }

    const observer = new MutationObserver(() => {
      const element = getElement()
      if(element){
        resolve(element)
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    window.setTimeout(() => {
      reject()
    }, timeout)
  }) 
}

/**
 * Inject replacement onClick handler for Follow button
 */
async function injectFollowButton () {
  try {
    const followButton = await waitForElement(`.account__header__tabs__buttons button.button`, 20000)
    followButton.addEventListener(`click`, onClickFollow)
  } catch {
    // Follow button failed to appear
  }
}

async function init () {
  let versionNumber

  try {
    const initialStateObject = JSON.parse(document.getElementById(`initial-state`).innerHTML)
    const version = initialStateObject?.meta?.version
    if(!initialStateObject || !version){
      // not a Mastodon server
      return
    }

    versionNumber = parseVersionNumber(version)
  } catch {
    return
  }

  
  if(Number.parseInt(versionNumber.major) >= 4){
    await injectFollowButton()
  }
}

init()