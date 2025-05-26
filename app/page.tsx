'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import NoteList from '@/components/NoteList'
import NoteEditor from '@/components/NoteEditor'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshList, setRefreshList] = useState(0)

  const handleNewNote = async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Note',
        content: '',
        folder_id: selectedFolderId || 1
      })
    })
    
    const newNote = await res.json()
    setSelectedNoteId(newNote.id)
    setRefreshList(prev => prev + 1)
  }

  const handleDeleteNote = () => {
    setSelectedNoteId(null)
    setRefreshList(prev => prev + 1)
  }

  const handleUpdateNote = () => {
    setRefreshList(prev => prev + 1)
  }

  return (
    <>
      <Sidebar
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        onFolderSelect={setSelectedFolderId}
        onTagSelect={setSelectedTagId}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex-1 flex">
          <NoteList
            key={refreshList}
            selectedFolderId={selectedFolderId}
            selectedTagId={selectedTagId}
            selectedNoteId={selectedNoteId}
            onNoteSelect={setSelectedNoteId}
            onNewNote={handleNewNote}
            searchQuery={searchQuery}
          />
          
          <NoteEditor
            noteId={selectedNoteId}
            onDelete={handleDeleteNote}
            onUpdate={handleUpdateNote}
          />
        </div>
      </div>
    </>
  )
}