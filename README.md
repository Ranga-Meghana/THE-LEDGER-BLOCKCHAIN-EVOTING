# ⛓️ THE LEDGER — Blockchain-Based E-Voting System

> A decentralized e-voting prototype that combines a React frontend, Express backend, MongoDB, and a Solidity smart contract deployed on the Ethereum Sepolia testnet.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 **Live Demo** | https://the-ledger-j996i03u-ranga-meghanas-projects.vercel.app |
| 💻 **GitHub Repository** | https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING |
| 🎨 **Frontend Source** | https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/frontend |
| ⚙️ **Backend Source** | https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/backend |
| ⛓️ **Blockchain Source** | https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/blockchain |
| 🚀 **Backend API** | https://the-ledger-backend.onrender.com |
| 📜 **Smart Contract** | https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5 |

---

## 📌 Overview

**THE LEDGER** is a blockchain-based electronic voting system developed as an academic prototype to demonstrate how blockchain technology and smart contracts can be used to record and verify election votes.

The system provides a web-based voting experience where a voter connects a MetaMask wallet, selects a candidate, reviews the selection, and submits a real blockchain transaction.

The Solidity smart contract records the vote on the **Ethereum Sepolia testnet** and enforces the **one-vote-per-verified-voter** rule.

The application also provides:

- Election results
- Blockchain transaction details
- Vote confirmation
- Blockchain explorer
- Audit interface
- Demo Mode
- Real Blockchain Mode
- MetaMask integration
- On-chain vote verification

---

## 🎯 Objectives

- Build a decentralized blockchain-based voting prototype.
- Record votes using a Solidity smart contract.
- Enforce one vote per verified voter.
- Allow voters to interact with the blockchain through MetaMask.
- Provide transparent transaction information.
- Demonstrate blockchain-based auditability.
- Provide both Demo Mode and Real Blockchain Mode.
- Deploy the application using cloud infrastructure.

---

# ✨ Key Features

## 🗳️ Voting

- Candidate selection interface.
- Review screen before voting.
- MetaMask transaction confirmation.
- One-vote enforcement through the smart contract.
- Existing-vote detection.
- Vote confirmation after successful blockchain submission.

## ⛓️ Blockchain

- Solidity smart contract.
- Ethereum Sepolia testnet deployment.
- Real on-chain transactions.
- Transaction hash tracking.
- Block number tracking.
- Timestamp information.
- On-chain result verification.

## 🔍 Verification & Audit

- Dedicated vote confirmation page.
- Sepolia Etherscan transaction link.
- Blockchain Explorer interface.
- Audit/tampering simulation for demonstration.
- Blockchain-based verification of vote state.

## 🦊 Wallet

- MetaMask integration.
- Connected wallet detection.
- Sepolia network support.
- Real Blockchain Mode.

## 🎭 Demo Mode

The application also includes a **Demo Mode** for presentations and educational demonstrations.

Demo Mode simulates blockchain activity and does not submit real blockchain transactions.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       Voter         │
                         │     Web Browser     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React + Vite      │
                         │     Frontend        │
                         └───────┬─────┬───────┘
                                 │     │
                         API     │     │ Web3 / Ethers.js
                         Calls   │     │
                                 ▼     ▼
                      ┌──────────────┐ ┌─────────────────┐
                      │   Express    │ │    MetaMask     │
                      │    Backend   │ │     Wallet      │
                      └──────┬───────┘ └────────┬────────┘
                             │                  │
                             ▼                  ▼
                      ┌──────────────┐  ┌─────────────────┐
                      │   MongoDB    │  │ Ethereum Sepolia│
                      │    Atlas     │  │ Smart Contract  │
                      └──────────────┘  └─────────────────┘
````

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* React Router
* Ethers.js

## Backend

* Node.js
* Express.js
* MongoDB
* MongoDB Atlas

## Blockchain

* Solidity
* Hardhat
* Ethers.js
* Ethereum Sepolia Testnet
* MetaMask

## Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database
* GitHub — Source Control

---

