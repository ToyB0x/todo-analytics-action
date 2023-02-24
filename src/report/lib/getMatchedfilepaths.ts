import {getExecOutput} from '@actions/exec'

export const getMatchedFilepaths = async (words: string[], ignorePath: string): Promise<string[]> => {

    const result = await getExecOutput(
        'git',
        [
            'grep',
            '--files-with-matches',
            '--ignore-case',
            ...words.map(word => ['-e', word]).flat(),
            '--',
            `:!${ignorePath}/`
        ]
    )

    return result.stdout.split('\n').slice(0, -1) // 最後は不要な改行
}
