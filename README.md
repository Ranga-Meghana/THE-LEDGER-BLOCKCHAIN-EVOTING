# THE LEDGER — Blockchain-Based E-Voting System

A B.Tech capstone prototype demonstrating a transparent, tamper-evident election
platform built on blockchain, wrapped in a cinematic, editorial-style interface.

> **Academic prototype — designed for educational demonstration. Not intended for
> use in a real, legally-binding election.**

---

## 1. Project Overview

Conventional electronic voting asks people to trust a single database and the
institution running it. The Ledger instead records each vote as a transaction on a
blockchain: every vote is cryptographically linked to the one before it, so altering
any past record breaks every hash that follows — making tampering detectable rather
than merely "against the rules."

The project ships in two modes:

- **Demo Mode** (default, always available): the entire flow — wallet connection,
  voting, blockchain explorer, integrity verification, tampering simulation — runs
  client-side using **real SHA-256 hashing** in the browser. No MetaMask, Hardhat
  node, or backend required. This is what you'd show in a 5-minute faculty demo.
- **Real Blockchain Mode**: the same UI talks to an actual deployed `Voting.sol`
  contract via Ethers.js + MetaMask, with an Express/MongoDB API handling off-chain
  election metadata and voter eligibility.

The app never pretends a simulated transaction is a real one — Demo Mode is clearly
labeled everywhere it appears, and the **REAL BLOCKCHAIN MODE** badge only shows once
a real wallet has connected and a real contract read has actually succeeded.

**A note on privacy up front:** this prototype's real contract records each voter's
wallet address directly — it is transparent and auditable by design, but it is
**not anonymous**. See §14 for the full explanation.

## 2. Features

- Cinematic, dark, editorial landing page with animated network background
- Wallet-based voter authentication (MetaMask via Ethers.js, with Demo Mode fallback)
- One-vote-per-address enforcement, enforced by the smart contract, not app code
- Full voting flow: select → review → confirm → transaction hash → confirmation
- Custom blockchain explorer with per-block detail view
- Integrity verification tool with a real, recomputed hash-chain check
- Educational tampering simulation showing cascading chain failure + restore
- Admin dashboard with live results; recorded votes are never editable
- "How Blockchain Works" interactive page with a live hash demo
- Fully responsive, with reduced-motion support and semantic markup

## 3. Screenshots

_Add screenshots here before submission (landing page, voting flow, explorer, audit
page, admin dashboard)._

## 4. Architecture

```
Voter (browser)
   │
   ├── React + Vite + Ethers.js frontend ──► MetaMask ──► Voting.sol (Hardhat / Ethereum)
   │         │                                                  │
   │         └── Demo Mode: in-browser SHA-256 chain             └─ emits VoteCast events
   │             simulation (no node required)
   │
   └── REST calls ──► Express API ──► MongoDB (off-chain election metadata,
                                        voter eligibility, audit log — never
                                        the vote choice itself)
```

Identity and eligibility are kept off-chain; only an anonymized voter reference,
election ID, and candidate selection are ever written on-chain.

## 5. Technology Stack

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Frontend   | React 18, Vite, React Router, Ethers.js v6                |
| Blockchain | Solidity ^0.8.24, Hardhat, Hardhat Toolbox, Chai/Mocha    |
| Backend    | Node.js, Express.js                                       |
| Database   | MongoDB (Mongoose)                                         |

## 6. Folder Structure

