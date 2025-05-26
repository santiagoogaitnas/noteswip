'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

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

interface NoteListProps {
  selectedFolderId: number | null
  selectedTagId: number | null
  selectedNoteId: number | null
  onNoteSelect: (noteId: number) => void
  onNewNote: () => void
  searchQuery: string
}

export default function NoteList({ 
  selectedFolderId, 
  selectedTagId, 
  selectedNoteId, 
  onNoteSelect, 
  onNewNote,
  searchQuery 
}: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    fetchNotes()
  }, [selectedFolderId, selectedTagId, searchQuery])

  const fetchNotes = async () => {
    let url = '/api/notes'
    const params = new URLSearchParams()
    
    if (selectedFolderId) params.append('folder_id', selectedFolderId.toString())
    if (selectedTagId) params.append('tag_id', selectedTagId.toString())
    if (searchQuery) params.append('q', searchQuery)
    
    if (params.toString()) url += '?' + params.toString()
    
    const res = await fetch(url)
    const data = await res.json()
    setNotes(data)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString()
  }

  const getPreview = (content: string) => {
    const preview = content.substring(0, 100).replace(/\n/g, ' ')
    return preview + (content.length > 100 ? '...' : '')
  }

  return (
    <div className="w-80 h-full border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button onClick={onNewNote} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notes found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedNoteId === note.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onNoteSelect(note.id)}
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {note.title || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {getPreview(note.content)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(note.updated_at)}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-1 bg-gray-200 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}