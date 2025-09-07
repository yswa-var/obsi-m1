---
title: enum
---
← [[rust/001]]


Enums, short for enumerations, are a powerful feature in Rust. Unlike enums in many other languages which are often just a set of named integer constants, Rust enums are rich algebraic data types. They allow you to define a type that can be one of several possible variants.

### 1\. Basic Enum Definition

An enum is a custom data type that lets you list all possible *variants*.

  * **Purpose**: To create a type that has a fixed set of possible values.
  * **Syntax**: Use the `enum` keyword, give the type a name, and list its variants inside curly braces.

<!-- end list -->

```rust
// Define an enum called Direction
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

// A function that takes our enum as an argument
fn move_player(direction: Direction) {
    // We can use the enum variants to determine the action
    // (We'll see a better way to do this with `match` later)
}

fn main() {
    // Create instances of the enum variants
    let go_up = Direction::Up;
    let go_down = Direction::Down;
    let go_left = Direction::Left;
    let go_right = Direction::Right;

    // Call the function with one of the variants
    move_player(go_up);
}
```

### 2\. Enums with Associated Data

This is where Rust enums truly shine. Each variant of an enum can have different types and amounts of data associated with it.

  * **Purpose**: To attach data directly to the variants of an enum, allowing you to create complex data structures. This means an enum isn't just a value, but a value that can *hold* other values.

<!-- end list -->

```rust
// An enum to represent different types of messages in a chat application
enum Message {
    Quit, // No data associated
    Write(String), // A String tuple-like struct
    Move { x: i32, y: i32 }, // A struct with named fields
    ChangeColor(i32, i32, i32), // A tuple of three i32 values
}

fn main() {
    let msg1 = Message::Quit;
    let msg2 = Message::Write(String::from("Hello, Rust!"));
    let msg3 = Message::Move { x: 10, y: 20 };
    let msg4 = Message::ChangeColor(255, 0, 128);
}
```

  * Each variant can be thought of as a function that constructs an instance of the enum.
  * This allows you to group related concepts into a single type, even if they hold different data.

### 3\. The `match` Control Flow Operator

The `match` keyword is Rust's powerful pattern matching tool. It's the most common way to work with enums. It forces you to handle every possible variant, which is a key safety feature of Rust.

  * **Purpose**: To execute different code depending on which variant of an enum you have.
  * **Exhaustiveness**: The compiler guarantees that you have handled every single possible case (all variants). If you add a new variant to your enum later, the compiler will point out all the `match` expressions that need to be updated. This eliminates a whole class of bugs.

<!-- end list -->

```rust
enum Message {
    Quit,
    Write(String),
    Move { x: i32, y: i32 },
    ChangeColor(i32, i32, i32),
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => {
            println!("The Quit variant has no data.");
        }
        Message::Write(text) => {
            // We can bind the associated data to a variable `text`
            println!("Text message: {}", text);
        }
        Message::Move { x, y } => {
            // We can destructure the named fields
            println!("Move to coordinates: x = {}, y = {}", x, y);
        }
        Message::ChangeColor(r, g, b) => {
            // We can bind the tuple elements to variables
            println!("Change color to RGB: ({}, {}, {})", r, g, b);
        }
    }
}

fn main() {
    process_message(Message::Write(String::from("match is powerful")));
    process_message(Message::Move { x: 5, y: 15 });
}
```

### 4\. The `Option` Enum: Rust's Solution to Null

Rust does not have `null` values. Instead, it uses a standard library enum called `Option<T>` to encode the concept of a value being present or absent.

  * **Definition**:
    ```rust
    enum Option<T> {
        None,       // The value is absent (like null)
        Some(T),    // The value is present and holds a value of type T
    }
    ```
  * **Advantage**: It's type-safe. The compiler forces you to handle the `None` case before you can use the value inside `Some(T)`. This prevents "null pointer exceptions" at compile time.

<!-- end list -->

```rust
fn divide(numerator: f64, denominator: f64) -> Option<f64> {
    if denominator == 0.0 {
        None // Division by zero is not possible
    } else {
        Some(numerator / denominator) // Return the result wrapped in Some
    }
}

fn main() {
    let result1 = divide(10.0, 2.0);
    let result2 = divide(8.0, 0.0);

    match result1 {
        Some(value) => println!("Result 1: {}", value),
        None => println!("Result 1: Cannot divide by zero!"),
    }

    match result2 {
        Some(value) => println!("Result 2: {}", value),
        None => println!("Result 2: Cannot divide by zero!"),
    }
}
```

### 5\. Defining Methods on Enums with `impl`

Just like `struct`s, you can define methods on `enum`s using an `impl` block. This helps to keep related behavior and data together.

```rust
enum Message {
    Quit,
    Write(String),
}

impl Message {
    // A method on our Message enum
    fn describe(&self) {
        match self {
            Message::Quit => println!("This is a Quit message."),
            Message::Write(text) => println!("This is a Write message: {}", text),
        }
    }
}

fn main() {
    let msg = Message::Write(String::from("Using methods!"));
    msg.describe();

    let q_msg = Message::Quit;
    q_msg.describe();
}
```

### 6\. `if let`: Concise Control Flow

Sometimes, a `match` expression is too verbose if you only care about one specific variant. `if let` is syntactic sugar for a `match` that runs code on one pattern while ignoring the rest.

  * **Purpose**: To handle one specific enum variant without the boilerplate of a full `match`.

<!-- end list -->

```rust
fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    // Using match
    match age {
        Ok(age_val) => println!("The age is {}", age_val),
        Err(_) => {} // We have to handle the error case, even if we do nothing
    }

    // Using if let - much cleaner!
    if let Ok(age_val) = age {
        println!("The age using if let is {}", age_val);
    } else {
        println!("Could not parse age.");
    }
    
    // Another example
    let some_value = Some(5);
    if let Some(x) = some_value {
        println!("The value is {}", x);
    }
}
```

### Summary

| Feature | Description |
| :--- | :--- |
| **Variants** | An enum is a type with a fixed set of possible values, called variants. |
| **Associated Data** | Variants can store different types and amounts of data, making enums very flexible. |
| **`match`** | The primary way to use enums. It's an exhaustive pattern-matching tool that ensures all cases are handled. |
| **`Option<T>`** | A core library enum that provides a type-safe way to handle nullable values, preventing common bugs. |
| **`impl`** | You can define methods on enums to encapsulate behavior related to the enum's variants. |
| **`if let`** | A more concise alternative to `match` when you only care about handling one specific variant. |
| **Type Safety** | By combining enums with `match`, Rust ensures at compile time that you have considered every possible state your data can be in. |
