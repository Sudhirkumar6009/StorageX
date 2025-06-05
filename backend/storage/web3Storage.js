import { Web3Storage } from 'web3.storage';

require('dotenv').config({ path: './storage/.env' });

export function getAccessToken() {
  return process.env.VITE_WEB3_STORAGE_TOKEN;
}

export function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}
