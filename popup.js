// Load info
config.days.value = await getStorage("days") || "30"
exclude.value = await getStorage("exclude") || ""

// Statistics
blockedRequests.innerText = await getStorage("blockedRequests") || "0"
numberOfNRDs.innerText = await getStorage("NRDs").then(o => o[config.days.value].length) || "0"
lastUpdate.innerText = await getStorage("lastUpdate") || "1970-01-01T00:00:00.000Z"

// Days of NRDs to be blocked
document.getElementsByName("days").forEach(elm => {
    elm.addEventListener("change", async () => {
        await setStorage("days", config.days.value)
    })
})

// Exclude domains
document.getElementById("exclude").addEventListener("change", async () => {
    await setStorage("exclude", exclude.value)
})

// Utility functions:
async function getStorage(key) {
    return new Promise(resolve => {
        chrome.storage.local.get(key, d => resolve(d[key]))
    })
}

async function setStorage(key, data) {
    return new Promise(resolve => {
        chrome.storage.local.set(Object.fromEntries([[key, data]]), () => resolve())
    })
}
