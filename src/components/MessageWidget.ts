import { html, TemplateResult } from 'lit-html'
import { until } from 'lit-html/directives/until.js'
import { ifDefined } from 'lit-html/directives/if-defined.js'
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'
import { apis, getFileUrl } from '../apis'
import { render } from '../markdown/markdown'
import { getStore } from '../store'
import { QuotedMessage } from './QuotedMessage'
import { File } from './File'
import { dateToString, isValidUuid } from '../utils'
import { EmbeddingFile, EmbeddingMessage } from '@traptitech/traq-markdown-it'

import '../markdown/markdown.scss'
import 'katex/dist/katex.css'
import './MessageWidget.scss'

export const MessageWidget = (params: URLSearchParams): TemplateResult =>
  html`${until(
    InnerMessageWidget(params),
    html`
      <article class="main-message message" data-is-loading>
        <main class="loading">Now Loading</main>
      </article>
    `
  )}`

const InnerMessageWidget = async (
  params: URLSearchParams
): Promise<TemplateResult> => {
  const id = params.get('id')
  if (id === null) {
    return html`
      <article class="main-message message" data-is-error>
        <main class="error">IDが存在しません</main>
      </article>
    `
  }
  if (!isValidUuid(id)) {
    return html`
      <article class="main-message message" data-is-error>
        <main class="error">
          不正なメッセージIDです。URLが間違っていませんか？
        </main>
      </article>
    `
  }

  try {
    const message = (await apis.getMessage(id)).data
    const rendered = await render(message.content)

    const files = rendered.embeddings.filter(
      (e): e is EmbeddingFile => e.type === 'file'
    )
    const quotedMessages = rendered.embeddings.filter(
      (e): e is EmbeddingMessage => e.type === 'message'
    )

    const store = await getStore()
    const user = await store.getUser(message.userId)
    const channelPath = await store.getChannelPath(message.channelId)

    return html`
      <article class="main-message message">
        <header>
          <img src=${ifDefined(getFileUrl(user?.iconFileId))} />
          <p class="name">${user?.displayName}(@${user?.name})</p>
          <p class="date">${dateToString(message.createdAt)}</p>
        </header>
        <main class="markdown-body">${unsafeHTML(rendered.renderedText)}</main>
        <section>
          ${files.map(({ id }) => File(id))}
          ${quotedMessages.map(({ id }) => QuotedMessage(id))}
        </section>
        <footer>
          <p class="channel-path">${channelPath}</p>
          <a
            href="https://q.trap.jp/messages/${id}"
            target="_blank"
            rel="noopener"
          >
            traQで開く
          </a>
        </footer>
      </article>
    `
  } catch {
    return html`
      <article class="main-message message" data-is-error>
        <main class="error">メッセージ(ID: ${id})の取得に失敗しました</main>
      </article>
    `
  }
}