# 🔄 Voting Workflow

```text
1. Voter opens THE LEDGER
              ↓
2. Connects MetaMask
              ↓
3. Opens Election
              ↓
4. Selects a candidate
              ↓
5. Reviews the selection
              ↓
6. Clicks "Confirm & Cast Vote"
              ↓
7. MetaMask requests transaction approval
              ↓
8. Transaction is submitted to Sepolia
              ↓
9. Smart contract records the vote
              ↓
10. Transaction is confirmed
              ↓
11. Confirmation page displays:
       • Transaction Hash
       • Block Number
       • Timestamp
       • Network
       • Confirmation Status
```

---

# 🔐 Smart Contract

The voting smart contract is deployed on the **Ethereum Sepolia testnet**.

### Contract Address

```text
0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5
```

### View Contract on Sepolia Etherscan

[https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5](https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5)

The smart contract maintains election and voter state and enforces voting rules at the blockchain layer.

The frontend uses the blockchain as the source of truth when checking whether a connected wallet has already voted.

---

# 🛡️ Security & Integrity

THE LEDGER demonstrates several blockchain-oriented security properties.

### One-Vote Enforcement

A voter wallet that has already voted cannot submit another vote for the same election.

### Wallet-Based Authentication

MetaMask provides the wallet address and signs the blockchain transaction.

### On-Chain Recording

Real votes are recorded directly on the Ethereum Sepolia blockchain.

### Transaction Verification

Users can inspect the transaction hash and verify the transaction independently using Sepolia Etherscan.

### Blockchain State Recovery

The application can recover an existing vote from blockchain state instead of depending only on temporary browser state.

### Auditability

Transaction and block information can be inspected and verified through the blockchain.

---

# 🔒 Privacy Limitation

> **Important:** THE LEDGER is an academic prototype and is **not an anonymous voting system**.

The blockchain records the voter's wallet address and vote-related information.

A person who can inspect the relevant blockchain data may be able to associate a wallet address with a candidate selection.

A production election platform would require additional privacy-preserving mechanisms, secure identity management, eligibility verification, and a substantially more rigorous security architecture.

---

# 🎭 Demo Mode vs Real Blockchain Mode

| Feature                   | Demo Mode    | Real Blockchain Mode |
| ------------------------- | ------------ | -------------------- |
| Blockchain transaction    | Simulated    | Real                 |
| MetaMask                  | Not required | Required             |
| Sepolia transaction       | No           | Yes                  |
| Gas fee                   | No           | Yes                  |
| Transaction hash          | Simulated    | Real                 |
| On-chain vote             | No           | Yes                  |
| Suitable for presentation | Yes          | Yes                  |

---

# 📁 Project Structure

```text
THE-LEDGER-BLOCKCHAIN-EVOTING/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── package.json
│   └── .env.example
│
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🚀 Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING.git

cd THE-LEDGER-BLOCKCHAIN-EVOTING
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend

npm install
```

Create a `.env` file using `.env.example` and configure the required frontend environment variables.

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

## 3. Install Backend Dependencies

```bash
cd ../backend

npm install
```

Configure the backend `.env` with your MongoDB connection and server-side settings.

Start the backend:

```bash
npm start
```

The backend normally runs locally on:

```text
http://localhost:4000
```

---

## 4. Blockchain Development

```bash
cd ../blockchain

npm install
```

Run the smart-contract tests:

```bash
npx hardhat test
```

For deployment, configure the required blockchain environment variables.

> Never commit private keys, API keys, recovery phrases, or database passwords.

---

# ⚙️ Environment Variables

## Frontend

```env
VITE_CONTRACT_ADDRESS=
VITE_API_BASE_URL=
VITE_NETWORK_RPC_URL=
VITE_CHAIN_ID=11155111
VITE_DEPLOYMENT_START_BLOCK=
```

## Backend

Configure the server-side environment variables required by the backend, including:

```env
PORT=
MONGO_URI=
SEED_CONTRACT_ADDRESS=
```

Use the project's `.env.example` files as templates.

