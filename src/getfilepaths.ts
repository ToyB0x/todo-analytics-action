export const getfilePaths = (stdout: string): string[] =>
  stdout.split('\n').slice(0, -1) // 最後は不要な改行
