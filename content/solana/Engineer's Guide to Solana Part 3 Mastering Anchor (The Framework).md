---
title: "Engineer's Guide to Solana: Part 3 - Mastering Anchor (The Framework)"
description: Learn to build smart contracts on Solana using the Anchor framework — covering entrypoints, account validation, and data accounts with a complete example
author: Yashaswa Varshney
date: 2024-01-23
tags:
  - solana
  - rust
  - smart-contracts
  - blockchain
  - web3
  - development
---

← [[solana/Engineer's Guide to Solana Part 2 The Raw Fundamentals, State Management (Native Rust)]]

Related concepts: [[solana/PDA]] · [[solana/CPI]]

### Why Anchor?
Anchor makes writing Solana programs safer and more ergonomic. It provides:
- **Declarative entrypoints**: Define instructions under a `#[program]` module.
- **Automatic account validation**: Use `#[derive(Accounts)]` with constraints like `init`, `payer`, and `mut`.
- **Ergonomic account access**: Access validated accounts via `ctx.accounts`.
- **Strong typing for data accounts**: Model on-chain data with `#[account]` structs.

### What we’ll build
A minimal counter program with two instructions:
- **initialize**: Creates a new counter account and sets `count = 0`.
- **increment**: Increases the `count` by 1.

### Key concepts in this example
- **`#[program]`**: The main entrypoints of your program. Each function is an instruction.
- **`Context<T>`**: Bundles and validates all accounts needed by an instruction. After validation, you can safely read/write them via `ctx.accounts`.
- **Account validation with `#[derive(Accounts)]`**:
  - `init`: Create a new account for the first time.
  - `payer = signer`: Specifies who pays rent/fees for the new account.
  - `space = 8 + 8`: Reserves bytes for the account. 8 for the Anchor discriminator + 8 for a `u64`.
  - `#[account(mut)]`: Marks an account as writable when you plan to change its data or lamports.
- **`#[account]` data struct**: Defines the on-chain layout for your data account. Anchor handles serialization/deserialization.
- **`use super::*;`**: Brings names from the outer module (`mod hello_anchor`) into scope for convenience.

### Full, commented code
The code below includes concise, proofread comments to explain each piece.

```rust
use anchor_lang::prelude::*;
// Imports all commonly used Anchor items (accounts, macros, types, Result, etc.).

declare_id!("3qQNKJQudFyHAKLJxwCfVRo94BYFqfVoYjCtdV2FM68W");

#[program]
mod hello_anchor {
    use super::*; // Brings outer module items (like Result, Context, accounts) into scope.

    /// Creates a new counter account and initializes count to 0.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter_account.count = 0;
        Ok(())
    }

    /// Increments the counter by 1.
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter_account.count += 1;
        Ok(())
    }
}

// The account validation layer for `initialize`.
// - `init`: first time creation of the counter account.
// - `payer = signer`: the signer pays rent/fees for creating the account.
// - `space = 8 + 8`: 8 bytes for Anchor's discriminator + 8 bytes for a u64 counter.
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub counter_account: Account<'info, Counter>,

    #[account(mut)]
    pub signer: Signer<'info>,

    // Required when creating accounts so the program can invoke the system program.
    pub system_program: Program<'info, System>,
}

// The account validation layer for `increment`.
// - `#[account(mut)]`: we plan to modify `count`, so the account must be writable.
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter_account: Account<'info, Counter>,
}

// On-chain data layout for the counter account.
// Anchor will serialize/deserialize this struct under the hood. welcome to the Hood!!
#[account]
pub struct Counter {
    pub count: u64,
}
```

That’s it — you now have a clean, minimal Anchor program with clear account validation and a simple data account.

happy toding! 