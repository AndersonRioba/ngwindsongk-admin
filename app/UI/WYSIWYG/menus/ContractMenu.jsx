import { useState, useRef } from 'react'
import { TypographyDropdown } from '../marks/Typography'
import { FontSizeDropdown } from '../marks/FontSize'
import { XScriptDropdown } from '../marks/XScript'

export const MenuBar = ({ editor }) => {    
    if (!editor) {
      return null
    }
  
  
    const menuItems = [
      {
        icon: 'icon-[iconoir--undo]',
        title: 'Undo',
        action: () => editor.chain().focus().undo().run(),
      },
      {
        icon: 'icon-[iconoir--redo]',
        title: 'Redo',
        action: () => editor.chain().focus().redo().run(),
      },
      { type: 'divider' },
      {
        icon: 'icon-[iconoir--text]',
        title: 'Typography',
        component: TypographyDropdown,
      },
      {
        icon: 'icon-[iconoir--font-size]',
        title: 'Font Size',
        component: FontSizeDropdown,
      },
      {
        icon: 'icon-[hugeicons--text-superscript]',
        title: 'Subscript',
        component: XScriptDropdown,
      },
      { type: 'divider' },
      {
        icon: 'icon-[iconoir--bold]',
        title: 'Bold',
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive('bold'),
      },
      {
        icon: 'icon-[iconoir--italic]',
        title: 'Italic',
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive('italic'),
      },
      {
        icon: 'icon-[iconoir--underline]',
        title: 'Underline',
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive('underline'),
      },
      {
        icon: 'icon-[iconoir--strikethrough]',
        title: 'Strike',
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive('strike'),
      },
      { type: 'divider' },
      {
        icon: 'icon-[iconoir--list]',
        title: 'Bullet List',
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive('bulletList'),
      },
      {
        icon: 'icon-[bi--list-ol]',
        title: 'Ordered List',
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive('orderedList'),
      },
    ];


    return (
      <div className="border-b relative rounded-t-xl flex bg-background-grey py-3 border-border-grey dark:border-border-dark p-2 flex-wrap gap-2">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-700" />;
          }
          
          if (item.component) {
            const Component = item.component;
            return (
              <div key={index} className="flex items-center group relative">
                <Component editor={editor} />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.title}
                </span>
              </div>
            );
          }
          
          return (
            <div className="group relative"
              key={index}
            >
              <button
                onClick={item.action}
                className={`
                  px-2 py-1 rounded flex items-center gap-1.5
                  ${item.isActive ? 'bg-gray-200 dark:bg-gray-700' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-800
                `}
              >
                <span className={`${item.icon} w-6 h-6`} />
                <span className="sr-only">{item.isActive && item.activeTitle ? item.activeTitle : item.title}</span>
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.isActive && item.activeTitle ? item.activeTitle : item.title}
              </span>
            </div>
          );
        })}
      </div>
    )
}