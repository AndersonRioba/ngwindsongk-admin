import { Node } from '@tiptap/core'

export const LinkPreview = Node.create({
    name: 'linkPreview',
    group: 'block',
    atom: true,
  
    addAttributes() {
      return {
        url: '',
        title: '',
        description: '',
        image: '',
        hostname: '',
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'div[data-type="link-preview"]',
        },
      ]
    },
  
    renderHTML({ HTMLAttributes }) {  
      return ['div', { 'data-type': 'link-preview', class: 'link-preview-block relative group' },
        ['a', { href: HTMLAttributes.url, target: '_blank', rel: 'noopener noreferrer', class: 'block p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800' },
          ['div', { class: 'flex gap-3' },
            HTMLAttributes.image ? ['img', { src: HTMLAttributes.image, class: 'w-24 h-24 object-cover rounded' }] : '',
            ['div', { class: 'flex-1' },
              ['div', { class: 'font-medium' }, HTMLAttributes.title || HTMLAttributes.url],
              ['div', { class: 'text-sm text-gray-500 dark:text-gray-400' }, HTMLAttributes.description || ''],
              ['div', { class: 'text-xs text-gray-400 mt-1' }, HTMLAttributes.hostname || new URL(HTMLAttributes.url).hostname]
            ]
          ]
        ]
      ]
    },
})
