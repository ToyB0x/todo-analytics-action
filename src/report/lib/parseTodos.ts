import {getExecOutput} from '@actions/exec'

export type Todo = {
  author: string
  word: string
  text: string
  filePath: string
  lineNumber: string
}

export const parseTodos = async (
  filePaths: string[],
  words: string[]
): Promise<Todo[]> => {
  const matchedLines = await Promise.all(
    filePaths.map(async filePath => getMatchedLineAndTexts(filePath, words))
  )

  return await Promise.all(
    matchedLines.flat().map(async matchedLine => {
      const author = await getAuthor(
        matchedLine.filePath,
        matchedLine.lineNumber
      )
      return {
        author,
        ...matchedLine
      }
    })
  )
}

const getMatchedLineAndTexts = async (
  filePath: string,
  words: string[]
): Promise<
  {filePath: string; lineNumber: string; word: string; text: string}[]
> => {
  const result = await getExecOutput(
    `git grep -h --line-number --ignore-case ${words
      .map(word => ['-e', word].join(' '))
      .join(' ')} ${filePath}`
  )
  // eg) ["6:// word: text"]
  const matchedLines = result.stdout.split('\n').slice(0, -1)
  return matchedLines.map(line => ({
    filePath,
    lineNumber: line.split(':')[0],
    word: line.split(':')[1],
    text: line.split(':')[2]
  }))
}


const getAuthor = async (
    filePath: string,
    lineNumber: string
): Promise<string> => {
  const result = await getExecOutput(`/bin/bash -c`, [
    `git blame --porcelain -C -L ${lineNumber},${lineNumber} ${filePath} | grep "^author "`
  ])
  return result.stdout
}
