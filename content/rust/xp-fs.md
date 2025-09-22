---
title: fs notes
description: demonstrates fundamental file system operations in Rust, including writing to, reading from, and creating directories.
---
[[001]]

# fs 

---

## 1. Writing to a File
```rust
// let content = "yashaswa is the best coder";
// let path = "output.txt";
// fs::write(path, content)
````

* `fs::write` writes text to a file.
* If the file does not exist, it creates one.
* If the file exists, it overwrites it.
* Always handle errors with `match` to avoid silent failures.

---

## 2. Reading from a File

```rust
// let path = "output.txt";
// fs::read_to_string(path)
```

* `fs::read_to_string` reads a file’s full content into a `String`.
* Works best for small to medium text files.
* Always check for errors (e.g., missing file or permission issue).

---

## 3. Directory Operations

```rust
let dir_path = "my_app_data";
fs::create_dir_all(dir_path)
```

* `create_dir_all` makes a directory.
* If it already exists, no error is thrown.
* Important to check for errors; if directory creation fails, stop further work.

---

### Writing Data Inside the Directory

```rust
let file_path = "my_app_data/data.txt";
fs::write(file_path, "some important data")
```

* Creates a new file inside the directory.
* Saves `"some important data"` into it.

---

### Listing Directory Contents

```rust
fs::read_dir(dir_path)
```

* Reads entries inside the directory.
* Must handle each entry carefully, since errors can happen while reading.
* `entry.path().display()` shows the file or folder path in a readable format.

---

## Key Takeaways

1. Always check results with `match` or `if let` to avoid crashes.
2. Writing overwrites files; be careful not to lose old data.
3. Directories may already exist, so handle that case smoothly.
4. Reading directories is useful to confirm what files you have created.

