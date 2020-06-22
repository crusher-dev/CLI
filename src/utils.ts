import {v1 as uuidv1} from 'uuid';
import {BACKEND_SERVER_URLS, FRONTEND_SERVER_URLS} from "./constants";

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

