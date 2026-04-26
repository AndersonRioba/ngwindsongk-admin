import { Mark } from '@tiptap/core'
import { useState, useRef, useEffect } from 'react';

const FONT_SIZES = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'];

export const FontSize = Mark.create({
    name: 'fontSize',
    
    addAttributes() {
      return {
        size: {
          default: '16px',
          parseHTML: element => {
            return element.style.fontSize || '16px'
          },
          renderHTML: attributes => {
            return {
              style: `font-size: ${attributes.size}`
            }
          }
        }
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'span[style*="font-size"]'
        }
      ]
    },
  
    renderHTML({ HTMLAttributes }) {
      return ['span', HTMLAttributes, 0]
    },
  
    addCommands() {
      return {
        setFontSize: (size) => ({ chain }) => {
          return chain()
            .setMark('fontSize', { size })
            .run()
        }
      }
    }
})

export const FontSizeDropdown = ({ editor }) => {
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

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 rounded flex items-center gap-1.5 hover:bg-gray-100"
      >
        <span className="icon-[iconoir--font-size] w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setFontSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 