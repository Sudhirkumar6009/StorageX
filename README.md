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
## 🛠 Tech Stack

| Layer         | Technologies Used                    |
|---------------|---------------------------------------|
| Frontend      | React.js, TypeScript, Tailwind CSS    |
| Web3/Auth     | Web3Auth, Ethereum mainnet / Polygon  |
| Storage       | Filebase (IPFS), Crust Network Gateway)|
| Smart Contracts | Solidity (optional integration) *Not Implemented yet*       |
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
```
This project provides facility to create resume with selection from given 3 templates.
Where we focuses to distribution client and server directory separation for better readability.  


## Project Structure
`./server` consists proper backend infrastructure (built with MongoDB Atllas, Node + express.js)
`./client` consists frontend structure (built with React.js Tech)

---

## Getting Started

Follow these steps to run the project locally.

---

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (local or Atlas)

---

## Overview of project

1. **Clone the repository**
```cmd
git clone https://github.com/Sudhirkumar6009/Resume-Builder.git
```
2. **put cmd in root directory. Then create node modules for both directories `./server` and `./client`**
```cmd
cd ./Resume-Builder

cd ./server
npm install


cd ../

cd ./client
npm install
```

3. **Running the Project**
Use two separate terminals to run the frontend and backend.

3.1. Start Backend (Server)
```cmd
cd ./server
npm nodemon
```
Backend will run at port 5000
(If you don't have nodemon: npm install -g nodemon)

`cd ../` (come agian to root directory)

3.2. Start Frontend (Client)
```cmd
cd ./client
npm run dev
```
Frontend will run at: `http://localhost:8080`
(Future Enhancement Idea : We can also put this as environment variable for proper pratice)

### Environment Variables
Created .env in `./server` with:
```cmd
MONGO_URI=mongodb+srv://sudhirkumarkiller1011:0Q0eIu7IkUMfgQcr@resumebuilder.ymfjyyh.mongodb.net/?retryWrites=true&w=majority&appName=ResumeBuilder
```

### Contact
For questions or issues,
MAIL ME : sudhir.kuchara@gmail.com :)

