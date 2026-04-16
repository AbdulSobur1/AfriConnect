'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { QuizResponse } from '@/lib/types'

interface QuizContextType {
  quizResults: QuizResponse | null
  setQuizResults: (results: QuizResponse | null) => void
  hasCompletedQuiz: boolean
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizResults, setQuizResults] = useLocalStorage<QuizResponse | null>('afri_quiz_results', null)

  return (
    <QuizContext.Provider
      value={{
        quizResults,
        setQuizResults,
        hasCompletedQuiz: quizResults !== null,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within QuizProvider')
  }
  return context
}
