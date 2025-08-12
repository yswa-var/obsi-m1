---
title: "Engineer's Guide to Solana: Part 2 - The Raw Fundamentals, State Management (Native Rust)"
description: "Learn to build smart contracts in native Rust for Solana, understanding the core development approach and state management"
author: "Yashaswa Varshney"
date: 2024-01-23
tags:
  - solana
  - rust
  - smart-contracts
  - blockchain
  - web3
  - development
---

# Engineer's Guide to Solana: Part 2 - The Raw Fundamentals, State Management (Native Rust)

In Part 1 of the series, we covered the fundamentals of Solana. In this part, we will understand how to code a smart contract in native Rust. Sure, there is an easier approach with "Anchor" to code smart contracts, but this framework hides a lot of boilerplate code which I think is very important to understand the approach of Solana towards its development. Also, knowing this makes Anchor actually helpful.

## Environment Setup

### Prerequisites

1. **Install Rust**: Use [this link](https://rustup.rs/) to download the right version for your operating system
   - On macOS: You may also need to download Xcode. Run: `xcode-select --install` in the terminal
   - On PC: You may need to download C++ build tools

2. **Download Visual Studio Code**: The recommended IDE for Rust development

3. **Install Extensions**:
   - **Rust-analyzer** (NOT the Rust extension) - Search for it in the extensions tab
   - **Code Runner** - For running code snippets
   - **Better TOML** - Helps read TOML files
   - **Code LLDB** or **C/C++ (Windows)** - For debugging
   - **Crates** - Shows latest crate versions and features

4. **Download Solana and Anchor tools**: [Solana Installation Guide](https://solana.com/pl/docs/intro/installation)

Once we have all the arsenal, let's move to the war.

## What is a Smart Contract on Solana?

A smart contract is a program. More specifically, it's a piece of self-executing code that lives permanently on the Solana blockchain.

**Key Characteristics:**
- Its purpose is to define the logic for how data is stored and modified
- Think of smart contracts not as databases that hold data, but as powerful gatekeepers
- They stand in front of the data and enforce a strict, unchangeable set of rules on how that data can be accessed and altered
- They are the guardians of logic on the blockchain

## Solana CLI

To build, test, and interact with the Solana network, developers rely on the Solana CLI.

### Three Environments

1. **Local Test Validators** (aka "local-server"):
   - A local dev sandbox that runs a Solana cluster entirely on your local machine
   - Allows you to airdrop nearly unlimited amounts of test SOL (these have no real-world value)

2. **Devnet** ("dev-net"):
   - Once you have a stable contract, it's time for devnet
   - This is a live, public blockchain run by actual validators that mimics the behavior of the real network
   - SOL on devnet is free (get them from "faucet"), but supply is limited
   - Used for pre-production testing

3. **Mainnet Beta** ("main-net"):
   - The final frontier, the live, public Solana blockchain
   - Transactions are real and have real-world value
   - After a contract is well tested on both local-server and devnet, deploy it to mainnet

**For setup details**: [Solana Cookbook - Start Local Validator](https://solana.com/pl/developers/cookbook/development/start-local-validator)

## The Counter Contract: Understanding Solana Philosophy

### What Are We Building?

A counter that simply starts at 0. This contract creates storage whose content can only be modified by the contract itself. This contract makes a separate database for each account, which is how we achieve parallelism in Solana. Since the database is separated, the contract will have no issues running them concurrently.

## Complete Counter Contract Code

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    entrypoint,
    msg,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize)]
enum InstructionType {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Counter {
    count: u32, 
}

entrypoint!(counter_program);

fn counter_program(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8], // array of bytes
) -> ProgramResult {
    let acc = next_account_info(&mut accounts.iter())?;
    let mut counter = Counter::try_from_slice(&acc.data.borrow())?;

    match InstructionType::try_from_slice(instruction_data)? {
        InstructionType::Increment(count) => {
            msg!("Incrementing counter by {}", count);
            counter.count += count;
        }
        InstructionType::Decrement(count) => {
            msg!("Decrementing counter by {}", count);
            counter.count -= count;
        }
    }
    counter.serialize(&mut &mut acc.data.borrow_mut()[..])?;
    Ok(())    
}
```

## Understanding Rust and Solana's Standard Libraries

### Import Statements Breakdown

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::{self, ProgramResult},
    msg,
    pubkey::Pubkey,
};
```

**Borsh Serialization**: Solana programs don't natively understand Rust data structures. Like Protocol Buffers used in gRPC (Google's binary-based communication), Solana uses Borsh. They only deal with `[u8]` (byte arrays). Borsh is a serialization library that converts Rust data structures into byte arrays and converts bytes back to Rust structures on-chain (called Deserialization).

