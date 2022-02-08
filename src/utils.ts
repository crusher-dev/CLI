import {v1 as uuidv1} from 'uuid'
import {APP_DIRECTORY, BACKEND_SERVER_URL, FRONTEND_SERVER_URL} from './constants'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as url from 'url';
import * as path from 'path';

export function getRuntimeEnv() {
  return eval("process.env");
}


export const getUniqueString = (): string => {
  return uuidv1()
}

export const getBackendServerUrl = (): string => {
  return BACKEND_SERVER_URL
}

export const getFrontendServerUrl = (): string => {
  return FRONTEND_SERVER_URL
}

export const isFromGithub = () => Boolean(getRuntimeEnv().GITHUB_ACTION)

export const getGitRepos = () => {
  const rgx = new RegExp(/(^\w+)\s+([\w.@:/?-]+)\s+\((fetch|push)\)/i)
  return new Promise((resolve, reject) => {
    exec('git remote -v', function (err, stdout) {
      if (err) {
        reject(err)
        return
      }

      const origins = stdout.split('\n')
      const originMap = {}

      if (origins) {
        for (const origin of origins) {
          const match = origin.match(rgx)
          if (match) {
            const remoteName = match[1]
            const repoUrl = match[2]
            const repoType = match[3]
            originMap[remoteName] = {
              ...originMap[remoteName],
              [repoType]: repoUrl,
            }
          }
        }

        resolve(originMap)
      } else {
        reject(new Error('No remote origin found'))
      }
    })
  })
}

export const getGitLastCommitSHA = () => new Promise((resolve, reject) => {
  const cmd = getRuntimeEnv().GITHUB_HEAD_REF ?
    `git ls-remote origin ${getRuntimeEnv().GITHUB_HEAD_REF}` :
    'git rev-parse HEAD'
  exec(cmd, function (err, stdout) {
    if (err) {
      reject(err)
      return
    }

    const sha = stdout.toString().split(/\s+/)[0].trim()
    resolve(sha)
  })
})

export const getLastCommitName = () => new Promise((resolve, reject) => {
  exec('git log -1 --pretty=%B', function (err, stdout) {
    if (err) {
      reject(err)
      return
    }

    const commitName = stdout.toString().trim()
    resolve(commitName)
  })
})

export const getGitBranchName = () => new Promise((resolve, reject) => {
  const rgx = new RegExp(/^refs\/heads\/(.+)/i)
  const headRef = getRuntimeEnv().GITHUB_HEAD_REF ?
    (getRuntimeEnv().GITHUB_HEAD_REF as any) :
    null
  if (headRef) {
    resolve(headRef)
  } else {
    exec(
      'git for-each-ref --format=\'%(objectname) %(refname:short)\' refs/heads | awk "/^$(git rev-parse HEAD)/ {print \\$2}"',
      function (err, stdout) {
        if (err) {
          reject(err)
          return
        }

        const branchName = stdout.toString().trim()
        resolve(branchName)
      },
    )
  }
})

export const extractRepoFullName = remoteName => new Promise(resolve => {
  const rgx = new RegExp(
    /^(?:https|git)(?::\/\/|@)(?:[^/:]+)[/:]([^/:]+)\/(.+)/i,
  )
  const matches = remoteName.match(rgx)
  if (matches && matches.length === 3) {
    const repoName = matches[2].trim()
    const finalRepoName =
      repoName.length > 4 && repoName.slice(-4) === '.git' ?
        repoName.slice(0, -4) :
        repoName

    resolve(matches[1].trim() + '/' + finalRepoName.trim())
  } else {
    resolve('')
  }
})

export const createDirIfNotExist = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

export const resolveBackendServerUrl = (endpoint): string => {
  return url.resolve(BACKEND_SERVER_URL, endpoint);
}

export const resolveFrontendServerUrl = (endpoint): string => {
  return url.resolve(FRONTEND_SERVER_URL, endpoint);
}

export const resolvePathToAppDirectory = (relativePath): string => {
  return path.resolve(APP_DIRECTORY, relativePath);
}

