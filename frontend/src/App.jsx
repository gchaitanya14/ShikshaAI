import React, { useState } from 'react'
import Header from './components/Header'
import Tabs from './components/Tabs'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import HistoryPage from './pages/HistoryPage'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'

export default function App() {
  const { theme, toggle } = useTheme()
  const { history, addEntry, clearHistory } = useHistory()
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header theme={theme} onToggleTheme={toggle} />

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        historyCount={history.length}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage onSaveHistory={addEntry} />
        )}
        {activeTab === 'quiz' && (
          <QuizPage />
        )}
        {activeTab === 'history' && (
          <HistoryPage history={history} onClear={clearHistory} />
        )}
      </main>
    </div>
  )
}