We use this with `#[derive(BorshDeserialize, BorshSerialize)]` - this trait automatically generates the required code to perform this task.

**Solana Program Imports**:
- `account_info::AccountInfo`: Key concept used by the main instruction function containing metadata of accounts (public key, owner, raw data)
- `account_info::next_account_info`: Helper function to iterate over accounts in the accounts array
- `entrypoint`: Boilerplate code from Solana; `entrypoint!` is a macro that sets up the main function
- `ProgramResult`: Type alias for `Result<(), ProgramError>`
- `msg!`: Macro to print messages for on-chain logs and debugging
- `pubkey::PubKey`: Represents a 32-byte public key on Solana

## Defining Data Structures

We need to define the data structures our program will use. In this case, only two:

```rust
// The kind of instruction we need for a dev to call and access
// Think of them like different types of instruction functions defined
// when we use Solidity for Ethereum development.
#[derive(BorshDeserialize, BorshSerialize)] // For Solana to import/export in desired formats
enum InstructionType {
    Increment(u32),
    Decrement(u32),
}

#[derive(BorshDeserialize, BorshSerialize)] 
struct Counter {
    count: u32,
}
```

**Key Points**:
- `#[derive(BorshDeserialize, BorshSerialize)]`: Automatically generates serialization/deserialization code
- `enum InstructionType`: In Solana, an "instruction" is a command sent to a program. Since programs only receive byte arrays, we need a way to encode what we want to do
- `Increment(u32)`: Tells the program to increment the counter with a payload value
- `Decrement(u32)`: Tells the program to decrement the counter with a payload value
- `struct Counter`: Defines the state of our program stored in an account on the blockchain

## The Program's Entry Point

This is where the magic happens. The `entrypoint!` macro sets up the `counter_program` function to be executed by the Solana runtime.

```rust
entrypoint!(counter_program);

fn counter_program(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8], // array of bytes
) -> ProgramResult {
    // ...
}
```

**Parameters**:
- `_program_id: &Pubkey`: Public key of the program itself (unused in this example, hence the underscore)
- `accounts: &[AccountInfo]`: Slice of AccountInfo structs - list of all accounts the program needs to read from or write to
- `instruction_data: &[u8]`: Raw byte array containing the instruction to execute

## The Program Logic: Inside `counter_program`

Let's dissect the core logic inside the function:

### 1. Account Access

```rust
let acc = next_account_info(&mut accounts.iter())?;
```

- `let acc = ...`: We get a reference to the first account in the list
- `next_account_info(&mut accounts.iter())?`: Standard way to grab accounts one by one
- `accounts.iter()` creates an iterator over the slice of accounts
- `&mut` gives us a mutable reference, allowing the iterator to be consumed
- `?` is shorthand for error handling

### 2. Data Deserialization

```rust
let mut counter = Counter::try_from_slice(&acc.data.borrow())?
```

- `acc.data.borrow()`: Gets an immutable reference to the raw data stored in the account
- `Counter::try_from_slice(...)`: Borsh deserializes the byte array into our Counter struct
- `let mut counter`: We use mutable because we intend to modify its value

### 3. Instruction Processing

```rust
match InstructionType::try_from_slice(instruction_data)? {
    InstructionType::Increment(count) => {
        msg!("Incrementing counter by {}", count);
        counter.count += count;
    }
    InstructionType::Decrement(count) => {
        msg!("Decrementing counter by {}", count);
        counter.count -= count;
    }
}
```

- `InstructionType::try_from_slice(instruction_data)?`: Deserializes incoming instruction data
- `match ...`: Powerful Rust feature for pattern matching
- We check which variant of InstructionType we received and execute accordingly

### 4. Data Serialization

```rust
counter.serialize(&mut &mut acc.data.borrow_mut()[..])?
```

- `acc.data.borrow_mut()`: Gets a mutable reference to write changes back to the account
- `counter.serialize(...)`: Borsh serializes our updated counter struct back to bytes
- This is why we only got an immutable borrow earlier - you can't have both mutable and immutable borrows simultaneously

### 5. Success Return

```rust
Ok(())
```

This line shows successful execution. If any error occurred, the `?` operator would have returned the error.

## Testing the Counter Contract

### The Testing Stack

**Local Validator**:
- Runs a full Solana node on your machine
- Provides the same environment as mainnet
- Allows unlimited airdrops for testing
- Generates detailed logs for debugging

**Web3.js Library**:
- Connects your tests to the validator
- Handles transaction creation and signing
- Manages account interactions
- Provides utility functions for common operations

**Test Framework**:
- We use Bun's built-in test runner
- Supports async operations
- Provides assertion methods
- Runs tests in parallel

### Program Architecture: Counter Example

