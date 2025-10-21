import React, { useState, useEffect } from 'react'

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem('notes') || '[]')
  } catch {
    return []
  }
}

function saveNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes))
}

export default function App() {
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ title: '', content: '' })
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, recent, starred

  useEffect(() => {
    setNotes(loadNotes())
  }, [])

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'starred') return matchesSearch && note.starred
    if (filter === 'recent') {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000
      return matchesSearch && new Date(note.updatedAt).getTime() > dayAgo
    }
    return matchesSearch
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() && !form.content.trim()) return

    if (editingId) {
      const updated = notes.map((n) =>
        n.id === editingId
          ? { ...n, ...form, updatedAt: new Date().toISOString() }
          : n
      )
      setNotes(updated)
      saveNotes(updated)
      setEditingId(null)
    } else {
      const newNote = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        title: form.title,
        content: form.content,
        starred: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updated = [newNote, ...notes]
      setNotes(updated)
      saveNotes(updated)
    }
    setForm({ title: '', content: '' })
  }

  function handleEdit(note) {
    setEditingId(note.id)
    setForm({ title: note.title, content: note.content })
  }

  function handleDelete(id) {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    saveNotes(updated)
    if (editingId === id) {
      setEditingId(null)
      setForm({ title: '', content: '' })
    }
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ title: '', content: '' })
  }

  function toggleStar(id) {
    const updated = notes.map(n => 
      n.id === id ? { ...n, starred: !n.starred } : n
    )
    setNotes(updated)
    saveNotes(updated)
  }

  function clearSearch() {
    setSearchTerm('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 My Notes</h1>
        <div className="stats">
          <span className="stat-badge">{notes.length} total</span>
          <span className="stat-badge">{notes.filter(n => n.starred).length} ⭐</span>
        </div>
      </header>

      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-btn">✕</button>
          )}
        </div>
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            Recent
          </button>
          <button 
            className={`filter-tab ${filter === 'starred' ? 'active' : ''}`}
            onClick={() => setFilter('starred')}
          >
            Starred
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="editor">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Note title..."
          className="input-title"
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Start writing..."
          rows={4}
          className="input-content"
        />
        <div className="actions">
          <button type="submit" className="btn-primary">
            {editingId ? '💾 Update' : '➕ Add Note'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty">
            {searchTerm ? (
              <>
                <div className="empty-icon">🔍</div>
                <p>No notes found matching "{searchTerm}"</p>
                <button onClick={clearSearch} className="btn-link">Clear search</button>
              </>
            ) : (
              <>
                <div className="empty-icon">✍️</div>
                <p>No notes yet. Create your first note above!</p>
              </>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((n) => (
              <div key={n.id} className={`note-card ${editingId === n.id ? 'editing' : ''}`}>
                <div className="note-header">
                  <div className="note-title-row">
                    <strong>{n.title || 'Untitled'}</strong>
                    <button 
                      onClick={() => toggleStar(n.id)} 
                      className={`star-btn ${n.starred ? 'starred' : ''}`}
                      title={n.starred ? 'Unstar' : 'Star'}
                    >
                      {n.starred ? '⭐' : '☆'}
                    </button>
                  </div>
                  <small>{new Date(n.updatedAt).toLocaleString()}</small>
                </div>
                <pre className="note-content">{n.content}</pre>
                <div className="note-actions">
                  <button onClick={() => handleEdit(n)} className="btn-edit">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(n.id)} className="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
