import { Plugin, PluginKey } from '@tiptap/pm/state'

export const AutoLinkPlugin = new Plugin({
    key: new PluginKey('autoLink'),
    props: {
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        if (text?.match(/^https?:\/\//)) {
          event.preventDefault()
          handleLink(text, view)
          return true
        }
        return false
      },
      handleDrop: (view, event) => {
        const text = event.dataTransfer?.getData('text/plain')
        if (text?.match(/^https?:\/\//)) {
          event.preventDefault()
          handleLink(text, view)
          return true
        }
        return false
      },
    },
})
  
  // Function to handle link insertion and preview
export const handleLink = async (url, view) => {
    try {
      const preview = await fetchLinkPreview(url)
      if (preview) {
        view.dispatch(view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.linkPreview.create({
            url,
            title: preview.title,
            description: preview.description,
            image: preview.image,
            hostname: preview.hostname || new URL(url).hostname
          })
        ))
      } else {
        // Fallback to regular link if preview fails
        view.dispatch(view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.paragraph.create(null, [
            view.state.schema.text(url, [view.state.schema.marks.link.create({ href: url })])
          ])
        ))
      }
    } catch (error) {
      console.error('Error handling link:', error)
    }
}

export const fetchLinkPreview = async (url) => {
    try {
      // You should implement your own metadata fetching service
      // This is just an example structure
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      if (!response.ok) throw new Error('Failed to fetch preview')
      return await response.json()
    } catch (error) {
      console.error('Error fetching link preview:', error)
      return null
    }
}
const setLink = async () => {
    const url = prompt('Enter URL')
    if (!url) return

    // Add https:// if no protocol is specified
    const validUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

    try {
      // Fetch link preview data
      const preview = await fetchLinkPreview(validUrl)
      
      if (preview) {
        // Insert link preview node
        editor.chain().focus().insertContent({
          type: 'linkPreview',
          attrs: {
            url: validUrl,
            title: preview.title,
            description: preview.description,
            image: preview.image,
            hostname: preview.hostname || new URL(validUrl).hostname
          }
        }).run()
      } else {
        // Fallback to regular link if preview fails
        editor.chain().focus().setLink({ href: validUrl }).run()
      }
    } catch (error) {
      console.error('Error setting link:', error)
      // Fallback to regular link
      editor.chain().focus().setLink({ href: validUrl }).run()
    }
}
