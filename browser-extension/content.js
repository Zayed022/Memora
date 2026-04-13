// Content script — injected into every page
// Listens for auth token broadcast from the Memora web app

window.addEventListener('message', (event) => {
  // Only accept messages from the Memora app
  if (event.origin !== 'https://memora.app') return
  if (event.data?.type !== 'MEMORA_AUTH_TOKEN') return

  // Store the token in extension storage
  chrome.runtime.sendMessage({
    type:  'SET_TOKEN',
    token: event.data.token,
  })
})

// Also expose a helper for the page to check if extension is installed
window.postMessage({ type: 'MEMORA_EXTENSION_PRESENT', version: '1.0.0' }, '*')
