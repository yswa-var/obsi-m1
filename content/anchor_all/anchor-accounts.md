---
topic: anchor accounts
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
