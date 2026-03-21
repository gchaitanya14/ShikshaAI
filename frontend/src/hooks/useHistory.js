import { useState, useCallback } from 'react'

const STORAGE_KEY = 'shiksha_history'
const MAX_ITEMS = 50

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadFromStorage)

  const addEntry = useCallback((entry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}
