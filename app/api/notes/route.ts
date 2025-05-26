import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folder');
    const search = searchParams.get('search');
    
    let query = `
      SELECT n.*, GROUP_CONCAT(t.name) as tags
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (folderId) {
      query += ' AND n.folder_id = ?';
      params.push(folderId);
    }
    
    if (search) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY n.id ORDER BY n.updated_at DESC';
    
    const notes = db.prepare(query).all(...params);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, folder_id, tags = [] } = await request.json();
    
    const result = db.prepare(
      'INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)'
    ).run(title || 'Untitled', content || '', folder_id || 1);
    
    const noteId = result.lastInsertRowid;
    
    for (const tagName of tags) {
      const tag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tagName);
      const tagId = tag.lastInsertRowid || db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName)?.id;
      
      db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(noteId, tagId);
    }
    
    return NextResponse.json({ id: noteId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, folder_id, tags = [] } = await request.json();
    
    db.prepare(
      'UPDATE notes SET title = ?, content = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, content, folder_id, id);
    
    db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);
    
    for (const tagName of tags) {
      const tag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tagName);
      const tagId = tag.lastInsertRowid || db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName)?.id;
      
      db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(id, tagId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}