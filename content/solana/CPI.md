---
title: Cross Program Invocation
tags:
  - web3
  - solana
  - SmartContracts
---
Cross Program Invocation, allows one program to call another program's instructions. Think of it as a function call, but instead of calling a function within the same program, you are calling an "API endpoint" on a different, completely separate program on the blockchain.
 
## Why CPI is Necessary?
- **Token Transfers**: If your program needs to send a token from one user to another (eg. as a reward or payment), it doesn't need to reimplement all the token logic. Instead, it makes a CPI to the SPL Token Program's `transfer` instruction
- **DeFi Protocols**: A lending protocol might need to make a CPI to a liquidity pool program to borrow assets or a CPI to a price oracle program to get the current asset value
- **NFTs**: A program that lets users stake an NFT to earn a token would make a CPI to the SPL Token Program to handle the token minting and transfer

## The Mechanism: invoke vs. invoke_signed
To perform a CPI, a program uses one of two functions from the Solana runtime: invoke or invoke_signed. Both take the same core arguments:
- Instruction: The instruction you want to call on the other program. This includes the target program_id, the accounts it needs, and the instruction data.
- Account Infos: A list of all the account addresses that the invoked program will interact with.

The key difference lies in how they handle signers:

### invoke
This is used when all the required signatures for the transaction are already provided by the client (a user's wallet) in the initial transaction. The invoke function simply passes these signatures along to the called program.

For example, if your program calls the SPL Token Program to transfer tokens from a user's wallet, the user's wallet would sign the initial transaction, and that signature would be valid for the token transfer CPI.

### invoke_signed
This is the most critical function for CPIs and is directly linked to Program Derived Addresses (PDAs). It is used when a program needs to "sign" an instruction on behalf of a PDA.

As we've discussed, PDAs do not have a private key, so they cannot sign a transaction like a regular wallet. However, the Solana runtime provides a special feature: a program can act as the authority for a PDA it derived.

When a program calls invoke_signed, it must provide the seeds and the bump seed that were used to create the PDA. The Solana runtime then: Verifies that the provided PDA address was correctly derived using the program's own ID and the seeds. Grants the PDA "signer" authority for the duration of that specific CPI. This allows a program to securely move assets from a PDA it controls, effectively making the PDA an on-chain vault that only the owning program can access.