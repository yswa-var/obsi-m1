---
topic: anchor accounts
description: explains the different types of accounts used in Solana programs, including data accounts, transaction signers, and token accounts.
---
## let master program accounts

| Account Type             | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `SystemAccount`          | Basic SOL account, no custom data.       |
| `Account<T>`             | Stores program-specific state.           |
| `Signer`                 | Transaction signer (private key).        |
| `Program<T>`             | Handle to another Solana program.        |
| `TokenAccount`           | SPL token balance holder.                |
| `Mint`                   | Defines a token (supply, decimals, etc). |
| `AssociatedTokenAccount` | Derived ATA for wallet + mint.           |
| `UncheckedAccount`       | Raw account with no type safety.         |

# Program account
accounts are data files in a big public computer
each file have to have 
- a data type (e.g. .py, .go, .rs... .shit)
- an owner (also a program who can modify the file)
- lamports like rent money to pay for accessing the space on the big shared computer

```rust
#[account]
pub struct MyState { counter: u64 }
```

this defines a program account that will live on chain

decimator https://arc.net/l/quote/wttqvoah

## Rent
- Every account must prepay rent (lamports).
- Bigger accounts → more rent.
- That’s why Anchor makes you specify space

## Reallocation

Sometimes you want to resize account data later.
```
#[account(
    mut,
    realloc = <new_size>,
    realloc::payer = <signer>,
    realloc::zero = true
)]
pub my_state: Account<'info, MyState>,
```

- mut → account can be modified.
- realloc → change space allocation.
- payer → who pays for extra rent if account grows.
- zero → if true, newly allocated space is zeroed out (important for shrinking).


# code walk through
```rust
use anchor_lang::prelude::*;

// simple fixed-sixe account.

pub struct MyAccount {
    pub owner: Pubkey, //32 bytes
    pub counter: u64, // 8 bytes
    pub data: [u8; 64], // 64 bytes
}

// helper for space calculation (optional, but handy)
impl MyAccount {
    // size of the struct fields only (no discriminator)
    pub const SIZE: usize = 32 + 8 + 64;
    // discriminator is always 8 bytes (default)
    pub const DISCRIMINATOR_LEN: usize = 8;
    // total space to allocate on `init`
    pub const INIT_SPACE: usize = Self::DISCRIMINATOR_LEN + Self::SIZE;
}
```

init the account 
```rust
#[derive(Accounts)]
pub struct Init<'info> {
    #[account(
        init,
        payer = Signer,
        space = MyAccount::INIT_SPACE,
    )]
    pub my_account: Account<'info, MyAccount>,
    
    #[account(mut)]
    pub signer = Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// instruction
pub fn init(ctx: COntext<Init>) -> Result<()> {
    let acc = &mut ctx.account.my_account;
    acc.counter = 0;
    acc.data = [0u8; 64];
    Ok(())
}
```
What Anchor does under the hood when it sees init:

Computes how many lamports are required for rent exemption for space.

Calls System Program CPI to create the account and fund it from payer.

Writes the discriminator (8 bytes) and the serialized struct space (uninitialized except what you write).

### update instructions
```rust

#[derive(Accounts)]
pub struct Update<'info> {

    #[account(mut, has_one = owner)]
    pub my_account: Account<'info, MyAccount>,

    pub owner = Signer<'info>,
}

pub fn update(ctx: Context<Upate>, delta: u64) -> Result<()> {
    let acc = &mut ctx.account.my_account;
    acc.counter = acc.counter.checked_add(delta).ok_err(ErrorCode::Overflow)?;
    Ok(())
}
```
`has_one = owner` tells anchor my_account.owner == owner.key()


# Lazy accounts
https://arc.net/l/quote/ludjcqhm

# Token Accounts
assests like USDC, NFTs, goverancce token is managed by the SPL Toke program.

SPL tokens have two major account types
- mint token: define the token, it's supply, decimals, auths
- token Account (ata) holds a balance of that token for a specefic wallet

## Mint account in anchor_lang
```rust
#[account(
    mint::decimals     = 6,                   // how many decimals
    mint::authority    = signer,              // who can mint more
    mint::freeze_authority = signer,          // who can freeze accounts (optional)
    mint::token_program = token_program       // which token program (SPL or Token2022)
)]
pub mint: Account<'info, Mint>,

```

this represent USDC like token itself
decimals = 6 -> USDC = 1_000000 base units
authority = signer -> only signer can mint more supply
freeze_authority  (optional) can freeze accounts if needed
anchor enforces these constraints automatically 

## Token Accout ATA in anchor 
```rust
#[account(
    mut,
    associated_token::mint       = mint,      // must belong to our Mint
    associated_token::authority  = signer,    // owned by signer
    associated_token::token_program = token_program
)]
pub maker_ata_a: Account<'info, TokenAccount>,

```

if mint = USDC 
signer = alice maker_ata_a = alice's usdc account 
anyone can send tokens in but only alice authority can spend tem 
mut as balance is changged during transfer/

## Token vs Token2022

Solana is migrating to Token2022, which supports extensions (like interest-bearing tokens, confidential transfers).

Problem:
- Account<'info, Mint> only works with classic SPL Token.
- Account<'info, TokenAccount> only works with classic Token accounts.

Solution = InterfaceAccount

[BLOCK]

https://learn.blueshift.gg/en/courses/spl-token-with-anchor
https://learn.blueshift.gg/en/courses/token-2022-with-anchor


## addons 
 - `UncheckedAccount` provides access to the account without checking 
 - Working with accounts that lack a defined structure
 - Implementing custom validation logic
 - Interacting with accounts from other programs that don't have Anchor type definitions

 ... https://learn.blueshift.gg/courses/anchor-for-dummies/anchor-accounts#custom-account-validation

Client Side Implementation
We can easily pass remaining accounts using the Anchor SDK generated once we do anchor build. Since those are "raw" accounts we'll need to specify if they need to be passed as signer and/or mutable like this:

ts
await program.methods.someMethod().accounts({
  // some accounts
})
.remainingAccounts([
  {
    isSigner: false,
    isWritable: true,
    pubkey: new Pubkey().default
  }
])
.rpc();

[[anchor-instructions.md]] ->

