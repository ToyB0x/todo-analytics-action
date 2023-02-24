import {Todo} from './lib'
import {generateTodoReport} from './lib/generateTodoReport'

export type Report = {
  repoName: string
  todos: Todo[]
}

export const generateReport = async (words: string[]): Promise<Report> => {
  const todoReport = await generateTodoReport(words)

  return {
    repoName: 'sample-repo',
    todos: todoReport
  }
}
