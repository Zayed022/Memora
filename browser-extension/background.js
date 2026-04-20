const API_BASE = 'https://memora.app'

// ── Keyboard shortcut: Alt+Shift+S ──────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-page') return

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) return

  const token = await getToken()
  if (!token) {
    chrome.tabs.create({ url: `${API_BASE}/auth/sign-in` })
    return
  }

  await quickSave(tab, token)
})

// ── Context menu: right-click "Save to Memora" ──────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus?.create({
    id:       'save-to-memora',
    title:    'Save to Memora',
    contexts: ['page', 'link', 'selection'],
  })
})

chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'save-to-memora') return

  const token = await getToken()
  if (!token) {
    chrome.tabs.create({ url: `${API_BASE}/auth/sign-in` })
    return
  }

  const url   = info.linkUrl ?? info.pageUrl ?? tab?.url ?? ''
  const title = tab?.title ?? url

  await saveUrl(url, title, token)
})

// ── Message listener (from popup or content script) ─────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SAVE_PAGE') {
    getToken().then(token => {
      if (!token) { sendResponse({ error: 'not_authenticated' }); return }
      saveUrl(msg.url, msg.title, token).then(() => sendResponse({ success: true }))
    })
    return true // keep channel open for async
  }

  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({ memora_token: msg.token }, () => {
      sendResponse({ success: true })
    })
    return true
  }

  if (msg.type === 'GET_TOKEN') {
    getToken().then(token => sendResponse({ token }))
    return true
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get(['memora_token'], r => resolve(r.memora_token ?? null))
  })
}

async function quickSave(tab, token) {
  try {
    await saveUrl(tab.url, tab.title ?? '', token)
    chrome.notifications?.create({
      type:    'basic',
      iconUrl: 'icons/icon48.png',
      title:   'Saved to Memora ✦',
      message: `"${(tab.title ?? '').slice(0, 60)}" is being processed by AI.`,
    })
  } catch (err) {
    chrome.notifications?.create({
      type:    'basic',
      iconUrl: 'icons/icon48.png',
      title:   'Memora — save failed',
      message: 'Could not save. Check your connection.',
    })
  }
}

async function saveUrl(url, title, token) {
  const form = new FormData()
  form.append('type',  'ARTICLE')
  form.append('url',   url)
  form.append('title', title)

  const res = await fetch(`${API_BASE}/api/items`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    form,
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
