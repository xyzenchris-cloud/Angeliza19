export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswers: string[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'favorite-color',
    question: "What is Angeliza's favorite color?",
    options: ['Blue', 'Pink', 'Black'],
    correctAnswers: ['Blue'],
  },
  {
    id: 'height',
    question: "What is Angeliza's height?",
    options: ['Minion height', 'Bochoc', 'Small as a dwarf'],
    correctAnswers: ['Bochoc'],
  },
  {
    id: 'chris-cute',
    question: 'Is Chris cute?',
    options: ['Yes', 'Hell Yes', 'No'],
    correctAnswers: ['Hell Yes'],
  },
  {
    id: 'q4',
    question: 'Gaano kalambing si Chris?',
    options: ['Super lambing', 'Onti lang', 'Mapang-asar'],
    correctAnswers: ['Super lambing'],
  },
  {
    id: 'q5',
    question: 'Ano ang paboritong pagkain ni Angeliza?',
    options: ['McDo', 'McDonalds', 'Jollibee'],
    correctAnswers: ['McDo', 'McDonalds'],
  },
  {
    id: 'q6',
    question: 'Ano ang paboritong linya ni Angeliza?',
    options: ['"Bwiset"', '"Sorry (malabo...)"', '"Nyenyenyenye"'],
    correctAnswers: ['"Nyenyenyenye"'],
  },
  {
    id: 'q7',
    question: 'Bakit napaka cute ng baby ko na yan?',
    options: ['Natural Beauty', 'Forever baby ni Chris e', 'Sinwerte lang'],
    correctAnswers: ['Forever baby ni Chris e'],
  },
]
