export interface Question {
  id: string
  question: string
  type: 'technical' | 'behavioral' | 'coding'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  answer?: string
  createdAt?: number
}

// Sample questions to seed Firebase
export const sampleQuestions: Question[] = [
  {
    id: '1',
    question: "What is the difference between let, const, and var in JavaScript?",
    type: "technical",
    difficulty: "easy",
    category: "JavaScript",
    tags: ["variables", "es6", "scope"],
    answer: "var is function-scoped and can be re-declared. let is block-scoped and cannot be re-declared. const is block-scoped, cannot be re-declared, and cannot be reassigned."
  },
  {
    id: '2',
    question: "Explain the concept of closures in JavaScript with an example.",
    type: "technical",
    difficulty: "medium",
    category: "JavaScript",
    tags: ["closures", "functions", "scope"],
    answer: "A closure is a function that has access to variables from its outer scope even after the outer function returns. Example: function outer() { let count = 0; return function inner() { count++; return count; } }"
  },
  {
    id: '3',
    question: "How do you optimize React application performance?",
    type: "technical",
    difficulty: "hard",
    category: "React",
    tags: ["performance", "optimization", "react"],
    answer: "Use React.memo, useMemo, useCallback, code splitting with React.lazy, implement virtual scrolling for large lists, use production builds, and profile with React DevTools."
  },
  {
    id: '4',
    question: "Tell me about a challenging project you worked on.",
    type: "behavioral",
    difficulty: "medium",
    category: "General",
    tags: ["experience", "projects", "challenges"],
    answer: "Structure your answer using STAR method: Situation, Task, Action, Result. Focus on your role, challenges faced, and how you overcame them."
  },
  {
    id: '5',
    question: "Implement a function to reverse a string.",
    type: "coding",
    difficulty: "easy",
    category: "Algorithms",
    tags: ["strings", "algorithms", "basic"],
    answer: "function reverseString(str) { return str.split('').reverse().join(''); } or using spread operator: return [...str].reverse().join('');"
  },
  {
    id: '6',
    question: "What is the difference between SQL and NoSQL databases?",
    type: "technical",
    difficulty: "medium",
    category: "Database",
    tags: ["sql", "nosql", "database"],
    answer: "SQL uses structured tables with predefined schemas, ACID transactions, and relationships. NoSQL uses flexible documents/key-value pairs, eventual consistency, and horizontal scaling."
  },
  {
    id: '7',
    question: "Explain REST API principles and best practices.",
    type: "technical",
    difficulty: "medium",
    category: "API",
    tags: ["rest", "api", "http"],
    answer: "Use HTTP methods (GET, POST, PUT, DELETE) for CRUD operations, return appropriate status codes, use meaningful URLs, implement versioning, authenticate requests, and document APIs."
  },
  {
    id: '8',
    question: "Implement a binary search algorithm.",
    type: "coding",
    difficulty: "medium",
    category: "Algorithms",
    tags: ["binary-search", "algorithms", "search"],
    answer: "function binarySearch(arr, target) { let left = 0, right = arr.length - 1; while (left <= right) { const mid = Math.floor((left + right) / 2); if (arr[mid] === target) return mid; if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1; }"
  },
  {
    id: '9',
    question: "What are React hooks and why are they useful?",
    type: "technical",
    difficulty: "medium",
    category: "React",
    tags: ["hooks", "react", "functional-components"],
    answer: "Hooks are functions that let you use state and other React features in functional components. They're useful because they allow code reuse, easier state management, and eliminate the need for class components."
  },
  {
    id: '10',
    question: "Describe your approach to debugging a complex bug in production.",
    type: "behavioral",
    difficulty: "hard",
    category: "General",
    tags: ["debugging", "problem-solving", "production"],
    answer: "Explain your systematic approach: reproduce the issue, check logs/monitoring, isolate the problem, test hypotheses, implement a fix, verify in staging, deploy safely, and monitor results."
  }
]
