import { useState, useEffect, ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../hooks/useConfig'
import type { Logo } from '../../types'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

export default function LogoEditor() {
  const { config, saveSection } = useConfig()
  const [logo, setLogo] = useState<Logo>({})
  const [alt, setAlt] = useState('')
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (config?.logo) {
      setLogo(config.logo)
      setAlt(config.logo.alt ?? '')
    }
  }, [config])

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = MIME_TO_EXT[file.type]
    if (!ext) {
      setErrorMsg('Unsupported file type. Use JPEG, PNG, WebP, or SVG.')
      return
    }

    setStatus('uploading')
    setErrorMsg(null)

    const resourceId = crypto.randomUUID()
    const filename = `${resourceId}.${ext}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filename, file, { upsert: false })

      if (uploadError) throw uploadError

      if (logo.resourceId && logo.resourceId !== resourceId) {
        const oldExt = logo.url?.split('.').pop()
        if (oldExt) {
          await supabase.storage
            .from('portfolio')
            .remove([`${logo.resourceId}.${oldExt}`])
        }
      }

      const newLogo: Logo = { resourceId, url: `/media/${filename}`, alt, maxHeight: logo.maxHeight }
      await saveSection('logo', newLogo)
      setLogo(newLogo)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }

  async function handleMetaSave() {
    if (!logo.resourceId) return
    setStatus('uploading')
    try {
      await saveSection('logo', { ...logo, alt })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    }
  }

  const maxHeight = logo.maxHeight ?? 64

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Logo</h2>
      <div className="flex flex-col gap-4">
        {logo.url && (
          <img
            src={logo.url}
            alt={logo.alt ?? 'Logo'}
            className="max-w-xs object-contain border border-gray-100 rounded-lg p-2"
            style={{ maxHeight }}
          />
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Upload logo</label>
          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Upload size={14} />
            {status === 'uploading' ? 'Uploading…' : 'Choose image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="sr-only"
              disabled={status === 'uploading'}
            />
          </label>
          {status === 'success' && <span className="ml-3 text-sm text-green-600">Saved!</span>}
          {errorMsg && <p className="mt-1 text-sm text-red-600">{errorMsg}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Alt text</label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Your name or brand"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Display height <span className="font-normal text-gray-500">{maxHeight}px</span>
          </label>
          <input
            type="range"
            min={24}
            max={200}
            step={4}
            value={maxHeight}
            onChange={(e) => setLogo((prev) => ({ ...prev, maxHeight: Number(e.target.value) }))}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <button
            onClick={handleMetaSave}
            disabled={!logo.resourceId || status === 'uploading'}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  )
}
