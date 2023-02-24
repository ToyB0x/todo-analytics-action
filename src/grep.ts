import * as core from '@actions/core'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import {exec} from '@actions/exec'

export const grep = async (
  words: string[],
  ignorePath: string
): Promise<string> => {
  let output = ''
  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      }
    }
  }

  try {
    await exec(
      'git',
      [
        'grep',
        '--files-with-matches',
        '--ignore-case',
        ...words.map(word => ['-e', word]).flat(),
        '--',
        `:!${ignorePath}/`
      ],
      options
    )

    return output
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    core.debug('error')
    throw error
  }
}
