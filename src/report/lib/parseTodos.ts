import * as core from '@actions/core'
import {getExecOutput} from '@actions/exec'
import {z} from 'zod'

export const todoSchema = z.object({
  author: z.string().min(2),
  word: z.string().min(2),
  text: z.string().min(2),
  filePath: z.string().min(2),
  lineNumber: z.string().min(1)
})

export type Todo = z.infer<typeof todoSchema>

// debugしやすさを優先して直列で処理
export const parseTodos = async (
    filePaths: string[],
    words: string[]
): Promise<Todo[]> => {
  // const matchedLines = await Promise.all(
  //     filePaths.map(async filePath => await getMatchedLineAndTexts(filePath, words))
  // )

  const matchedLines: {
    filePath: string
    lineNumber: string
    word: string
    text: string
  }[] = []
  for (const filePath of filePaths) {
    const result = await getMatchedLineAndTexts(filePath, words)
    for (const r of result) {
      matchedLines.push(r)
    }
  }

  // return await Promise.all(
  //   matchedLines.flat().map(async matchedLine => {
  //     const author = await getAuthor(
  //       matchedLine.filePath,
  //       matchedLine.lineNumber
  //     )
  //     return {
  //       author,
  //       ...matchedLine
  //     }
  //   })
  // )
  const todos: Todo[] = []
  for (const matchedLine of matchedLines) {
    const author = await getAuthor(matchedLine.filePath, matchedLine.lineNumber)

    todos.push({
      author,
      ...matchedLine
    })
  }

  todos.splice(-3, 1)

  for (const todo of todos) {
    core.debug("JSON.stringify(todo)")
    core.debug(JSON.stringify(todo))
    todoSchema.parse(todo)
  }

  return todos
}

const getMatchedLineAndTexts = async (
    filePath: string,
    words: string[]
): Promise<
    {filePath: string; lineNumber: string; word: string; text: string}[]
> => {
  // if (!filePath.includes("generatereport.ts") && !filePath.includes("parseTodos.ts")) return []

  const result = await getExecOutput(
      `git grep -h --line-number --ignore-case ${words
          .map(word => ['-e', word].join(' '))
          .join(' ')} ${filePath}`
  )
  // eg) ["6:// word: text"]
  const matchedLines = result.stdout.split('\n').slice(0, -1)

  // return matchedLines
  //     // Note: filter "): Promise<Todo[]> => {"
  //     .filter((line) => line.split(':').length >= 3 && line.split(':')[2].length > 1)
  //     .map((line) => {
  //       // core.debug(line)
  //       const [lineNumber, wordWithCommentOut, text] = line.split(':')
  //       return {
  //         filePath,
  //         lineNumber,
  //         text: text.trim(),
  //         word: words.filter(w=> wordWithCommentOut.toLowerCase().includes(w.toLowerCase()))[0], // "// TODO" --> "TODO"
  //       }
  //   }).filter(e => todoSchema.omit({"author": true}).safeParse(e).success)
  //

  const matchedLineAndTexts: {
    filePath: string
    lineNumber: string
    word: string
    text: string
  }[] = []
  for (const line of matchedLines) {
    const hasExplicitlyColon = line.split(':').length >= 3
    if (!hasExplicitlyColon) continue

    const hasTextComment = line.split(':')[2].length >= 3
    if (!hasTextComment) continue

    const isSecondElementContainTargetWord = words.some(word =>
        line.split(':')[1].toLowerCase().includes(word.toLowerCase())
    )
    if (!isSecondElementContainTargetWord) continue

    const [lineNumber, wordWithCommentOut, ...text] = line.split(':')

    const item = {
      filePath,
      lineNumber,
      // text: text.join(':').trim() + " ",
      text: text.join(':').trim(),
      word: words.filter(w =>
          wordWithCommentOut.toLowerCase().includes(w.toLowerCase())
      )[0] // "// TODO" --> "TODO"
    }

    todoSchema.omit({author: true}).parse(item)
    matchedLineAndTexts.push(item)
  }

  return matchedLineAndTexts
}

const getAuthor = async (
    filePath: string,
    lineNumber: string
): Promise<string> => {
  const result = await getExecOutput(`/bin/bash -c`, [
    `git blame --porcelain -C -L ${lineNumber},${lineNumber} ${filePath} | grep "^author "`
  ])
  return result.stdout.replace('author', '').trim() // 'author ToyB0x\n' --> ToyB0x
}
