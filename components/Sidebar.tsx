'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Folder, Tag, X } from 'lucide-react'

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

interface SidebarProps {
  selectedFolderId: number | null
  selectedTagId: number | null
  onFolderSelect: (folderId: number | null) => void
  onTagSelect: (tagId: number | null) => void
}

export default function Sidebar({ selectedFolderId, selectedTagId, onFolderSelect, onTagSelect }: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)

  useEffect(() => {
    fetchFolders()
    fetchTags()
  }, [])

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

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName })
    })
    
    setNewFolderName('')
    setShowNewFolder(false)
    fetchFolders()
  }

  const createTag = async () => {
    if (!newTagName.trim()) return
    
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName })
    })
    
    setNewTagName('')
    setShowNewTag(false)
    fetchTags()
  }

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-600">FOLDERS</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowNewFolder(!showNewFolder)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {showNewFolder && (
          <div className="flex gap-1 mb-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              placeholder="Folder name"
              className="h-8"
            />
            <Button size="sm" onClick={createFolder}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setShowNewFolder(false)
              setNewFolderName('')
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="space-y-1">
          <Button
            variant={selectedFolderId === null ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onFolderSelect(null)
              onTagSelect(null)
            }}
          >
            All Notes
          </Button>
          
          {folders.map(folder => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onFolderSelect(folder.id)
                onTagSelect(null)
              }}
            >
              <Folder className="h-4 w-4 mr-2" />
              {folder.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-600">TAGS</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowNewTag(!showNewTag)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {showNewTag && (
          <div className="flex gap-1 mb-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTag()}
              placeholder="Tag name"
              className="h-8"
            />
            <Button size="sm" onClick={createTag}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setShowNewTag(false)
              setNewTagName('')
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="space-y-1">
          {tags.map(tag => (
            <Button
              key={tag.id}
              variant={selectedTagId === tag.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onTagSelect(tag.id)
                onFolderSelect(null)
              }}
            >
              <Tag className="h-4 w-4 mr-2" />
              {tag.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}