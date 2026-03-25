import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Link as LinkIcon, Palette,
} from 'lucide-react'
import { useConfig } from '../../hooks/useConfig'
import type { Bio } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

const BLOCK_OPTIONS = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
]

const FONT_SIZES = ['12px', '14px', '16px', '18px', '24px', '32px', '48px']

export default function BioEditor() {
  const { config, saveSection } = useConfig()
  const [bio, setBio] = useState<Bio>({ name: '', tagline: '', body: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')
  const configLoaded = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setBio((prev) => ({ ...prev, body: editor.getHTML() }))
    },
  })

  useEffect(() => {
    if (config?.bio && !configLoaded.current) {
      configLoaded.current = true
      setBio(config.bio)
      editor?.commands.setContent(config.bio.body ?? '')
    }
  }, [config, editor])

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('bio', bio)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  function handleLink() {
    if (!editor) return
    const current = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', current ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  function getBlockType() {
    if (!editor) return 'paragraph'
    for (let level = 1; level <= 3; level++) {
      if (editor.isActive('heading', { level })) return `h${level}`
    }
    return 'paragraph'
  }

  function setBlockType(value: string) {
    if (!editor) return
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  const textColor = (editor?.getAttributes('textStyle').color as string | undefined) ?? '#111827'
  const fontSize = (editor?.getAttributes('textStyle').fontSize as string | undefined) ?? ''

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Bio</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={bio.name ?? ''}
            onChange={(e) => setBio({ ...bio, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tagline</label>
          <input
            type="text"
            value={bio.tagline ?? ''}
            onChange={(e) => setBio({ ...bio, tagline: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Body</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden tiptap-editor focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
              {/* Block type */}
              <select
                value={getBlockType()}
                onChange={(e) => setBlockType(e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {BLOCK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {/* Font size */}
              <select
                value={fontSize}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    editor?.chain().focus().unsetFontSize().run()
                  } else {
                    editor?.chain().focus().setFontSize(val).run()
                  }
                }}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ml-0.5"
              >
                <option value="">Size</option>
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Sep />
              {/* Text style */}
              <Btn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold') ?? false} title="Bold">
                <Bold size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic') ?? false} title="Italic">
                <Italic size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline') ?? false} title="Underline">
                <UnderlineIcon size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike') ?? false} title="Strikethrough">
                <Strikethrough size={13} />
              </Btn>
              <Sep />
              {/* Text color */}
              <label className="relative flex items-center p-1.5 rounded cursor-pointer hover:bg-gray-200 transition-colors" title="Text color">
                <Palette size={13} className="text-gray-600 pointer-events-none" />
                <div
                  className="w-2 h-2 rounded-full absolute bottom-1 right-1 border border-white"
                  style={{ backgroundColor: textColor }}
                />
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  value={textColor}
                  onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                />
              </label>
              <Sep />
              {/* Alignment */}
              <Btn onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' }) ?? false} title="Align left">
                <AlignLeft size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' }) ?? false} title="Align center">
                <AlignCenter size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' }) ?? false} title="Align right">
                <AlignRight size={13} />
              </Btn>
              <Sep />
              {/* Lists */}
              <Btn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList') ?? false} title="Bullet list">
                <List size={13} />
              </Btn>
              <Btn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList') ?? false} title="Ordered list">
                <ListOrdered size={13} />
              </Btn>
              <Sep />
              {/* Link */}
              <Btn onClick={handleLink} active={editor?.isActive('link') ?? false} title="Link">
                <LinkIcon size={13} />
              </Btn>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Saved!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Save failed</span>}
        </div>
      </div>
    </section>
  )
}

function Btn({ onClick, active, title, children }: {
  onClick: () => void; active: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-gray-300 mx-0.5" />
}
