import * as core from '@actions/core'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import {exec} from '@actions/exec'

export const grep = async (
  words: string[],
  ignorePath: string
): Promise<string> => {
  // TODO: handle error
  let myOutput = ''
  // let myError = ''

  const options: ExecOptions = {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString()
      }
      // stderr: (data: Buffer) => {
      //   myError += data.toString()
      // }
    }
  }

  try {
    const targets = words.join('|')
    // await exec(`git grep --ignore-case "TODO" -- ':!dist/'`)
    await exec(
      'git',
      ['grep', '--ignore-case', targets, '--', `:!${ignorePath}/`],
      options
    )

    return myOutput
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    core.debug('error')
    throw error
  }
}
