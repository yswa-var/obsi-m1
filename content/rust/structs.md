---
title: structs
---

← [[rust/001]] | [[rust/Ownership]] →

# Structs in Rust

This bit is easy!

defineing strut 
```
struct User {
    name: String,
    email: String,
    active: bool,
}

fn main() {
  let user1 = User {
    name: String::from("Alice"),
    email: String::from("alice@example.com"),
    active: true,
  };
  
  // we can access them as `user1.email` to have mutable 
  let name = user1.email;

  // to have mutable variable
  let mut user1 = ...;
  let mut name = user1.name;
}
```
we can also have a struct constructor funciton 
as 
```
fn build_user(email: String, username: String) -> User {
 User {
   email,
   username,
   active: true,
   sign_in_count: 1,
 }
}
```

we can add functions or more varaibles to the struct
```
#[derive (Debug)]
struct Rectangle {
  width: 432,
  height: 432
}

impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }
}

fn main() {
  let r1 = Rectangle {
    width: 30,
    height: 40
  }

  let areas = r1.area();
}

```

structs can have multipe implementations `impl` also multiple fucntions in side those impl 
