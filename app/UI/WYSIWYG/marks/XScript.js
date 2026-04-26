import { Mark } from '@tiptap/core'
import { useState, useRef, useEffect } from 'react'

export const Superscript = Mark.create({
  name: 'superscript',
  
  parseHTML() {
    return [
      { tag: 'sup' },
    ]
  },

  renderHTML() {
    return ['sup', 0]
  },

  addCommands() {
    return {
      toggleSuperscript: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-u': () => this.editor.commands.toggleSuperscript(),
    }
  },
})

export const Subscript = Mark.create({
  name: 'subscript',
  
  parseHTML() {
    return [
      { tag: 'sub' },
    ]
  },

  renderHTML() {
    return ['sub', 0]
  },

  addCommands() {
    return {
      toggleSubscript: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleSubscript(),
    }
  },
}) 

export const XScriptDropdown = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    const setXScript = (type) => {
        if (type === 'superscript') {
            editor.chain().focus().toggleSuperscript().run();
        } else if (type === 'subscript') {
            editor.chain().focus().toggleSubscript().run();
        }
      setIsOpen(false);
    };
  
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1 rounded flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="icon-[hugeicons--text-superscript] w-5 h-5" />
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
                <button 
                    onClick={() => setXScript('superscript')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <span className="icon-[hugeicons--text-superscript] w-4 h-4" />
                    Superscript
                </button>
                <button 
                    onClick={() => setXScript('subscript')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <span className="icon-[hugeicons--text-subscript] w-4 h-4" />
                    Subscript
                </button>
            </div>
          </div>
        )}
      </div>
    );
  }; 