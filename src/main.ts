import { html, render, nothing } from 'lit-html'
import { setupGlobalFuncs } from './setupGlobalFuncs'
import { setAdjustHandler } from './adjustHeight'
import { Widget } from './components/Widget'
import { Login } from './components/Login'
import './index.scss'

declare const process: { env: Record<string, string> }

export const rerender = (): void => {
  if (process.env.NODE_ENV === 'production') {
    render(Widget(), document.body)
    return
  }

  if (location.pathname === '/iframe') {
    window.addEventListener('message', e => {
      if (!Array.isArray(e.data) || e.data.length < 2) return
      if (e.data[0] === location.href) return
      console.log('message', e.data)
    })
    const app = html`
      <iframe src="/${location.search}"></iframe>
      ${Login()}
    `
    render(app, document.body)
    return
  }

  const app = html`${Widget()} ${!window.parent ? Login() : nothing}`
  render(app, document.body)
}

rerender()

setupGlobalFuncs()
setAdjustHandler()
