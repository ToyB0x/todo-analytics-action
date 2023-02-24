import {getMatchedFilepaths} from "./getMatchedfilepaths";
import {parseTodos, Todo} from "./parseTodos";

export const generateTodoReport = async (
  words: string[]
): Promise<Todo[]> => {
  const filePaths = await getMatchedFilepaths(words, 'dist')
  return await parseTodos(filePaths, words)
}