This test program shows core Solana concepts:

```rust
enum InstructionType {
    Increment(u32),
    Decrement(u32),
}

struct Counter {
    count: u32, 
}
```

**Key Points**:
- Programs contain logic only, no data storage
- Instructions define operations the program can perform
- Data lives in separate accounts owned by the program
- Borsh serialization handles data encoding/decoding

### Test Structure Breakdown

#### 1. Setup Phase

```typescript
const connection = new Connection(RPC_URL, { commitment: "confirmed" });
const payer = Keypair.generate();
await airdropAndConfirm(connection, payer.publicKey, 200);
```

**What happens here**:
- Connect to local validator at `http://127.0.0.1:8899`
- Generate a new wallet for paying fees
- Request test SOL from the validator's faucet
- Wait for confirmation before proceeding

#### 2. Account Creation

```typescript
const counter = Keypair.generate();
const rentLamports = await connection.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SPACE);
const createIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: counter.publicKey,
    space: COUNTER_ACCOUNT_SPACE,
    lamports: rentLamports,
    programId: PROGRAM_ID,
});
```

**Critical steps**:
- Generate account keypair for the counter data
- Calculate rent exemption to keep account alive
- Set program as owner so it can modify the account
- Allocate exact space needed (4 bytes for u32)

#### 3. Instruction Encoding

```typescript
function encodeIncrement(amount: number): Buffer {
    return Buffer.concat([Buffer.from([0]), Buffer.from(u32ToLeBytes(amount))]);
}
```

**Encoding rules**:
- First byte is enum variant (0 for Increment, 1 for Decrement)
- Next 4 bytes are the number in little-endian format
- Must match Rust program expectations exactly
- Borsh handles serialization on both sides

#### 4. Transaction Building

```typescript
const incIx = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
        { pubkey: counter.publicKey, isSigner: false, isWritable: true },
    ],
    data: encodeIncrement(5),
});
const tx = new Transaction().add(incIx);
tx.recentBlockhash = latest.blockhash;
tx.feePayer = payer.publicKey;
tx.sign(payer);
```

**Transaction components**:
- Program ID tells the validator which program to call
- Account keys specify which accounts the program can access
- Instruction data contains the encoded parameters
- Recent blockhash prevents replay attacks
- Fee payer covers transaction costs

#### 5. Verification

```typescript
const value = await getCounterValue(connection, counter.publicKey);
expect(value).toBe(5);
```

**Verification process**:
- Read account data from the blockchain
- Deserialize the bytes back to a number
- Assert expected value using test framework
- Confirm state changes happened correctly

## Common Testing Patterns

### Account Data Validation

- Always check account exists before reading data
- Verify account owner matches expected program
- Confirm data size matches struct definition
- Handle deserialization errors gracefully

### Transaction Error Handling

- Test both success and failure cases
- Verify proper error messages
- Check account state remains unchanged on failure
- Test edge cases like insufficient funds

### Multiple Instruction Testing

- Test instruction sequences in single transactions
- Verify state changes persist between instructions
- Test instruction ordering dependencies
- Check gas consumption limits

## Best Practices

### Test Organization

- One test per user story, keep tests focused
- Setup helpers reduce code duplication
- Clear test names describe what you're testing
- Async/await properly, don't skip confirmations

### Account Management

- Generate fresh keypairs for each test
- Clean up accounts if running many tests
- Use deterministic seeds when account addresses matter
- Test with realistic data sizes

### Error Scenarios

- Test insufficient funds situations
- Verify access control works correctly
- Check invalid instruction data handling
- Test concurrent access patterns

### Performance Considerations

- Batch related operations in single transactions
- Use appropriate commitment levels for your needs
- Monitor compute unit consumption
- Test with realistic network conditions

## Debugging and Logs

### View Real-time Logs

```bash
solana logs --url http://127.0.0.1:8899
```

### Search for Your Program

```bash
grep "Program YOUR_PROGRAM_ID" test-ledger/validator.log
```

### Find Your Program Messages

```bash
grep "Program log:" test-ledger/validator.log
```

## Advanced Testing Scenarios

### Cross-Program Invocations

- Test programs calling other programs
- Verify correct Program Derived Addresses (PDAs)
- Check authority delegation works
- Test complex instruction compositions

### Token Program Integration

- Test SPL token interactions
- Verify mint and burn operations
- Check token account ownership
- Test transfer restrictions

### Upgrade Testing

- Test program upgrade scenarios
- Verify data migration works
- Check backward compatibility
- Test upgrade authority controls

## What's Next

**Up next**: "Part 3: Mastering Anchor (The Framework)"

---

*Tags: #Solana #Rust #SmartContracts #Blockchain #Web3 #Development*
