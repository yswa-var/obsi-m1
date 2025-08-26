---
title: "Engineer's Guide to Solana: Part 1 - The Theory"
description: "A comprehensive introduction to Solana's architecture, accounts, programs, and core concepts for developers"
author: "Yashaswa Varshney"
date: 2024-01-26
tags:
  - solana
  - blockchain
  - smart-contracts
  - rust
  - web3
  - cryptocurrency
---

# Engineer's Guide to Solana: Part 1 - The Theory

*An epitome of high performance, mass adoption, and future-friendly crypto: Solana!*

## Introduction

Solana is a global state machine that eliminates the need for each node to waste compute power executing the same instructions repeatedly, making it environmentally friendly. Solana's ability to accommodate concurrent transaction processing makes it cost-effective and safer at the same time, achieving unparalleled speed with minimal usage costs.

## Solana Developer Workflows

Solana acts as a global computer, open to anyone for storing and executing code for a fee. Programs are called smart contracts, and to interact with such programs, we use RPC APIs.

![Solana Development Workflow](https://miro.medium.com/v2/resize%3Afit%3A720/format%3Awebp/1%2AOt1pgQfYVOUAnfeuCdQvMA.png)

There are two types of workflows in Solana development:

1. **Program Development**: Publicly visible and accessible programs/data that can be deployed on this global computer
2. **Client Development**: Applications that connect with programs and data sources, sending transactions (containing instructions) to be executed for specific tasks

At the core of Solana's development model, it revolves around three key components:

- **Accounts** (1.1 Data Accounts, 1.2 Program Accounts)
- **Programs**
- **Transactions & Instructions** (3.1 Invoke Programs, 3.2 Modify accounts)

![Solana Core Components](https://miro.medium.com/v2/resize%3Afit%3A720/format%3Awebp/1%2A_pyL8aKeK6hbGRFMBqrrlQ.png)

## 1.0 Accounts

Everything on Solana is an account, like an SSD that contains all your applications (programs) and data (data which programs interact with).

### 1.1 Data Accounts

- **Non-executable**
- Store information or state of the network (means we can read or write info)
- Example: User wallet balance is stored in these

### 1.2 Program Accounts

- **Executable accounts**
- Contains compiled code for a program
- **Stateless** (means they don't store data, instead they read/write data from data accounts)

## 2.0 Programs

- **Smart contracts**
- Deployed to executable accounts containing logic for the DApp
- These are invoked by transactions (which contain instructions)
- Can perform actions such as updating data in data accounts (if they have the authority)
- **The separation of data and programs allows parallelism!**

### Executable Account vs Program Account

> "All program accounts are, by definition, executable accounts, but not all executable accounts are 'program accounts' in the common sense."

**Executable Account:**
- Fundamental property of an account
- Every account on Solana has a boolean flag called `executable`
- When this flag is set to `true`, it means the account's data contains compiled program code that can be run by the Solana runtime
- If the flag is `false`, the account is a data account, and its data cannot be executed

**Program Account:**
- As a developer, you deploy to the Solana blockchain (the "smart contract")
- When you deploy a program, it's stored in an account, and that account has its `executable` flag = `true`
- Allows the program to be invoked by transactions
- Contains the compiled code
- Stateless, doesn't hold the application's data

## 3.0 Transactions and Instructions

A user interacts with a Solana program by sending a transaction. A transaction is a bundle that contains:

- One or more instructions
- List of all accounts the transaction will interact with
- The user's signature to authorize the actions

An instruction says which program to call, which accounts it will read or modify, and any specific data the program needs to execute its logic.

## Deep Dive into Accounts

Accounts are the most critical and often confusing concept in Solana. Let's explore what we know so far:

### Account Types

**Executable Accounts → Program Accounts:**
- Contain compiled BPF bytecode (e.g., smart contract logic)
- Executable flag is `true`

**Non-Executable Accounts → Data Accounts:**
- Hold state or user/application data
- Used to persist changes across transactions
- Executable flag is `false`

### What Every Solana Account Contains

1. **Lamports**: Solana's native token balance (pay rent)
2. **Data**: A byte array holding the account's state
3. **Owner**: The program ID allowed to modify this account's data
4. **Executable**: Boolean (if it contains a program or not)

> **Important**: "An account's owner is a program, not a user." This method ensures only defined actions can be performed on the data, making it reliable.

**Example**: In a smart contract, a counter program owns a data account. Only that program can increment and decrement the count by 1. No user can just change the counter to any arbitrary number.

### Rent

Solana charges rent to store data on-chain:

- **Rent exempt**: Account holds enough lamports so they're never thrown out
- So either you pay rent continuously, or you make the account rent exempt upfront by funding it with enough lamports
- If an account is not rent exempt and becomes inactive, it may be garbage collected (its lamports are reclaimed and the account is deleted from the chain)

## Understanding Transactions

A Transaction is a bundle of:
- One or more instructions
- Recent blockhash (prevents replay)
- Signatures from all required signers

When all parts are valid and all required accounts sign, the transaction is valid and processed on-chain.

### Instructions

Think of them as function/API calls to a program. Instructions contain:

- **Program ID**: The smart contract to execute
- **Accounts list**: The accounts needed to read and write
- **Params or payload**: Method name + arguments

**Example**: Calling a function to increment a counter will include:
- Program ID: `counterProgram`
- Accounts: `[user_account, counter_data_account]`
- Params: method = "increment"

**Transactions are Atomic**: If any instruction fails, the entire transaction is reverted (no partial updates, all or nothing, keeping Solana's state consistent).

## On-Chain Program Development

We will get into real development in Part 2 of this blog. For now, let's understand the theory.

### Programming Language

**Rust is the go-to language** (only!) for Solana smart contracts (programs) because:
- Type safe
- Memory safe
- Can compile to BPF bytecode, which Solana executes

C and C++ are supported but discouraged by the Solana community. (If this wasn't the case, Solana would have 100x more applications by now, but it is what it is!)

## SPL (Solana Program Library)

A standard toolbox of on-chain programs (smart contracts) that developers use. Think of it as Solana's version of Ethereum's common contracts (i.e., ERC-20, ERC-721, etc.). These are:

- Audited
- Battle-tested
- Most importantly, standardized

### 1. SPL Token Program

- Mint tokens ($USDC, $TRUMP, or NFTs)
- Send or receive tokens
- Burn or freeze tokens
- Set authority (like who can mint or freeze)
- Check balances

**Important**: SPL token balances are not stored inside wallets directly! They are stored in Associated Token Accounts (ATA).

### What is an ATA?

An Associated Token Account is a unique token account for a specific (wallet, token mint) pair. Think of it like "Richard's USDC account." If Richard has 5 tokens ($USDC, $BONK, $TRUMP...), they will have 5 different token accounts, each owned by Richard's wallet but created by the same SPL token program.

**ATA addresses are derived using:**
```
ATA Address = PDA(Richard's wallet address, token mint address, SPL Token Program ID)
```

### Why Do We Need ATAs?

- **Standardized token account structure**
- Prevent duplicate balances and errors
- Makes wallet integration easier (every wallet knows where to look)
- Reduces developer complexities as token creators don't have to track token accounts manually

### SPL Token Mint Authorities

We already know that each SPL token (also called mint) has authority accounts with permissions like minting or freezing. These authority rules are baked into the token at creation time and can be changed or revoked.

### What is a "Mint"?

A mint account is an on-chain account that defines:

- The token type (e.g., USDC, GARI, MYTOKEN)
- Decimals (how divisible it is)
- Total supply (if capped)
- Authorities (who can mint/freeze)

These are like token factories. You can create them using the `createMint` instruction. It can mint new tokens into token accounts, but only the mint authority can do that.

### Types of Authorities

There are three types of mint authorities for SPL tokens:

1. **Mint Authority**: Who can mint new tokens (increase supply like our shi**y governments), used during ICOs or token distributions
2. **Freeze Authority**: Who can freeze token accounts (block transfers), used by regulated tokens like USDC
3. **Close Authority**: Who can close token accounts, rarely used (can be used for cleanups)

### Creating a New SPL Token

Create a new SPL token with a command like:
```bash
spl-token create-token
```

You can pass:
- `--mint-authority`
- `--freeze-authority`

If you don't specify them, the CLI will use your current wallet as the default.

Then you can mint tokens using:
```bash
spl-token mint <TOKEN_MINT_ADDRESS> <AMOUNT> <RECIPIENT_TOKEN_ACCOUNT>
```

But only the mint authority can do this.

### Revoking Authorities (Make Your Token Immutable)

If you want your token supply to be capped, you can revoke the mint authority like this:
```bash
spl-token authorize <TOKEN_MINT_ADDRESS> mint --
```

Now, no one can mint new tokens — the supply is locked forever.

**Examples:**
- **Meme Tokens**: Mint authority only during initial mint, then revoked; freeze authority never used
- **USDC**: Mint authority retained by Circle to mint more; freeze authority used for compliance
- **NFT**: Mint authority used once per NFT; freeze authority not usually used

## PDA (Program Derived Address)

A special type of account only controlled by a program, not by any user. They are the foundation for:

- Creating deterministic addresses
- Preventing manual signing
- Making your program stateful, hence secure

### Features

- **Ownership by program**
- Can't be signed by private key; instead, the program signs
- Derived from seeds + program ID

### General Use Cases

Vaults, metadata, token authorities, config accounts (automations like for $USDC's case to control supply and demand and stabilize the price to $1).

### How Do You Derive a PDA?

Don't bother understanding the code yet; we will cover it in upcoming parts:

```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("seed1"), walletPubkey.toBuffer()], 
  programId
);
```

- **Seeds**: Can be any combination of bytes (generally includes strings, pubkeys, u64s)
- **Program ID**: Your on-chain program's address
- **Bump**: A number between 0 to 255 is added to make sure the address is off the ed25519 curve

### Why Off Curve?

Solana uses ed25519 curve cryptography. If the derived address is on the curve, someone could generate a private key for it, hence could use that key to modify the content of the PDA!

PDAs are specifically designed to always be off the curve so:
- They can't be owned by any wallet
- Only the program can sign on their behalf via `invoke_signed`

### What Do I Mean by Program Signing a PDA?

When your program wants to use the PDA as an authority (to have power to transfer tokens, write data, etc.), it uses this:

```rust
invoke_signed(
  &instruction,
  &[...accounts],
  &[&[seeds..., &[bump]]],  // PDA seeds and bump
)
```

The program shows Solana proof that it's the owner by showing seeds and bump. If everything matches using a hashmap, Solana lets the program sign the PDA.

### Best Example: How PDAs Are Used as Mint Authority in Token Programs

When you create a new token using the SPL token program to create your own stable or meme coin, someone has to have mint/freeze authority, which allows them to mint/freeze tokens.

Now, "should a human-controlled wallet hold that power?"

**No!** (Remember the $LIBRA scandal?)

PDA-owned authority makes minting:
- Controlled
- Safe
- Programmatic
- More importantly, visible to investors

## What's Next?

- **Part 2**: The Raw Fundamentals, State Management (Native Rust) → [[solana/Engineer's Guide to Solana Part 2 The Raw Fundamentals, State Management (Native Rust)]]
- **Part 3**: Mastering Anchor (The Framework) → [[solana/Engineer's Guide to Solana Part 3 Mastering Anchor (The Framework)]]
- **Part 4**: Anchor Smart Contract General Patterns

Related concepts: [[solana/PDA]] · [[solana/CPI]]

---

**Remember**: "Not your keys, not your coins"

---

*Tags: #Solana #Blockchain #SmartContracts #Rust #Web3 #Cryptocurrency*
