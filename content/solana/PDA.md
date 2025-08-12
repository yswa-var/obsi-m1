---
title: PDA
tags:
  - cryptocurrency
  - solana
  - web3
date: 2025-08-12
---


# Introduction to PDAs
Programs Derived Addresses provide developers on solana with two main use cases:
- Deterministic Account Addresses
- Enable Program signing

crazy jargons! let's understand them like a 5yr old engineer.

Think of a PDA as an address that a program can **calculate** based on some specific inputs, or **seeds**

the benefit of this approach is You do need to know the address to interact with it, the address is predictable. You don't have to store it separately, you can always regenerate it from the same seeds

> ## data model of solana revision
> A Solana account has a public and a private key. The account you create using a wallet holds the amount of SOL for that wallet.
> There are keypair accounts, program accounts, and PDA accounts. A program account is both the "executable data account" and the account that owns the data accounts. The term "program data account" is generally used to refer to any account that stores data for a program. The "executable data account" stores the program's bytecode.

## The Core Use Cases
can store any data for example SPL Token _program_ manages a program owned account (PDA) that represents the total supply of the token. When you own tokens, your token balance is stored in a separate _Token Account_. This token account is often a PDA, A single wallet can have multiple token accounts for different tokens. So if you have 10 different tokens, you have 10 token accounts, and those token accounts are PDAs owned by the SPL Token program.

## The "How-To" of PDAs
what do PDA provide ? **Deterministic account address** 
The program calculates the PDA address. The formula is (program_id, seeds) -> PDA address.
what are **seeds** they can be any strings eg. (user id, BONK, ==bump-seed==)
what are bump seeds ? 

PDAs are addresses that fall off the Ed25519 curve and has no corresponding private key.
means they fundamentally don't have the private key.
A program can use the `invoke_signed` instruction to pass the PDA address as a signer to another program, proving its authority over that account without a private key. The PDA itself doesn't sign anything; the program acts as its "signer."

Deriving a PDA does not mean that pda is created.

every PDA need to have enough solana to make it `rent-exempt`, a rent-exempt account holds enough SOL to cover the cost of storing its data for a very long period (currently, about two years), and as long as the balance remains at or above this threshold, it will never be removed from the blockchain.
When a PDA account is no longer needed, it can be closed. This process involves a program instruction that transfers the entire SOL balance of the account to a specified destination account. Once the balance is zero, the Solana runtime "garbage collects" the account, removing it from the network and freeing up the storage space. The full amount of the initial rent deposit is returned.

