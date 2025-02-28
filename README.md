# Blockchain_Voting_Dapp

<details>
  ## 🚀 Installazione & Utilizzo

#### 0. Prerequisiti:
   - **0.1**: Installa Hardhat:
     ```bash
     npm install --save-dev hardhat
     ```
   - **0.2**: Installa Node.js:
     ```bash
     nvm install node
     ```
   - **0.3**: Installa il pacchetto `http-server` globalmente:
     ```bash
     npm install -g http-server
     ```
   - **0.4**: Aggiungi e configura l'estensione **MetaMask** al tuo browser con la seguente rete:
     - **RPC URL**: `127.0.0.1:8545`
     - **Chain ID**: `31337`
     - **Simbolo Moneta**: `GO`

#### 1. Clona la repository:
   ```bash
   git clone https://github.com/MatteoAv/Blockchain_Voting_Dapp
   ``` 
#### 2. Spostati nella cartella del progetto ed apri il terminale
#### 3. Avvia una blockchain locale:
 ```bash
     npm hardhat node
 ```
#### 4. Apri una nuova finestra del terminale sempre nella cartella del progetto
#### 5. Esegui il deploy del contratto: 
 ```bash
     npx hardhat run scripts/deploy.js --network localhost
 ```
#### 6. Spostati nella cartella frontend ed esegui il comando: 
 ```bash
     http-server
 ```
#### 7. Clicca su uno dei server che vengono restituiti per aprire la pagina web
#### 8. Importa in MetaMask uno degli account creati nella blockchain locale
#### 9. Clicca sul pulsante "Connettiti a Metamask" per votare
</details>

## 🎯 Application Overview: FairVote  
FairVote is a DApp (Decentralized Application) designed to ensure a secure and transparent electoral process. By leveraging the power of blockchain, FairVote guarantees the immutability of data, increasing user trust in the electoral system. The primary goal of the application is to allow users to participate in elections through a transparent, secure, and accessible platform.

A key feature of FairVote is the absence of the need to create an account with personal credentials or log in via third-party accounts (such as Google or Meta). Users can simply connect via their MetaMask wallet, using their public key address on the blockchain to access the platform.

### 🛠️ Main Features of FairVote:

#### Voting:
- Users can vote in existing elections using a voting code. After selecting a poll, users can view details such as the name, description, deadline, candidates, and the current vote counts. They can then choose the candidate they want to vote for.
- The voting occurs through a 0.05 Ether transaction, and if the transaction is successful, the vote count is updated in real time.
- Each user can cast only one vote per election, and only if they have sufficient funds and the election is still open.

#### Create Elections:
- Users have the ability to create new elections, defining parameters such as title, description, candidates (up to a maximum of 6), and the voting deadline.
- To create an election, the user must perform a transaction that costs 0.1 Ether. Upon successful creation, the user receives a unique 6-digit voting code, which can be shared with others to participate in the vote.
- The creator of the election cannot vote in the election they created, but anyone else can.

#### View Elections:
- Users can view the elections they have created in their profile.
- For elections that have expired without votes, the creator can delete them. However, because the blockchain is immutable, the election simply becomes invisible and inaccessible. When an election is deleted, the user is refunded the Ether spent on creating it.

### 💻 Technologies and Design Patterns Used:

#### Backend:
- **Solidity** was used for writing the smart contract, with **Hardhat** as the development environment for deploying and testing on the Ethereum blockchain.

#### Frontend:
- The frontend was developed using **HTML**, **CSS**, and **JavaScript**, aiming to provide a simple and user-friendly interface.

#### Design Patterns:
- **Check-Effects-Interaction**: This pattern ensures the correct order of operations and prevents reentrancy attacks.
- **Guard Check**: Used to verify that all conditions are valid before executing a function, protecting the contract from invalid operations.
- **Secure-Ether-Transfer**: Used to ensure secure transactions via the transfer function, limiting gas to 2300, thus preventing recursive call attacks.
