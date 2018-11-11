import * as Mastodon from "/common/modules/Mastodon.js";

const insertHandle = document.getElementById("insertHandle");

insertHandle.addEventListener("input", () => {
    const ownMastodonSplit = Mastodon.splitUserHandle(insertHandle.value);

    return browser.storage.sync.set({
        mastodonUsername: ownMastodonSplit.username,
        mastodonServer: ownMastodonSplit.server,
    });
});

browser.storage.sync.get(["mastodonUsername", "mastodonServer"]).then((handleObject) => {
    const mastodonHandle = Mastodon.concatUserHandle(handleObject.mastodonUsername, handleObject.mastodonServer);
    insertHandle.value = mastodonHandle;
});
