const { ethers } = require("hardhat");

async function main() {
    // Ottieni gli account disponibili
    const accounts = await ethers.getSigners();
    console.log("Accounts disponibili:", accounts.map(account => account.address));

    // Ottieni il saldo del primo account
    const balance = await ethers.provider.getBalance(accounts[0].address);
    console.log("Saldo del primo account:", balance, "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
