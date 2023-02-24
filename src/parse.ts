import * as core from '@actions/core'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import {exec} from '@actions/exec'

export const parse = async (
  filePaths: string[],
  words: string[]
): Promise<void> => {
  core.debug('filePaths.toString()')
  core.debug(filePaths.toString())
  await Promise.all(
    filePaths.map(async filePath => {
      const lineNumers = await getLineNumbers(filePath, words)
      core.debug(lineNumers.toString())
      core.debug('lineNumers done')
      const authors = await getAuthors(filePath, lineNumers)
      core.debug('authors.toString()')
      core.debug(authors.toString())
    })
  )
}

const getLineNumbers = async (
  filePath: string,
  words: string[]
): Promise<string[]> => {
  let output = ''

  const options: ExecOptions = {
    // silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }

  await exec(
    'git',
    [
      'grep',
      '-h',
      '--line-number',
      '--ignore-case',
      ...words.map(word => ['-e', word]).flat(),
      filePath
    ],
    options
  )

  core.debug('lines')
  core.debug(output)

  const lines = output.split('\n').slice(0, -1)
  const lineNumbers = lines.map(line => line.split(':')[0])
  core.debug('lineNumbers')
  core.debug(lineNumbers.toString())

  return lineNumbers
}

const getAuthors = async (
  filePath: string,
  lineNumbers: string[]
): Promise<string[]> => {
  return await Promise.all(
    lineNumbers.map(async lineNumber => await getAuthor(filePath, lineNumber))
  )
}

const getAuthor = async (
  filePath: string,
  lineNumber: string
): Promise<string> => {
  let output = ''

  const options: ExecOptions = {
    // silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }

  await exec(
    'git',
    [
      'blame',
      '--porcelain',
      '-C',
      '-L',
      `${lineNumber},${lineNumber}`,
      filePath,
      '|',
      'grep',
      '"^author "'
    ],
    options
  )

  return output.split(':')[0]
}
