---
title: collections in rust
---

← [[rust/001]]

ok so i watched this video about rust collections and honestly i'm still confused but here's what i kinda understood (while also checking my phone and making coffee)

## 1. Vectors (`Vec<T>`) - basically arrays but cooler

so vectors are like... arrays that can grow? idk they store stuff next to each other in memory which sounds fancy

### making vectors (i think?)
- `Vec::new()` makes an empty one (duh)
- `vec![1, 2, 3]` makes one with stuff already in it (way easier)
```rust
let v: Vec<i32> = Vec::new(); // empty sad vector
let v = vec![1, 2, 3];      // happy vector with friends
```

### mutability stuff (this confused me)
- you need `mut` to add stuff with `.push()` 
- apparently when vectors die (go out of scope) they take their contents with them? dramatic

### getting elements (two ways apparently)
- `v[2]` - simple but will crash your program if you're wrong (rude)
- `v.get(2)` - safer, returns `Some(value)` or `None` (polite)
```rust
let v = vec![1, 2, 3];
let third: &i32 = &v[2]; // might panic if you're dumb
match v.get(2) {         // won't panic, just returns None
    Some(third) => println!("found it: {}", third),
    None => println!("nope, nothing here"),
}
```

### borrowing rules (this is where i got lost)
- you can't hold a reference to an element while adding stuff to the vector
- something about memory reallocation invalidating references? idk just don't do it

### looping through vectors
- `for` loops work fine
- you can get references to read or modify stuff
```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50; // the * thing dereferences? i think?
}
```

### storing different types
- vectors only like one type at a time (picky)
- use enums to store different types (workaround)

## 2. Strings (`String`) - why are these so complicated?

rust strings are apparently UTF-8 encoded bytes? i don't really get encoding but here's what i remember:

### encoding stuff (i was zoning out)
- ASCII: 7 bits per character (old school)
- Unicode: unique number for each character (fancy)
- UTF-8: variable width encoding that rust uses (confusing)

### making strings
- `String::new()` for empty
- `.to_string()` or `String::from()` to convert from string literals

### adding stuff to strings
- `push_str()` adds a string slice
- `push()` adds one character
- `+` operator concatenates but takes ownership (greedy)
- `format!` macro is better for multiple strings (doesn't steal ownership)

### indexing strings (this is weird)
- you can't do `string[0]` like in other languages
- something about UTF-8 characters being multiple bytes? idk just don't do it

### safer ways to iterate
- `.chars()` - gets actual characters
- `.bytes()` - gets raw bytes
- for grapheme clusters (what users see as letters) you need external libraries (annoying)

## 3. Hash Maps (`HashMap<K, V>`) - like dictionaries but rusty

hash maps store key-value pairs using hashing (whatever that means)

### setup
- need to import: `use std::collections::HashMap;`
- create with `HashMap::new()`

### adding stuff
- `.insert(key, value)` adds pairs
- if you insert a `String`, it moves into the map and you can't use it anymore (rude)

### getting values
- `.get(key)` returns `Option<&V>` - `Some(value)` or `None`
- safer than direct access

### looping
- `for` loop works, order is random (chaotic)

### updating values
- inserting same key overwrites old value
- `.entry().or_insert()` only inserts if key doesn't exist
- you can update values in place with this
```rust
let text = "hello world wonderful world";
let mut map = HashMap::new();
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1; // dereference to modify
}
```
