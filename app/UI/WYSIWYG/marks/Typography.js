import { Mark } from '@tiptap/core'
import { useState } from 'react'
// Custom Typography Node
export const Typography = Mark.create({
    name: 'typography',
    
    addAttributes() {
      return {
        level: {
          default: 'p',
          parseHTML: element => {
            return element.tagName.toLowerCase()
          },
        },
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'span[data-typography]',
          getAttrs: element => ({
            level: element.getAttribute('data-typography'),
          }),
        },
      ]
    },
  
    renderHTML({ mark, HTMLAttributes }) {
      const classes = {
        p: 'text-base',
        h1: 'text-4xl font-bold',
        h2: 'text-2xl font-bold',
        h3: 'text-xl font-bold',
      }
  
      return ['span', { 
        ...HTMLAttributes,
        'data-typography': mark.attrs.level,
        class: classes[mark.attrs.level],
      }, 0]
    },
  
    addCommands() {
      return {
        setTypography: (attributes) => ({ commands }) => {
          return commands.setMark('typography', attributes)
        },
        toggleTypography: (attributes) => ({ commands }) => {
          return commands.toggleMark('typography', attributes)
        },
      }
    },
})

// Add Typography dropdown component
export const TypographyDropdown = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    if (!editor) return null;
  
    const options = [
      { 
        label: 'Paragraph', 
        action: () => editor.chain().focus().setTypography({ level: 'p' }).run(),
        isActive: () => editor.isActive('typography', { level: 'p' })
      },
      { 
        label: 'Heading 1', 
        action: () => editor.chain().focus().setTypography({ level: 'h1' }).run(),
        isActive: () => editor.isActive('typography', { level: 'h1' })
      },
      { 
        label: 'Heading 2', 
        action: () => editor.chain().focus().setTypography({ level: 'h2' }).run(),
        isActive: () => editor.isActive('typography', { level: 'h2' })
      },
      { 
        label: 'Heading 3', 
        action: () => editor.chain().focus().setTypography({ level: 'h3' }).run(),
        isActive: () => editor.isActive('typography', { level: 'h3' })
      },
    ];
  
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1 rounded flex items-center gap-1"
        >
          <span className='icon-[fluent--text-16-regular] w-6 h-6'/>
          <span className={`transition-transform duration-200 icon-[heroicons--chevron-down] w-5 h-5 ${isOpen ? 'rotate-180' : ''}`}></span>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[150px] z-50">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                  option.isActive?.()
                    ? 'bg-gray-200'
                    : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
};