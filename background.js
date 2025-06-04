// Auto update NRDs rules
autoUpdateNRDs()
setInterval(autoUpdateNRDs, 1800000)

// Load configs
window.blockDays, window.blockNRDs
await loadConfig()
setInterval(loadConfig, 10000)

// Monitor traffic and block if it is NRD
chrome.webRequest.onBeforeSendHeaders.addListener(
    request => {
        if(testBlock(request.url)) {
            return {cancel:true}
        }
    },
    {urls: ["<all_urls>"]},
    ["requestHeaders", "blocking"]
)

// Utility functions:
async function updateNRDs() {
    let NRDs = {}
    for(let day of [10, 20, 30, 45, 60]) {
        let data = await fetch(`https://github.com/cenk/nrd/raw/refs/heads/main/nrd-last-${day}-days.txt`).then(res => res.text()).then(txt => txt.split("\n"))
        NRDs[day] = data
        await new Promise(r => setTimeout(r, 5000))
    }
    await chrome.storage.local.set({NRDs: NRDs})
}

async function autoUpdateNRDs() {
    let now = new Date()
    let lastUpdate = new Date(await getStorage("lastUpdate") || "1970-01-01T00:00:00.000Z")
    if((now - lastUpdate) >= 18000000) {
        await updateNRDs()
        await setStorage("lastUpdate", now.toISOString())
    }
}

async function loadConfig() {
    window.blockDays = await getStorage("days") || "30"
    window.blockNRDs = await getStorage("NRDs").then(d => d?.[blockDays])  || []
}

function testBlock(url) {
    let host = (new URL(url)).host
    return window.blockNRDs.some(nrd => nrd != "" && host.endsWith(nrd))
}

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
