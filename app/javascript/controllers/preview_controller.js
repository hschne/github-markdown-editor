import { Controller } from "@hotwired/stimulus"
import { post } from "@rails/request.js"
import { DirectUpload } from "@rails/activestorage"

export default class extends Controller {
  static targets = ["editor", "editorContent", "preview", "editorButton", "previewButton"]
  static values = { url: String, uploadUrl: String }

  editor(event) {
    event.preventDefault()
    this.#toggleButton(this.editorButtonTarget, this.previewButtonTarget)
    this.#togglePane(this.editorTarget, this.previewTarget)
  }

  upload(event) {
    if (!event.clipboardData.files.length) return

    event.preventDefault();
    Array.from(event.clipboardData.files).forEach((file) => this.#uploadFile(file));
  }

  preview(event) {
    event.preventDefault()

    post(this.urlValue, {
      body: {
        body: this.editorContentTarget.value
      },
      responseKind: 'turbo-stream'
    })

    this.#toggleButton(this.previewButtonTarget, this.editorButtonTarget)
    this.#togglePane(this.previewTarget, this.editorTarget)
  }

  #uploadFile(file) {
    const upload = new DirectUpload(file, this.uploadUrlValue);
    upload.create((_error, blob) => {
      const url = `/rails/active_storage/blobs/redirect/${blob.signed_id}/${encodeURIComponent(blob.filename)}`
      const link = `![${blob.filename}](${url})\n`
      const start = this.editorContentTarget.selectionStart;
      const end = this.editorContentTarget.selectionEnd;
      this.editorContentTarget.setRangeText(link, start, end);
    });
  }

  #toggleButton(activate, deactivate) {
    activate.classList.remove("bg-gray-100", "hover:bg-gray-50")
    activate.classList.add("bg-blue-600", "hover:bg-blue-500", "text-white")
    deactivate.classList.remove("bg-blue-600", "hover:bg-blue-500", "text-white")
    deactivate.classList.add("bg-gray-100", "hover:bg-gray-50")
  }

  #togglePane(show, hide) {
    show.classList.remove("hidden")
    hide.classList.add("hidden")
  }
}
