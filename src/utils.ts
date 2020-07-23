import {v1 as uuidv1} from 'uuid';
import {BACKEND_SERVER_URL, FRONTEND_SERVER_URL} from "./constants";
const { exec } = require('child_process');

export const getUniqueString = () : string =>{
  return uuidv1();
}

export const getBackendServerUrl = (): string => {
  const {DEV, PROD} = BACKEND_SERVER_URL;
  return process.env.NODE_ENV === "development" ? DEV : PROD;
}

export const getFrontendServerUrl = (): string => {
  const {DEV,PROD} = FRONTEND_SERVER_URL;
  return process.env.NODE_ENV === "development" ? DEV : PROD;
}


export function isFromGithub() {
  return !!process.env.GITHUB_ACTION;
}

export function getGitRepos(){
  const rgx = new RegExp(/(^\w+)\s+([\w.@:\/\?]+)\s+\((fetch|push)\)/i);
  return new Promise((resolve, reject) => {
    exec('git remote -v', function(err, stdout) {
      if(err){reject(err); return;}

      const origins = stdout.split("\n");
      const originMap = {};
      if(origins){
        for(let origin of origins){
          const match = origin.match(rgx);
          if(match){
            const remoteName = match[1];
            const repoUrl = match[2];
            const repoType = match[3];
            originMap[remoteName] = {...originMap[remoteName], [repoType]: repoUrl};
          }
        }
        resolve(originMap);
      } else {
        reject(new Error("No remote origin found"));
      }
    });
  });
}

export function getGitLastCommitSHA() {
  return new Promise(async (resolve, reject) => {
    const cmd = process.env.GITHUB_HEAD_REF ? `git ls-remote origin ${process.env.GITHUB_HEAD_REF}` : `git rev-parse HEAD`;
    exec(cmd, function(err, stdout){
      if(err){reject(err); return;}

      const sha = stdout.toString().split(/\s+/)[0].trim();
      resolve(sha);
    })
  });
}

export function getLastCommitName(){
  return new Promise((resolve, reject)=>{
    exec(`git log -1 --pretty=%B`, function(err, stdout){
      if(err){reject(err); return;}

      const commitName = stdout.toString().trim();
      resolve(commitName);
    })
  });
}

export function getGitBranchName() {
  return new Promise((resolve, reject) => {
    const rgx = new RegExp(/^refs\/heads\/(.+)/i);
    const headRef = process.env.GITHUB_HEAD_REF ? (process.env.GITHUB_HEAD_REF as any) : null;
    if(headRef) {
      resolve(headRef);
    } else {
      exec(`git for-each-ref --format='%(objectname) %(refname:short)' refs/heads | awk "/^$(git rev-parse HEAD)/ {print \\$2}"`, function(err, stdout) {
        if (err) {
          reject(err);
          return;
        }

        const branchName = stdout.toString().trim();
        resolve(branchName);
      });
    }
  });
}

export function extractRepoFullName(remoteName){
  return new Promise((resolve, reject)=>{
    const rgx =  new RegExp(/^(?:https|git)(?:\:\/\/|@)(?:[^\/:]+)[\/:]([^\/:]+)\/(.+)/i);
    const matches = remoteName.match(rgx);
    if (matches && matches.length === 3){
      let repoName = matches[2].trim();
      const finalRepoName = repoName.length > 4 && repoName.slice(-4) === ".git" ? repoName.slice(0,-4) : repoName;

      resolve(matches[1].trim()+"/"+finalRepoName.trim());
    } else{
      resolve("");
    }
  });
}
