import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const folders = db.prepare(`
      SELECT f.*, COUNT(n.id) as note_count 
      FROM folders f 
      LEFT JOIN notes n ON f.id = n.folder_id 
      GROUP BY f.id 
      ORDER BY f.name
    `).all();
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json();
    const result = db.prepare(
      'INSERT INTO folders (name, color) VALUES (?, ?)'
    ).run(name, color || '#gray');
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (id === 1) {
      return NextResponse.json({ error: 'Cannot delete General folder' }, { status: 400 });
    }
    db.prepare('DELETE FROM folders WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}