import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react'
import { useConfig } from '../../hooks/useConfig'
import type { Bio } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export default function BioEditor() {
  const { config, saveSection } = useConfig()
  const [bio, setBio] = useState<Bio>({ name: '', tagline: '', body: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')
  const configLoaded = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
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
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
              <ToolbarBtn
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive('bold') ?? false}
                title="Bold"
              >
                <Bold size={14} />
              </ToolbarBtn>
              <ToolbarBtn
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive('italic') ?? false}
                title="Italic"
              >
                <Italic size={14} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-gray-300 mx-0.5" />
              <ToolbarBtn
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive('bulletList') ?? false}
                title="Bullet list"
              >
                <List size={14} />
              </ToolbarBtn>
              <ToolbarBtn
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                active={editor?.isActive('orderedList') ?? false}
                title="Ordered list"
              >
                <ListOrdered size={14} />
              </ToolbarBtn>
              <div className="w-px h-4 bg-gray-300 mx-0.5" />
              <ToolbarBtn
                onClick={handleLink}
                active={editor?.isActive('link') ?? false}
                title="Link"
              >
                <LinkIcon size={14} />
              </ToolbarBtn>
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

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
