import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Image } from '@tiptap/extension-image'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Palette,
  ImageIcon, ArrowLeft, Eye, EyeOff, Save,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

const BLOCK_OPTIONS = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
]
const FONT_SIZES = ['12px', '14px', '16px', '18px', '24px', '32px', '48px']

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PostEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [coverUploading, setCoverUploading] = useState(false)
  const [postId, setPostId] = useState<string | null>(id ?? null)

  const slugTouched = useRef(false)
  const contentLoaded = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: '',
  })

  useEffect(() => {
    if (!id || contentLoaded.current || !editor) return
    supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      const post = data as Post
      contentLoaded.current = true
      setTitle(post.title)
      setSlug(post.slug)
      setExcerpt(post.excerpt)
      setCoverUrl(post.cover_url)
      setPublished(post.published)
      editor.commands.setContent(post.content)
    })
  }, [id, editor])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched.current) setSlug(slugify(value))
  }

  async function uploadToStorage(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `blog/${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true })
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
    return publicUrl
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true)
    const url = await uploadToStorage(file, 'covers')
    if (url) setCoverUrl(url)
    setCoverUploading(false)
  }

  async function handleInlineImage(file: File) {
    const url = await uploadToStorage(file, 'images')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  async function handleSave(togglePublish?: boolean) {
    setStatus('saving')
    const nextPublished = togglePublish !== undefined ? !published : published
    const content = editor?.getHTML() ?? ''

    const payload = {
      slug,
      title,
      excerpt,
      content,
      cover_url: coverUrl,
      published: nextPublished,
      ...(nextPublished && !published ? { published_at: new Date().toISOString() } : {}),
    }

    let savedId = postId
    let saveError: Error | null = null

    if (postId) {
      const { error } = await supabase.from('posts').update(payload).eq('id', postId)
      saveError = error
    } else {
      const { data, error } = await supabase.from('posts').insert(payload).select('id').single()
      saveError = error
      if (!error && data) {
        savedId = data.id
        setPostId(savedId)
      }
    }

    if (saveError) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      if (togglePublish !== undefined) setPublished(nextPublished)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
      if (isNew && savedId) navigate(`/posts/${savedId}`, { replace: true })
    }
  }

  function handleLink() {
    if (!editor) return
    const current = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', current ?? '')
    if (url === null) return
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
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
    if (value === 'paragraph') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().setHeading({ level: parseInt(value[1]) as 1 | 2 | 3 }).run()
  }

  const textColor = (editor?.getAttributes('textStyle').color as string | undefined) ?? '#111827'
  const fontSize = (editor?.getAttributes('textStyle').fontSize as string | undefined) ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/posts')}
          className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded"
          title="Back to posts"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-lg font-semibold text-gray-800 flex-1">
          {isNew ? 'New Post' : 'Edit Post'}
        </span>
        <div className="flex items-center gap-2">
          {status === 'success' && <span className="text-sm text-green-600">Saved!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Save failed</span>}
          <button
            onClick={() => handleSave()}
            disabled={status === 'saving'}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Save size={14} className="shrink-0" />
            <span className="hidden sm:inline">Save draft</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={status === 'saving'}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 ${
              published
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {published
              ? <><EyeOff size={14} className="shrink-0" /><span className="hidden sm:inline">Unpublish</span></>
              : <><Eye size={14} className="shrink-0" /><span className="hidden sm:inline">Publish</span></>}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-5">
        {/* Title */}
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 bg-transparent pb-2 focus:outline-none focus:border-blue-400 placeholder:text-gray-200"
        />

        {/* Slug */}
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-sm text-gray-400 shrink-0">/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => { slugTouched.current = true; setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, '-')) }}
            className="flex-1 text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover image</label>
          {coverUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={coverUrl} alt="Cover" className="w-full h-52 object-cover" />
              <button
                onClick={() => setCoverUrl(null)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
              <span className="text-sm text-gray-400">
                {coverUploading ? 'Uploading…' : 'Click to upload cover image'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}
              />
            </label>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            placeholder="A short summary shown in the blog list…"
            value={excerpt}
            rows={2}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <div className="border border-gray-300 rounded-xl overflow-hidden tiptap-editor focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
              <select
                value={getBlockType()}
                onChange={(e) => setBlockType(e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {BLOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={fontSize}
                onChange={(e) => {
                  const v = e.target.value
                  v ? editor?.chain().focus().setFontSize(v).run()
                    : editor?.chain().focus().unsetFontSize().run()
                }}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 ml-0.5"
              >
                <option value="">Size</option>
                {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Sep />
              <Btn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold') ?? false} title="Bold"><Bold size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic') ?? false} title="Italic"><Italic size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline') ?? false} title="Underline"><UnderlineIcon size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike') ?? false} title="Strikethrough"><Strikethrough size={13} /></Btn>
              <Sep />
              <label className="relative flex items-center p-1.5 rounded cursor-pointer hover:bg-gray-200 transition-colors" title="Text color">
                <Palette size={13} className="text-gray-600 pointer-events-none" />
                <div className="w-2 h-2 rounded-full absolute bottom-1 right-1 border border-white" style={{ backgroundColor: textColor }} />
                <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={textColor} onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()} />
              </label>
              <Sep />
              <Btn onClick={() => editor?.chain().focus().setTextAlign('left').run()} active={editor?.isActive({ textAlign: 'left' }) ?? false} title="Align left"><AlignLeft size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().setTextAlign('center').run()} active={editor?.isActive({ textAlign: 'center' }) ?? false} title="Align center"><AlignCenter size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().setTextAlign('right').run()} active={editor?.isActive({ textAlign: 'right' }) ?? false} title="Align right"><AlignRight size={13} /></Btn>
              <Sep />
              <Btn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList') ?? false} title="Bullet list"><List size={13} /></Btn>
              <Btn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList') ?? false} title="Ordered list"><ListOrdered size={13} /></Btn>
              <Sep />
              <Btn onClick={handleLink} active={editor?.isActive('link') ?? false} title="Link"><LinkIcon size={13} /></Btn>
              <Sep />
              <label className="flex items-center p-1.5 rounded cursor-pointer text-gray-600 hover:bg-gray-200 transition-colors" title="Insert image">
                <ImageIcon size={13} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { handleInlineImage(f); e.target.value = '' }
                  }}
                />
              </label>
            </div>
            <EditorContent editor={editor} className="min-h-[400px] px-1" />
          </div>
        </div>
      </main>
    </div>
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