```
THE-LEDGER-BLOCKCHAIN-EVOTING/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, cards, modal, toast, visualizations…
│   │   ├── pages/          # Landing, Election, Vote, Review, Confirmation,
│   │   │                   #   BlockchainExplorer, Audit, Admin, HowItWorks
│   │   ├── layouts/        # MainLayout (nav + footer + toasts + demo badge)
│   │   ├── hooks/          # useWallet, useChain, useScrollReveal
│   │   ├── services/       # api.js — Express API client (fails soft)
│   │   ├── blockchain/     # config.js, VotingABI.json, walletService.js,
│   │   │                   #   chainService.js (Demo Mode), contractService.js (Real Mode)
│   │   ├── context/        # VotingContext.jsx — wallet + chain + voting state
│   │   ├── data/           # candidates.js, electionData.js (Demo Mode content)
│   │   ├── utils/          # hash.js (SHA-256), format.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── controllers/        # electionController, voterController, auditController
│   ├── routes/              # electionRoutes, voterRoutes, auditRoutes
│   ├── models/               # Election, Voter, AuditLog (Mongoose schemas)
│   ├── middleware/          # errorHandler, validate
│   ├── config/               # db.js
│   ├── server.js
│   ├── seed.js               # seeds demo election + candidates into MongoDB
│   └── package.json
│
├── blockchain/
│   ├── contracts/Voting.sol
│   ├── scripts/deploy.js
│   ├── test/Voting.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── package.json              # root convenience scripts (see §9)
├── .gitignore
├── .env.example
└── README.md
```

## 7. Prerequisites

- **Node.js 18+** and **npm 9+**
- **MongoDB 6+** (local install or MongoDB Atlas) — only needed for Real Blockchain
  Mode's off-chain API; Demo Mode works without it
- **MetaMask** browser extension — only needed for Real Blockchain Mode
- **Git**

## 8. Installation

```bash
git clone <your-repo-url> the-ledger
cd the-ledger
npm run install:all
```

`install:all` runs `npm install` inside `frontend/`, `backend/`, and `blockchain/`
for you. Equivalently, from the root:

```bash
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd blockchain && npm install && cd ..
```

### 8.1 Frontend setup

The frontend runs standalone in Demo Mode with zero configuration:

```bash
npm run frontend:dev
# or: cd frontend && npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Everything —
voting, the explorer, the audit page — works immediately, no wallet or backend
needed.

To point it at a real deployed contract instead of Demo Mode:

```bash
cd frontend
cp ../.env.example .env   # then edit VITE_CONTRACT_ADDRESS etc. (see §8.4)
```

### 8.2 Backend setup (optional — only for Real Blockchain Mode's off-chain data)

```bash
cd backend
cp ../.env.example .env   # edit MONGO_URI / PORT as needed
npm run dev
# or: npm start
```

Seed the demo election into MongoDB:

```bash
npm run seed
```

API runs at `http://localhost:4000`. If MongoDB isn't running, the frontend's Demo
Mode keeps working regardless — API calls fail soft and are logged as warnings.

### 8.3 MongoDB setup

```bash
# local
mongod --dbpath ./data

# or use MongoDB Atlas and put the connection string in backend/.env as MONGO_URI
```

### 8.4 Hardhat / smart contract setup (optional — only for Real Blockchain Mode)

```bash
cd blockchain
npm install
npx hardhat node          # terminal 1 — keep running, local chain on :8545
```

In a second terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address into `frontend/.env` as `VITE_CONTRACT_ADDRESS`.
The script starts the election ~2 minutes in the future (so the candidate-adding
transactions are guaranteed to land before it starts, as the contract requires),
then — on a local Hardhat network only — fast-forwards the chain's clock so the
election is immediately LIVE for your demo.

> **Note on this repository's build environment:** this project was developed in a
> sandboxed environment whose network allowlist blocks `binaries.soliditylang.org`,
> which `npx hardhat compile` / `npx hardhat test` need to fetch the Solidity
> compiler on first run. That block is specific to this sandbox, not the project —
> on a normal machine with regular internet access, `npx hardhat compile` and
> `npx hardhat test` work directly with no workaround needed. To verify the contract
> regardless, it was (a) compiled directly with the `solc` npm package
> (`solc.compile()`), confirming the source compiles and generating the ABI checked
> into `frontend/src/blockchain/VotingABI.json`, and (b) exercised with real,
> signed transactions against a live `npx hardhat node` — every scenario in
> `test/Voting.test.js` (election timing, candidate creation before start,
> eligibility, one-vote enforcement, invalid-candidate rejection, status
> transitions, vote tallying, and the `VoteCast` event payload) was run this way
> and passed. See §11 for the full list.

### 8.5 MetaMask configuration

