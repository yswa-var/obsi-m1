---
title: Ownership
---

lets first talk about stack and heap

## stack
- first in last out 
- less messy then heap
- used by rust to store finite structures
- in rust the when new variable is assigned the data is copied

let x = 5;
let y = x;

in this the x = 5, y = 5. this is because the data is finite.

## heap
- flexiable memory store.
- slower access
- when you assign a variable that hold some data to another the pointer get's moved as `let x=5` and `let y=x` then `x` is no longer valid as the pointer is now moved to the y variable.

# Ownership concept in Rust.
it's rust way of managing memory in heap saftly, without a garbage collector.

## 3 rules of ownership.
- each value have a single owner called `owner`.
- one value can have a single owner at a time.
- when owner is out of scope the owner and value get's dropped 

```
{ // new scope is created inside a struct.
    let x = 20; // an owner is defined, indide the struct we can access this owner.
} // when the owner is outof scope the value and owner gets dropped.
```

in rust 
```
fn main() {
    let x = 5;
    let y = x;
    // we can only access the y the x is now invalide as the ownership got changed.
}

```

# Refferance.
(refferancing)[https://youtu.be/VFIOSWy93H0?si=80w3fIlpAv5-qnOE&t=804]

```
fn main() {
    let x = String::new("yashaswa");
    let len = calculate_len(x); // now we have moved the ownership of x to this `calculate_len` function.
    println!("x = '{}', it's size = '{}'", x, len); // we can no longer access the x as the ownership is `calculate_len`.
    // and then calculate_len funciton is now out of scope!
}
```

how can we fuix this ?? by using something called refferancing.

```
fn calculate_len(x: &String) -> usize {
    // we have got the reffrance of this string 
    let len = s.len(); // we can use the x freely.
    x
}

// we can now call this funciton as 
calculate_len(&x) // refferance to x not the actual x hence preserving the x that we can use further in the main fucnotin
```

## Mutable refferancing.

how to pass a mutable refferance.
```
fn main() {
    let mut s1: String String::from("hello");
    change(some_string: &mut s1);
}
fn change(some string: &mut String) {
    some string.push_str(string: ", world");
}
```

in reffrance we have a rule! 
**we can only have one mutable refferance to a perticular piece of data in a perticular scope.**

this is important as it prevents `data-race` at compile time.
```
fn main() {
  let mut s: String String::from("hello");
  let r1: &mut String = &mut s;
  let r2: &mut String = &mut s;
  println!("{}, {}", r1, r2);
}
// this will through an error as this is not allowed. but 

// this is allowed
fn main() {
  let s: String String:: from ("hello");
  let rl: &String = &s;
  let r2: &String = &s;
  println!("{}, {}", r1, r2);
}
```



