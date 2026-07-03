import { useState, useRef } from 'react'
import { FileUploadButton } from './nodes/FileUpload'
import { TypographyDropdown } from './marks/Typography'
import { FontSizeDropdown } from './marks/FontSize'


export const MenuBar = ({ editor, full }) => {
    const [isFullScreen, setIsFullScreen] = useState(full?false:true);
    
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
      { type: 'divider' },
      {
        icon: 'icon-[iconoir--attachment]',
        title: 'Upload Files',
        component: FileUploadButton,
      },
    ];
  
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        // Find the editor container and toggle its class
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer) {
            editorContainer.classList.toggle('fullscreen');
        }
    };

    return (
      <div className="border-b relative rounded-t-xl flex bg-background-grey py-3 border-border-grey p-2 flex-wrap gap-2">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="w-px h-6 bg-gray-300" />;
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
                type="button"
                onClick={item.action}
                className={`
                  px-2 py-1 rounded flex items-center gap-1.5
                  ${item.isActive ? 'bg-gray-200' : ''}
                  hover:bg-gray-100
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

        <button 
            type="button"
            onClick={toggleFullScreen}
            className={`md:absolute md:right-7 md:top-4 w-7 h-7 ${
                isFullScreen
                    ? 'icon-[material-symbols-light--close-fullscreen]'
                    : 'icon-[lets-icons--full-screen-corner-light]'
            }`}
            aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        />
      </div>
    )
}