### Never commit:

```text
Private keys
Wallet recovery phrases
API keys
MongoDB passwords
Database credentials
Production secrets
```

---

# 🌐 Deployment

## Frontend — Vercel

The React/Vite frontend is deployed on Vercel.

### Live Demo

[https://the-ledger-j996i03u-ranga-meghanas-projects.vercel.app](https://the-ledger-j996i03u-ranga-meghanas-projects.vercel.app)

### Frontend Source

[https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/frontend](https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/frontend)

---

## Backend — Render

The Express backend is deployed on Render.

### Backend

[https://the-ledger-backend.onrender.com](https://the-ledger-backend.onrender.com)

### Backend Source

[https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/backend](https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/backend)

---

## Database — MongoDB Atlas

MongoDB Atlas provides the production database connection used by the deployed backend.

Database credentials are stored as deployment environment variables and are not committed to GitHub.

---

## Blockchain — Ethereum Sepolia

The smart contract is deployed on the Ethereum Sepolia testnet.

### Contract

```text
0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5
```

### Etherscan

[https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5](https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5)

---

# 🧪 Testing

The blockchain layer includes Hardhat tests.

The verified project test suite completed with:

```text
10 passing
```

The frontend production build was also verified using:

```bash
npm run build
```

---

# 📊 Verification

The deployed system has been tested for:

* MetaMask connection
* Sepolia network connection
* Candidate selection
* Vote review
* Real blockchain transaction
* Transaction confirmation
* One-vote enforcement
* Existing-vote detection
* Blockchain vote recovery
* Confirmation page recovery
* Transaction hash display
* Block number display
* Etherscan transaction access
* Production frontend deployment
* Production backend deployment

---

# ⚠️ Prototype Scope

THE LEDGER is an **academic proof-of-concept**.

It demonstrates:

* Blockchain-based vote recording
* Smart-contract voting rules
* Wallet interaction
* Transaction verification
* Auditability
* Cloud deployment

It should **not** be treated as a production-ready public election platform.

A production election system would require:

* Independent security audits
* Formal threat modeling
* Secure voter identity and eligibility mechanisms
* Privacy-preserving voting protocols
* Accessibility testing
* Legal and regulatory compliance
* Secure operational infrastructure
* Extensive end-to-end testing
* Production-grade key management

---

# 🔮 Future Enhancements

* Anonymous/privacy-preserving voting.
* Zero-knowledge proof-based voter verification.
* Decentralized identity integration.
* Stronger voter eligibility verification.
* Role-based election administration.
* Multiple simultaneous elections.
* Production-grade key management.
* Independent smart-contract security audit.
* Improved accessibility.
* Notification and monitoring systems.
* Scalable production blockchain infrastructure.

---

# 👥 Team

## THE LEDGER — Blockchain-Based E-Voting System

Add your team members and roles below:

```text
- Name — Role
- Name — Role
- Name — Role
- Name — Role
```

---

# 📜 License

This project was developed as an academic project and prototype.

---

# ⭐ Acknowledgements

Built using open-source technologies and blockchain development tools including:

* React
* Vite
* Node.js
* Express.js
* MongoDB
* Solidity
* Hardhat
* Ethers.js
* MetaMask
* Ethereum Sepolia
* Vercel
* Render
* GitHub

```

### 🔥 The links you specifically wanted are all in there

**Live Demo:**  
https://the-ledger-j996i03u-ranga-meghanas-projects.vercel.app

**GitHub:**  
https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING

**Frontend:**  
https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/frontend

**Backend:**  
https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/backend

**Blockchain:**  
https://github.com/Ranga-Meghana/THE-LEDGER-BLOCKCHAIN-EVOTING/tree/main/blockchain

**Backend API:**  
https://the-ledger-backend.onrender.com

**Smart Contract:**  
https://sepolia.etherscan.io/address/0xC0c2fbb59b87dE0dfcA5f697f9CD7b079b5ed2d5

You can **copy the entire block above directly into `README.md`**.
```
