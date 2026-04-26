import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { MenuBar } from './Menu'
import createEditorConfig from './configs/editor'

export default function Editor({content, setContent, placeholder, className}){
  const editor = useEditor(createEditorConfig(placeholder, content))

  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        const newContent = editor.getHTML();
        if (newContent !== '<p class="text-base mb-3"></p>') {
          setContent(newContent);
        }
      });
    }
  }, [editor, setContent]);

  useEffect(()=>{
    // Only set content if the editor is empty (default)
    if (editor && editor.getHTML() === '<p class="text-base mb-3"></p>' && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null

  return (
    <section
        className={`shadow-xl md:shadow-md right-0 mx-2 bg-white dark:bg-background-dark border rounded-xl border-border-grey dark:border-border-dark`}
        onClick={() => editor?.commands.focus()}
      >
        <MenuBar editor={editor} />
        <div className="flex gap-2 p-4 bg-white dark:bg-background-dark truncate editor-container">
          <EditorContent 
            editor={editor} 
            className={`flex-1 p-4 rounded-lg ${className}`} 
          />
        </div>
    </section>
  )
}