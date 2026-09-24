const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  const deployTx = voting.deploymentTransaction();
  const deployReceipt = deployTx ? await deployTx.wait() : null;
  const deployBlockNumber = deployReceipt?.blockNumber ?? null;
  console.log("Voting deployed to:", address);
  if (deployBlockNumber !== null) {
    console.log("Deployed at block:", deployBlockNumber);
  }

  // The contract only allows addCandidate() while block.timestamp < startTime,
  // so the election must start comfortably in the future — otherwise the
  // candidate-adding transactions below (and any real-world delay before you
  // run them) can race past startTime and revert with "election already
  // started". A couple of minutes of buffer is plenty for a local deploy.
  const now = Math.floor(Date.now() / 1000);
  const CANDIDATE_SETUP_BUFFER_SECONDS = 120;
  const startTime = now + CANDIDATE_SETUP_BUFFER_SECONDS;
  const endTime = startTime + 60 * 60 * 24 * 30; // 30-day election window

  const tx1 = await voting.createElection("Campus Leadership Election 2026", startTime, endTime);
  await tx1.wait();

  const candidateNames = ["Aria Vale", "Noah Reyes", "Maya Sen"];
  for (const name of candidateNames) {
    const tx = await voting.addCandidate(1, name);
    await tx.wait();
  }
  console.log(`Seeded election #1 with ${candidateNames.length} candidates.`);
  console.log(
    `Election window: ${new Date(startTime * 1000).toISOString()} → ${new Date(endTime * 1000).toISOString()}`
  );

  // On a local Hardhat network only, fast-forward the chain's clock past
  // startTime so the election is immediately LIVE for a demo — this is safe
  // here because we control the whole chain, and is skipped entirely on any
  // real network (a public testnet's clock can't be, and shouldn't be, moved).
  const isLocalNetwork = hre.network.name === "hardhat" || hre.network.name === "localhost";
  if (isLocalNetwork) {
    await hre.network.provider.send("evm_increaseTime", [CANDIDATE_SETUP_BUFFER_SECONDS + 5]);
    await hre.network.provider.send("evm_mine");
    console.log(`Local chain time advanced ~${CANDIDATE_SETUP_BUFFER_SECONDS + 5}s — election is now LIVE for the demo.`);
  } else {
    console.log(
      `This election will go LIVE automatically once the network's clock passes the start time above ` +
        `(no local-time trick is applied on non-local networks).`
    );
  }

  console.log("");
  console.log("Copy this address into frontend/.env as VITE_CONTRACT_ADDRESS:", address);
  if (deployBlockNumber !== null) {
    console.log(
      "Copy this block number into frontend/.env as VITE_DEPLOYMENT_START_BLOCK:",
      deployBlockNumber
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});