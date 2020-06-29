import {v1 as uuidv1} from 'uuid';
import {BACKEND_SERVER_URLS, FRONTEND_SERVER_URLS} from "./constants";
const { exec } = require('child_process');

export const getUniqueString = () : string =>{
  return uuidv1();
}

export const getBackendServerUrl = (): string => {
  const {PROD} = BACKEND_SERVER_URLS;
  return PROD;
}

export const getFrontendServerUrl = (): string => {
  const {DEV,PROD} = FRONTEND_SERVER_URLS;
  return PROD;
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
  return new Promise((resolve, reject) => {
    exec('git rev-parse HEAD', function(err, stdout){
      if(err){reject(err); return;}

      const sha = stdout.toString().trim();
      resolve(sha);
    })
  });
}

export function getGitBranchName() {
  return new Promise((resolve, reject) => {
    const rgx = new RegExp(/^refs\/heads\/(.+)/i);
    const matches = process.env.GITHUB_REF ? (process.env.GITHUB_REF as any).match(rgx) : null;
    if(matches && matches.length > 0) {
      resolve(matches[1].trim());
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
    const rgx =  new RegExp(/https?:\/\/\w+\.\w+\/([\w-]+\/[\w-]+)/i);
    const matches = remoteName.match(rgx);
    if(matches && matches.length > 1){
      resolve(matches[1].trim());
    } else{
      reject(new Error("Can't extract the full repo name"));
    }
  });
}
