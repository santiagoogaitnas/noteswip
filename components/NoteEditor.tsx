'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Tag, Folder } from 'lucide-react'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  folder_id: number
  folder_name?: string
  tags?: Array<{ id: number; name: string; color: string | null }>
}

interface Folder {
  id: number
  name: string
  color: string | null
}

interface Tag {
  id: number
  name: string
  color: string | null
}

interface NoteEditorProps {
  noteId: number | null
  onDelete: () => void
  onUpdate: () => void
}

export default function NoteEditor({ noteId, onDelete, onUpdate }: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number>(1)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [showFolderSelect, setShowFolderSelect] = useState(false)
  const [showTagSelect, setShowTagSelect] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchFolders()
    fetchTags()
  }, [])

  useEffect(() => {
    if (noteId) {
      fetchNote()
    } else {
      setNote(null)
      setTitle('')
      setContent('')
      setSelectedFolderId(1)
      setSelectedTagIds([])
    }
  }, [noteId])

  useEffect(() => {
    if (note && (title !== note.title || content !== note.content)) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote()
      }, 1000)
    }
  }, [title, content])

  const fetchNote = async () => {
    const res = await fetch(`/api/notes?id=${noteId}`)
    const data = await res.json()
    if (data) {
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
      setSelectedFolderId(data.folder_id)
      setSelectedTagIds(data.tags?.map((t: Tag) => t.id) || [])
    }
  }

  const fetchFolders = async () => {
    const res = await fetch('/api/folders')
    const data = await res.json()
    setFolders(data)
  }

  const fetchTags = async () => {
    const res = await fetch('/api/tags')
    const data = await res.json()
    setTags(data)
  }

  const saveNote = async () => {
    if (!note) return
    
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: note.id,
        title,
        content,
        folder_id: selectedFolderId
      })
    })
    
    onUpdate()
  }

  const handleDelete = async () => {
    if (!note || !confirm('Are you sure you want to delete this note?')) return
    
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: note.id })
    })
    
    onDelete()
  }

  const updateFolder = async (folderId: number) => {
    if (!note) return
    
    setSelectedFolderId(folderId)
    setShowFolderSelect(false)
    
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: note.id,
        folder_id: folderId
      })
    })
    
    onUpdate()
  }

  const toggleTag = async (tagId: number) => {
    if (!note) return
    
    const hasTag = selectedTagIds.includes(tagId)
    
    if (hasTag) {
      await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_id: note.id,
          tag_id: tagId,
          remove_tag: true
        })
      })
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId))
    } else {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_id: note.id,
          tag_id: tagId,
          add_tag: true
        })
      })
      setSelectedTagIds([...selectedTagIds, tagId])
    }
    
    onUpdate()
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a note or create a new one</p>
      </div>
    )
  }

  const currentFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-xl font-semibold border-none focus:ring-0 p-0"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFolderSelect(!showFolderSelect)}
              className="text-gray-600"
            >
              <Folder className="h-4 w-4 mr-1" />
              {currentFolder?.name || 'Select folder'}
            </Button>
            
            {showFolderSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => updateFolder(folder.id)}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagSelect(!showTagSelect)}
              className="text-gray-600"
            >
              <Tag className="h-4 w-4 mr-1" />
              Tags ({selectedTagIds.length})
            </Button>
            
            {showTagSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      selectedTagIds.includes(tag.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none border-none focus:outline-none"
        />
      </div>
    </div>
  )
}