1. Add a custom network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`.
2. Import one of the private keys Hardhat prints when `hardhat node` starts
   (these are well-known public test keys — never use them anywhere but a local
   throwaway chain).
3. Connect that account when the app requests a wallet connection.
4. **Register the account as an eligible voter first.** The deploy script only
   deploys the contract and adds candidates — it does not register any voters.
   Until an admin calls `registerVoter(electionId, yourAddress)` (e.g. via a
   Hardhat console or a small script using the `admin` account), `castVote()`
   will correctly revert with "Voting: not an eligible voter".

## 9. Running the Complete Application

| Component  | Command                                        | Port |
|------------|--------------------------------------------------|------|
| Blockchain | `npm run blockchain:node` (keep running)          | 8545 |
| Backend    | `npm run backend:dev`                              | 4000 |
| Frontend   | `npm run frontend:dev`                              | 5173 |

All root-level commands (`npm run frontend:dev`, `npm run backend:dev`,
`npm run blockchain:node`, etc.) are defined in the root `package.json` and simply
delegate to the matching script inside each sub-project via `--prefix` — no root
`node_modules` or extra tooling required.

## 10. Demo Mode — Presenting Without Any Setup

Demo Mode is **on by default** and needs nothing installed beyond the frontend:

```bash
cd frontend
npm install
npm run dev
```

A **DEMO MODE** badge is always visible while running this way. Wallet connection,
blockchain blocks, and integrity verification are all simulated client-side with
genuine SHA-256 hashing, so the chain math is real even though no network is
running. Suggested 5–10 minute faculty walkthrough:

1. Landing page → scroll through problem/solution/how-it-works story.
2. **Election** → review details and security status.
3. **Vote Now** → connect wallet (Demo Mode) → select a candidate.
4. Review the vote, note the warning, confirm and cast it.
5. Confirmation screen → note the transaction hash and block number.
6. **Blockchain Explorer** → click into the new block.
7. **Audit** → **Verify Blockchain Integrity** (all green).
8. **Simulate Tampering** → watch the cascade failure → **Restore Demo Chain**.
9. **Admin Dashboard** → live results; note the "votes can't be edited" callout.

## 11. Real Blockchain Mode — How It Actually Works

Real Blockchain Mode is not a separate build — it's the same app, automatically
using the real contract instead of the Demo Mode simulation once three things are
all true:

1. `VITE_CONTRACT_ADDRESS` is set (`frontend/.env`)
2. A wallet provider (MetaMask) is detected (`window.ethereum`)
3. The connected wallet's `castVote()` call actually succeeds against that address

The **DEMO MODE** badge only switches to **REAL BLOCKCHAIN MODE** once a real wallet
has connected *and* the app has successfully read live results back from the
configured contract — never just because an address happens to be configured.

### What "real" means here

When a real wallet is connected, casting a vote does all of the following for
real, with no simulation involved (`frontend/src/blockchain/contractService.js`):

1. Connects to `window.ethereum` via Ethers.js (`BrowserProvider`) and confirms the
   wallet is on the configured chain ID — refusing to proceed on the wrong network
   rather than silently guessing.
2. Loads `Voting.sol`'s ABI (`frontend/src/blockchain/VotingABI.json`, generated
   directly from the compiled contract) and the configured contract address.
3. Runs read-only pre-flight checks — `getElectionStatus`, `isEligible`,
   `hasVoted` — so a voter gets an immediate, specific reason ("not eligible",
   "already voted", "election not live") instead of paying gas for a transaction
   the contract would revert anyway.
4. Calls the real `castVote(electionId, candidateId)` function and waits for the
   transaction to actually be mined (`tx.wait()`).
5. Reads the **real transaction hash and real block number** from the receipt —
   these are not generated or simulated client-side.
6. Re-reads the contract's `getResults()` so the Election/Admin pages show the
   real on-chain tally, not Demo Mode numbers.

Any failure along the way — a rejected MetaMask prompt, a revert, a network error —
is surfaced to the voter as a real error message; the app never advances to a
"confirmed" screen unless a real transaction actually confirmed.

### What Real Blockchain Mode does *not* cover

The **Blockchain Explorer** and **Audit / tampering simulation** pages are an
educational Demo Mode feature regardless of wallet mode — they visualize a
separate, client-side simulated hash chain (see §10), not the real chain's actual
blocks. A real vote's confirmation screen says this explicitly and does not claim
the Explorer will show it. To inspect a real transaction, use a real block explorer
pointed at your local node (or `npx hardhat console`).

### Trying it end-to-end

```bash
cd blockchain && npm install
npx hardhat node                                        # terminal 1
npx hardhat run scripts/deploy.js --network localhost    # terminal 2, one-off
```

Then, using the `admin` account (Hardhat's account #0) via `npx hardhat console
--network localhost` or a small script, register your MetaMask account as an
eligible voter: `voting.registerVoter(1, "0xYourAddress")`. Set
`VITE_CONTRACT_ADDRESS` in `frontend/.env` to the deployed address, start the
frontend, connect MetaMask (on chain ID `31337`), and cast a vote — the
confirmation screen will show a real transaction hash and block number, and the
**REAL BLOCKCHAIN MODE** badge will appear once results are read back successfully.

## 12. Testing

### Smart contract tests

```bash
cd blockchain
npx hardhat test
```

`test/Voting.test.js` covers: election creation permissions, rejecting
`addCandidate()` after an election has started, candidate results, one-vote
enforcement, rejecting ineligible voters, rejecting invalid candidates, election
status by time window (`UPCOMING` → `LIVE`), and multi-voter tallying. All test
helpers compute times from the chain's own clock (`time.latest()`), not the host
machine's wall clock, so they aren't affected by earlier tests advancing the
simulated chain's time.

> As noted in §8.4, this repository's own sandboxed dev environment can't reach
> the host `npx hardhat test` needs to download the compiler from, so the suite
> above was additionally verified by compiling with `solc` directly and running
> every one of those scenarios as real, signed transactions against a live
> `npx hardhat node` — all 11 checks (9 from the file above, plus 2 extra: a
> rejected-late-candidate case and a `VoteCast` event payload check) passed. On a
> normal machine, just run `npx hardhat test` directly.

### Manual testing checklist

- [ ] Voting a second time from the same session is blocked with a clear message
- [ ] Blockchain Explorer block modal shows full hash/prevHash/tx/timestamp
- [ ] Audit → Verify → all blocks pass
- [ ] Audit → Simulate Tampering → Block #003 fails, later blocks show invalid
      prevHash, **Restore Demo Chain** brings it back to a clean passing state
- [ ] Admin dashboard results match the number of votes actually cast
- [ ] (Real mode) Casting a vote with an unregistered wallet fails with "not an
      eligible voter" *before* a MetaMask prompt appears
- [ ] (Real mode) Voting twice with the same wallet fails with "already voted"
- [ ] (Real mode) Confirmation screen's transaction hash and block number match
      what MetaMask / the Hardhat node log show for that transaction

## 13. Security Considerations

- Wallet-based authentication (no passwords to phish)
- Smart-contract-enforced one-vote-per-address rule (not just application logic)
- Election time-window enforcement on-chain, including for candidate creation
  (`addCandidate` reverts once `block.timestamp >= startTime`)
- Independent, recomputable integrity verification in Demo Mode (not just a
  stored flag) — and read-only pre-flight checks in Real Mode before spending gas
- Admin role separation — no code path lets an admin alter a recorded vote
- Basic request validation on the off-chain API (`middleware/validate.js`)
- Real Mode explicitly checks the connected wallet's chain ID and refuses to
  proceed on the wrong network rather than silently continuing

## 14. Privacy Considerations

**This prototype's Real Blockchain Mode does not provide anonymous voting, and the
README should not be read as claiming otherwise.** Specifically, in `Voting.sol`:

- `isEligible[electionId][voter]` and `hasVoted[electionId][voter]` are keyed
  directly by the voter's wallet **address** — not a hash, not a derived
  identifier.
- The `VoteCast` event indexes and emits the voter's real wallet **address**
  alongside the candidate they chose.
- Anyone who can read the chain (which, on a public network, is anyone) can see
  exactly which address voted for which candidate. This is by design — it's what
  makes the vote auditable — but it also means **it is not secret**.

What the system *does* do: it keeps a voter's real name and other identifying
information off-chain, in MongoDB, separate from the ballot data. That means the
chain itself never stores "Jane Doe voted for Candidate X" — only "address
0xABCD... voted for Candidate X." **This is a meaningfully weaker guarantee than
anonymity.** If the same party (or anyone who can subpoena or breach both) controls
both the off-chain identity database and can read the chain, they can fully
reconstruct who voted for whom. A wallet address can also often be correlated with
a real identity through exchange KYC records, other on-chain activity, or network
metadata, entirely independent of anything this app does.

Demo Mode's simulated chain additionally uses an illustrative "anonymized voter
reference" (e.g. `v-8841`) instead of a real address, purely to make the
identity/ballot separation concept easy to see in a demo. That illustrative
pseudonym is **not** how Real Mode behaves — see above.

**Production-grade ballot secrecy was out of scope for this prototype** and would
require additional cryptographic mechanisms on top of what's implemented here,
such as zero-knowledge proofs of eligibility (proving you're allowed to vote
without revealing which registered voter you are), blind signatures, ring
signatures, or a mixnet to break the link between a submitting address and the
vote it carries.

## 15. Known Limitations

- **Not anonymous** — see §14. Wallet address ↔ vote is public on-chain in Real
  Mode.
- No real identity-proofing layer — eligibility is admin-asserted (`registerVoter`)
  in this prototype, with no KYC or credential-issuance system behind it
- No protection against network-level voter deanonymization
- Local Hardhat network only; not tested on a public testnet
- Demo Mode data does not persist to a real chain and resets per browser (it uses
  `localStorage` only for the "have I voted" flag, not the chain itself)
- The Blockchain Explorer / Audit pages always show the Demo Mode simulated chain,
  never the real chain's actual blocks, even in Real Blockchain Mode (§11)

## 16. Future Enhancements

- Zero-knowledge eligibility proofs for genuine ballot secrecy
- Multi-signature admin actions for election creation/closure
- Public testnet deployment with a real block explorer link
- A real Blockchain Explorer view backed by actual on-chain event logs (in
  addition to, or instead of, the current Demo Mode simulation)
- Voter-facing receipt verification without revealing their choice
- Persisting the Demo Mode chain to `localStorage`/IndexedDB across reloads

## 17. Deployment

This is an academic prototype; the notes below are a starting point, not a
production deployment guide. Nothing here should be hard-coded — every value below
is read from an environment variable, with a `localhost` default only for local
development (see `frontend/src/blockchain/config.js` and `backend/config/db.js` /
`backend/server.js`).

- **Frontend**: `npm run build` inside `frontend/` produces a static `dist/`
  folder deployable to any static host (Vercel, Netlify, GitHub Pages). Set
  `VITE_CONTRACT_ADDRESS`, `VITE_API_BASE_URL`, `VITE_NETWORK_RPC_URL`, and
  `VITE_CHAIN_ID` in your host's environment variable dashboard rather than
  committing a `.env` file — Demo Mode works fine with none of these set.
- **Backend**: deploy `backend/` to any Node host (Render, Railway, Fly.io, a VPS).
  Set `MONGO_URI` and `PORT` as environment variables on the host — never in
  source control. The frontend keeps working in Demo Mode with no backend at all.
- **MongoDB**: use MongoDB Atlas for a managed instance; put its connection string
  in the backend host's `MONGO_URI` environment variable.
- **Blockchain**: for anything beyond a local demo, deploy `Voting.sol` to a public
  testnet (e.g. Sepolia) using a throwaway funded account — see the commented
  example in `.env.example`. Never commit a real private key. Update
  `VITE_NETWORK_RPC_URL` and `VITE_CHAIN_ID` to match the target network.

## 18. GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit - THE LEDGER"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL (e.g.
`https://github.com/your-username/the-ledger.git`). `.gitignore` already excludes
`node_modules/`, build output, `.env` files, and Hardhat's local `artifacts/`/
`cache/` directories — nothing heavy or secret should ever be committed.

---

**Academic prototype — designed for educational demonstration. Not intended for use
in a real, legally-binding election. Real Blockchain Mode is transparent and
auditable by design, but is not anonymous — see §14.**
