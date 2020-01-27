# Requested permissions

For a general explanation of add-on permission see [this support article](https://support.mozilla.org/kb/permission-request-messages-firefox-extensions).

## Installation permissions

| Internal Id                 | Permission                        | Explanation                                                                                                                                                                                                                                                                                                                     |
|:----------------------------|:----------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `http://*/*`, `https://*/*` | Access your data for all websites | Needed for getting access to any website of a server that could be a Mastodon instance. As any server could be a Mastodon instance, this needs to get access to all [HTTP](https://en.wikipedia.org/wiki/HTTP) and [HTTPS](https://en.wikipedia.org/wiki/HTTPS) [URLs](https://en.wikipedia.org/wiki/Uniform_Resource_Locator). |
| `notifications` | Display notifications to you | Required to show you a notification in case redirecting or something else fails. |

## Hidden permissions
Additionally, it requests these permissions, which are not requested in Firefox when the add-on is installed, as they are not a profound permission.

| Internal Id  | Permission           | Explanation                                                                                                                                |
|:-------------|:---------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| `webRequest` | Access web requests  | Needed for redirecting [URLs](https://en.wikipedia.org/wiki/Uniform_Resource_Locator) to the server, where you have your Mastodon account. |
| `storage`    | Access local storage | Needed for saving options                                                                                                                  |
