"use strict";

const insertHandle = document.getElementById("insertHandle");

insertHandle.addEventListener("input", () => {
    browser.storage.sync.set({
        "insertHandle": insertHandle.value
    });
});

browser.storage.sync.get("insertHandle").then((handleObject) => {
    insertHandle.value = handleObject.insertHandle;
});
