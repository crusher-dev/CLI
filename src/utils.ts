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
  const rgx = new RegExp(/(^\w+)\s+([\w.@:\/\?]+\.git)\s+\((fetch|push)\)/i);
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
    exec('git rev-parse --abbrev-ref HEAD', function(err, stdout){
      if(err){reject(err); return;}

      const branchName = stdout.toString().trim();
      resolve(branchName);
    });
  });
}
