# StorageX

A Decentralized , encrypted and user-friendly file storage platform powered by Web3 and IPFS Technology.

---
## Overview
**StorageX** is a cutting-edge file storage DApp (Decentralized Application) that leverages **IPFS** (InterPlanetary File System), **blockchain authentication**, and modern front-end technologies to provide a private, censorship-resistant, and permanent way to store and access files.

---
## Features

- **Wallet based File Uploads**
- **Fully Decentralized Storage with IPFS Tech**
- **Blockchain Wallet-Based Web3Auth support**
- **Own Your Data — No Central Authority**
- **Open-Source and Modular**
- **Modern UI with React + TypeScript**

---

## Checkout latest Deployment

https://storage-x-47xm.vercel.app/

*Deployment of backend on render and frontend on vercel*

---

## 🛠 Tech Stack

| Layer         | Technologies Used                    |
|---------------|---------------------------------------|
| Frontend      | React.js, TypeScript, Tailwind CSS    |
| Web3/Auth     | Web3Auth, Ethereum mainnet / Polygon  |
| Storage       | Filebase (IPFS), Crust Network Gateway)|
| Smart Contracts | Solidity (optional integration) **Not Implemented yet*       |
| Backend       | Node.js and Filebase API     |
| Wallets       | Metamask, WalletConnect               |
| Authentication| Web2.0 for Google Auth users               |
|Metadata management| MongoDB Atlas|

---

## Getting Started
### 1. Clone the Repo.
Follow command :
```bash
git clone https://github.com/Sudhirkumar6009/StorageX.git
cd ./StorageX
```
### 2. Install Dependencies
Install dependencies on both frontend and backend : 
```bash
npm install
```
### 3. Run Locally Development
3.1. For `./frontend` use this command : 
```bash
npm run dev
```
3.2. For `./backend` use this command : 
```bash
nodemon
```
### Now your Development is live on local port :8080

**Important** Development uses some environment variables for both frontend and backend. User needs to add `.env` file on both directories and provide KEYS as follows : 

### Frontend Environment Variables
|NAME|INFORMATION|
|----|-----------|
|VITE_BACKEND_PORT_URL|http://localhost:3001 *Backend server*|
|VITE_GOOGLE_CLIENT_ID|XXXX.apps.googleuserscontent.com *Used for GoogleOAuth*|
|VITE_INFURA_ID| XXXX (32 char) *Web3 Wallet Connection*|

### Backend Environment Variables
|NAME|INFORMATION|
|----|-----------|
|ATLAS_URI|mongodb+srv://XX:XX...mongodb.net.. *MongoDB Atlas*|
|BACKEND_PORT_URL|http://localhost:3001 *Backend server*|
|FILEBASE_ACCESS_KEY| XXXX *Used for Filebase access*|
|FILEBASE_BUCKET| {bucket_name} *Used for Filebase access x2*|
|FILEBASE_ENDPOINT| https://s3.filebase.com *Used for Filebase file access x3*|
|FILEBASE_SECRET_KEY| XXXX *Used for Filebase access x4*|
|SECRET_KEY| XXXX *Used for Encryption-Decryption of Profile Info*|

### Contact
For questions or issues,
MAIL ME : sudhir.kuchara@gmail.com :)

