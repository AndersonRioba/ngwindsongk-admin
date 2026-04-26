import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Underline from '@tiptap/extension-underline'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import OrderedList from '@tiptap/extension-ordered-list'
import History from '@tiptap/extension-history'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import {Typography} from '../marks/Typography'
import { AutoLinkPlugin } from '../plugins/Autolink'
import {FileUploadNode} from '../nodes/FileUpload'
import {LinkPreview} from '../nodes/Link'
import { FontSize } from '../marks/FontSize'

export default function createEditorConfig(placeholder, content){
    return {
        extensions: [
          Document,
          Paragraph.configure({
            HTMLAttributes: {
              class: 'text-base mb-3'
            }
          }),
          Text,
          Bold,
          Italic,
          Underline,
          Strike,
          Code,
          Typography,
          OrderedList.configure({
            HTMLAttributes: {
              class: 'list-decimal ml-4',
            },
          }),
          History,
          BulletList.configure({
            HTMLAttributes: {
              class: 'list-disc ml-4',
            },
          }),
          ListItem.configure({
            HTMLAttributes: {
              class: 'my-1',
            },
          }),
          Placeholder.configure({
            placeholder: placeholder,
            emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none',
          }),
          Link.configure({
            openOnClick: true,
            autolink: true,
            HTMLAttributes: {
              class: 'text-blue-500 hover:underline',
              rel: 'noopener noreferrer',
              target: '_blank'
            }
          }),
          Image.configure({
            HTMLAttributes: {
              class: 'w-96 h-auto rounded-lg',
            },
          }),
          FileUploadNode,
          FontSize,
          LinkPreview,
        ],
        content: content,
        editorProps: {
          attributes: {
            class: 'prose max-w-none focus:outline-none prose-headings:mt-4 prose-headings:mb-2'
          },
          plugins: [AutoLinkPlugin],
          handleDOMEvents: {
            click: (view, event) => {
              if (event.target.closest('button[data-delete-node]')) {
                const node = event.target.closest('[data-type]');
                if (node) {
                  const pos = view.posAtDOM(node, 0);
                  view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
                  return true;
                }
              }
              return false;
            },
          },
        },
        immediatelyRender: false,
        onFocus: ({ editor }) => {
          if (editor.isEmpty) {
            editor.commands.focus('end')
          }
        },
    }
}