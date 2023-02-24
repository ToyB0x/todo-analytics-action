import * as core from '@actions/core'
import {getfilePaths} from './getfilepaths'
import {grep} from './grep'
import {parse} from './parse'

// TODO: sample1
// TODO: sample2
// TODO: sample3
// want: sample1
// want: sample2
// Want: sample3

async function run(): Promise<void> {
  try {
    // const ms: string = core.getInput('milliseconds')

    const words = ['"TODO: "', '"Want"']
    const result = await grep(words, 'dist')
    const filePaths = getfilePaths(result)
    await parse(filePaths, words)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
