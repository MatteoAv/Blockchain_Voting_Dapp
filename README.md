# Blockchain_Voting_Dapp

## Installazione & Utilizzo

##### 0. Prerequisiti:
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

### 1. Clona la repository:
   ```bash
   git clone https://github.com/MatteoAv/Blockchain_Voting_Dapp
   ``` 
### 2. Spostati nella cartella del progetto ed apri il terminale
### 3. Avvia una blockchain locale: npx hardhat node
### 4. Apri una nuova finestra del terminale sempre nella cartella del progetto
### 5. Esegui il deploy del contratto: npx hardhat run scripts/deploy.js --network localhost
### 6. Spostati nella cartella frontend ed esegui il comando: http-server
### 7. Clicca su uno dei server che vengono restituiti per aprire la pagina web
### 8. Importa in MetaMask uno degli account creati nella blockchain locale
### 9. Clicca sul pulsante "Connettiti a Metamask" per votare

   
