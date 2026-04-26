import { Node } from '@tiptap/core'

export const ContractLinkPreview = Node.create({
    name: 'contractLinkPreview',
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
            ['div', { class: 'text-xs text-gray-400 mt-1' }, HTMLAttributes.hostname || new URL(HTMLAttributes.url).hostname]
        ]
      ]
    },
})
