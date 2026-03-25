import { useState, useEffect, ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../hooks/useConfig'
import type { Photo } from '../../types'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export default function PhotoEditor() {
  const { config, saveSection } = useConfig()
  const [photo, setPhoto] = useState<Photo>({})
  const [alt, setAlt] = useState('')
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (config?.photo) {
      setPhoto(config.photo)
      setAlt(config.photo.alt ?? '')
    }
  }, [config])

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = MIME_TO_EXT[file.type]
    if (!ext) {
      setErrorMsg('Unsupported file type. Use JPEG, PNG, or WebP.')
      return
    }

    setStatus('uploading')
    setErrorMsg(null)

    const resourceId = crypto.randomUUID()
    const filename = `${resourceId}.${ext}`

    try {
      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filename, file, { upsert: false })

      if (uploadError) throw uploadError

      // Delete old file if a different one existed
      if (photo.resourceId && photo.resourceId !== resourceId) {
        const oldExt = photo.url?.split('.').pop()
        if (oldExt) {
          await supabase.storage
            .from('portfolio')
            .remove([`${photo.resourceId}.${oldExt}`])
        }
      }

      const newPhoto: Photo = {
        resourceId,
        url: `/media/${filename}`,
        alt,
      }

      await saveSection('photo', newPhoto)
      setPhoto(newPhoto)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }

  async function handleAltSave() {
    if (!photo.resourceId) return
    setStatus('uploading')
    try {
      await saveSection('photo', { ...photo, alt })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Photo</h2>
      <div className="flex flex-col gap-4">
        {photo.url && (
          <img
            src={photo.url}
            alt={photo.alt ?? 'Current photo'}
            className="w-24 h-24 rounded-full object-cover shadow"
          />
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Upload new photo
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Upload size={14} />
            {status === 'uploading' ? 'Uploading…' : 'Choose image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              disabled={status === 'uploading'}
            />
          </label>
          {status === 'success' && <span className="ml-3 text-sm text-green-600">Uploaded!</span>}
          {errorMsg && <p className="mt-1 text-sm text-red-600">{errorMsg}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Alt text</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Description of the photo"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAltSave}
              disabled={!photo.resourceId || status === 'uploading'}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
