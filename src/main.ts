import * as core from '@actions/core'
import {generateReport} from './report'

// TODO: sample1
// TODO: sample2
// TODO: sample3
// want: sample1
// want: sample2
// Want: sample3

async function run(): Promise<void> {
  try {
    // TODO: wordsのinputを有効化
    // const words: string = core.getInput('words')

    const words = ['TODO', 'WANT']

    const report = await generateReport(words)
    core.setOutput('report', report)
    core.debug(process.env.GITHUB_REPOSITORY as string)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
