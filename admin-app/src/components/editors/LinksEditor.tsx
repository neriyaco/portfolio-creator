import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, Trash2, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useConfig } from '../../hooks/useConfig'
import type { SiteLink } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

function SortableLinkRow({ link, clickCount, primaryColor, onUpdate, onRemove }: {
  link: SiteLink
  clickCount: number
  primaryColor: string
  onUpdate: (id: string, patch: Partial<SiteLink>) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const [showSchedule, setShowSchedule] = useState(!!(link.visibleFrom || link.visibleUntil))

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2">
        <button
          {...listeners}
          {...attributes}
          type="button"
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <input
          type="text"
          placeholder="Label"
          value={link.label}
          onChange={(e) => onUpdate(link.id, { label: e.target.value })}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          placeholder="https://…"
          value={link.url}
          onChange={(e) => onUpdate(link.id, { url: e.target.value })}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Icon"
          value={link.icon}
          onChange={(e) => onUpdate(link.id, { icon: e.target.value })}
          className="w-24 shrink-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={link.visible}
            onChange={(e) => onUpdate(link.id, { visible: e.target.checked })}
            className="rounded"
          />
          Visible
        </label>
        <input
          type="color"
          value={link.color ?? primaryColor}
          onChange={(e) => onUpdate(link.id, { color: e.target.value })}
          title="Button color"
          className="w-8 h-8 shrink-0 rounded border border-gray-300 cursor-pointer p-0.5"
        />
        {clickCount > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0" title={`${clickCount} clicks`}>
            {clickCount} clicks
          </span>
        )}
        <button
          type="button"
          onClick={() => setShowSchedule((s) => !s)}
          title="Schedule visibility"
          className={`p-1.5 rounded transition-colors shrink-0 ${showSchedule ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          <Calendar size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(link.id)}
          className="p-1.5 text-red-400 hover:text-red-600 transition-colors shrink-0"
          aria-label="Delete link"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {showSchedule && (
        <div className="flex flex-wrap items-center gap-3 pl-7">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            Show from
            <input
              type="date"
              value={link.visibleFrom ? link.visibleFrom.slice(0, 10) : ''}
              onChange={(e) => onUpdate(link.id, { visibleFrom: e.target.value || undefined })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            Until
            <input
              type="date"
              value={link.visibleUntil ? link.visibleUntil.slice(0, 10) : ''}
              onChange={(e) => onUpdate(link.id, { visibleUntil: e.target.value || undefined })}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default function LinksEditor() {
  const { config, saveSection } = useConfig()
  const [links, setLinks] = useState<SiteLink[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (config?.links) setLinks(config.links)
  }, [config])

  useEffect(() => {
    supabase.rpc('get_link_click_counts').then(({ data }) => {
      if (data) {
        const map: Record<string, number> = {}
        for (const row of data as { link_id: string; count: number }[]) {
          map[row.link_id] = Number(row.count)
        }
        setClickCounts(map)
      }
    })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((prev) => {
        const oldIndex = prev.findIndex((l) => l.id === active.id)
        const newIndex = prev.findIndex((l) => l.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function addLink() {
    const defaultColor = config?.theme?.primaryColor ?? '#3b82f6'
    setLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: '', url: '', icon: 'Link', color: defaultColor, visible: true },
    ])
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  function updateLink(id: string, patch: Partial<SiteLink>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('links', links)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const primaryColor = config?.theme?.primaryColor ?? '#3b82f6'

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Links</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 mb-4">
            {links.map((link) => (
              <SortableLinkRow
                key={link.id}
                link={link}
                clickCount={clickCounts[link.id] ?? 0}
                primaryColor={primaryColor}
                onUpdate={updateLink}
                onRemove={removeLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addLink}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Add link
        </button>
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
    </section>
  )
}
