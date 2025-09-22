---
title: wallet_essentials
description: demonstrates how to generate and restore Solana keypairs, including the creation of mnemonic phrases.
---
```rust
// Import required dependencies
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

// Example 1: Generate a new random keypair
console.log("=== Example 1: Generate Random Keypair ===");
const randomKeypair = Keypair.generate();
console.log("Public address:", randomKeypair.publicKey.toBase58());
console.log("Secret key:", randomKeypair.secretKey);

// Example 2: Generate mnemonic phrase
console.log("\n=== Example 2: Generate Mnemonic ===");
const generatedMnemonic = bip39.generateMnemonic();
console.log("Generated mnemonic:", generatedMnemonic);

// Example 3: Restore keypair from mnemonic (basic method)
console.log("\n=== Example 3: Restore Keypair from Mnemonic ===");
const sampleMnemonic = "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
const seed = bip39.mnemonicToSeedSync(sampleMnemonic, "");
const restoredKeypair = Keypair.fromSeed(seed.subarray(0, 32));
console.log("Restored public key:", restoredKeypair.publicKey.toBase58());

// Example 4: Restore BIP44 format keypairs (HD wallet)
console.log("\n=== Example 4: Restore BIP44 HD Keypairs ===");
const hdMnemonic = "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";
const hdSeed = bip39.mnemonicToSeedSync(hdMnemonic, "");
const hd = HDKey.fromMasterSeed(hdSeed.toString("hex"));

// Generate first 10 keypairs using BIP44 derivation paths
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`; // Solana uses coin type 501
  const hdKeypair = Keypair.fromSeed(hd.derive(path).privateKey);
  console.log(`${path} => ${hdKeypair.publicKey.toBase58()}`);
}

// Example 5: Sign and verify a message using nacl
console.log("\n=== Example 5: Sign Message ===");
const signingKeypair = Keypair.generate();
const message = "Hello, world!";
const messageBytes = naclUtil.decodeUTF8(message);

// Sign the message using nacl
const signature = nacl.sign.detached(messageBytes, signingKeypair.secretKey);

// Verify the signature
const isValid = nacl.sign.detached.verify(
  messageBytes,
  signature,
  signingKeypair.publicKey.toBytes()
);

console.log("Message:", message);
console.log("Signature:", Buffer.from(signature).toString('base64'));
console.log("Public key:", signingKeypair.publicKey.toBase58());
console.log("Signature verification:", isValid ? "✅ Valid" : "❌ Invalid");

```

## output
```
=== Example 1: Generate Random Keypair ===
Public address: AgbMJ7TBVHS9cZxsUqnyZj9QethrjmRhz4e9NZdxrCK4
Secret key: Uint8Array(64) [
   19, 167, 159, 245, 196, 128, 223,  95,  29, 197,
  196,  53, 190, 106, 219, 125, 207,  68,  49, 204,
   92, 162, 130,  17,  29,   5, 234,  38, 165, 156,
  174, 231, 143, 221, 172, 104,  15, 223, 116,  23,
  104, 243, 143, 118, 185,  57, 255,  26, 244, 239,
  169, 111, 148, 203,  86,  49, 227, 157, 192, 221,
  247,  61, 241, 187
]

=== Example 2: Generate Mnemonic ===
Generated mnemonic: tragic allow glass brother position index west cage tent other hidden volcano

=== Example 3: Restore Keypair from Mnemonic ===
Restored public key: 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG

=== Example 4: Restore BIP44 HD Keypairs ===
m/44'/501'/0'/0' => 5vftMkHL72JaJG6ExQfGAsT2uGVHpRR7oTNUPMs68Y2N
m/44'/501'/1'/0' => GcXbfQ5yY3uxCyBNDPBbR5FjumHf89E7YHXuULfGDBBv
m/44'/501'/2'/0' => 7QPgyQwNLqnoSwHEuK8wKy2Y3Ani6EHoZRihTuWkwxbc
m/44'/501'/3'/0' => 5aE8UprEEWtpVskhxo3f8ETco2kVKiZT9SS3D5Lcg8s2
m/44'/501'/4'/0' => 5n6afo6LZmzH1J4R38ZCaNSwaztLjd48nWwToLQkCHxp
m/44'/501'/5'/0' => 2Gr1hWnbaqGXMghicSTHncqV7GVLLddNFJDC7YJoso8M
m/44'/501'/6'/0' => BNMDY3tCyYbayMzBjZm8RW59unpDWcQRfVmWXCJhLb7D
m/44'/501'/7'/0' => 9CySTpi4iC85gMW6G4BMoYbNBsdyJrfseHoGmViLha63
m/44'/501'/8'/0' => ApteF7PmUWS8Lzm6tJPkWgrxSFW5LwYGWCUJ2ByAec91
m/44'/501'/9'/0' => 6frdqXQAgJMyKwmZxkLYbdGjnYTvUceh6LNhkQt2siQp

=== Example 5: Sign Message ===
Message: Hello, world!
Signature: JThr/0j4L30VjyqSMwzOJRwggJKbYBDhLf1wvRkPNhWMWL3eU4Xx/pjoU7uQCtBMBTmseY3iYCi49UkDOdIRBg==
Public key: E5bcHhxMMsTidD776zGL4LerTkeXRRXFJfcd99MHAxeG
Signature verification: ✅ Valid
```
