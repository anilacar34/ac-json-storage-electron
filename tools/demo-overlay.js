// Injected into the page for recording only: a visible pointer and a caption
// strip, so the GIF reads as a demonstration rather than things happening by
// themselves. Nothing here ships with the app.
const style = document.createElement('style')
style.textContent = `
  #demo-cursor {
    position: fixed; z-index: 99999; width: 20px; height: 20px; margin: -10px 0 0 -10px;
    border-radius: 50%; background: rgba(88,166,255,.30); border: 2px solid #58a6ff;
    box-shadow: 0 0 0 4px rgba(88,166,255,.12); pointer-events: none; opacity: 0;
    transition: left .5s cubic-bezier(.4,0,.2,1), top .5s cubic-bezier(.4,0,.2,1),
                transform .12s ease, opacity .3s;
  }
  #demo-cursor.on { opacity: 1 }
  #demo-cursor.click { transform: scale(.55); background: rgba(88,166,255,.85) }
  #demo-caption {
    position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%) translateY(8px);
    z-index: 99999; max-width: 80%; text-align: center;
    background: rgba(13,17,23,.94); color: #e6edf3; border: 1px solid #30363d;
    border-radius: 999px; padding: 9px 20px; box-shadow: 0 8px 28px rgba(0,0,0,.5);
    font: 600 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    opacity: 0; transition: opacity .3s ease, transform .3s ease;
  }
  #demo-caption.on { opacity: 1; transform: translateX(-50%) translateY(0) }
`
document.head.appendChild(style)

const cursor = document.createElement('div')
cursor.id = 'demo-cursor'
const caption = document.createElement('div')
caption.id = 'demo-caption'
document.body.append(cursor, caption)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function centreOf(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) throw new Error('demo: no element for ' + target)
  const r = el.getBoundingClientRect()
  return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

window.__demo = {
  async caption(text) {
    if (!text) {
      caption.classList.remove('on')
      await wait(320)
      return
    }
    if (caption.classList.contains('on')) {
      caption.classList.remove('on')
      await wait(320)
    }
    caption.textContent = text
    caption.classList.add('on')
    await wait(350)
  },
  async moveTo(target) {
    const { x, y } = centreOf(target)
    cursor.classList.add('on')
    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`
    await wait(560)
  },
  async click(target, { move = true } = {}) {
    const { el, x, y } = centreOf(target)
    if (move) await this.moveTo(el)
    else {
      cursor.classList.add('on')
      cursor.style.left = `${x}px`
      cursor.style.top = `${y}px`
    }
    cursor.classList.add('click')
    await wait(140)
    el.click()
    cursor.classList.remove('click')
    await wait(220)
  },
  async type(target, text, { clear = true } = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    await this.moveTo(el)
    el.focus()
    if (clear) {
      el.value = ''
      // Clearing is a change too: without the event the app keeps filtering on
      // what was there, and later steps look for rows that are filtered out.
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await wait(120)
    }
    for (const ch of text) {
      el.value += ch
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await wait(70)
    }
    await wait(200)
  },
  hideCursor() {
    cursor.classList.remove('on')
  },
}
