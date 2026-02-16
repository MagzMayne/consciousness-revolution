/**
 * Rust Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 * 
 * Features demonstrated:
 * - Ownership, Borrowing, and Lifetimes
 * - Traits and Generics
 * - Error Handling with Result/Option
 * - Pattern Matching
 * - Smart Pointers (Box, Rc, Arc, RefCell)
 * - Iterators and Closures
 * - Concurrency (threads, channels)
 * - Macros
 * - Zero-cost Abstractions
 */

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;
use std::sync::mpsc;
use std::cell::RefCell;
use std::rc::Rc;
use std::fmt;

// ============ Custom Error Types ============

#[derive(Debug, Clone)]
enum DataError {
    NotFound(String),
    ValidationError(String),
    ConcurrencyError,
}

impl fmt::Display for DataError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DataError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            DataError::ValidationError(msg) => write!(f, "Validation Error: {}", msg),
            DataError::ConcurrencyError => write!(f, "Concurrency Error"),
        }
    }
}

type Result<T> = std::result::Result<T, DataError>;

// ============ Traits ============

trait Processable {
    fn process(&self) -> String;
    fn validate(&self) -> bool;
}

trait Cacheable: Clone {
    fn cache_key(&self) -> String;
}

// ============ Generic Structs with Lifetimes ============

#[derive(Debug, Clone)]
struct Entity<'a, T: Clone> {
    id: &'a str,
    data: T,
    metadata: HashMap<String, String>,
}

impl<'a, T: Clone> Entity<'a, T> {
    fn new(id: &'a str, data: T) -> Self {
        Self {
            id,
            data,
            metadata: HashMap::new(),
        }
    }
    
    fn add_metadata(&mut self, key: String, value: String) {
        self.metadata.insert(key, value);
    }
}

// ============ Advanced Pattern Matching ============

#[derive(Debug)]
enum Message {
    Text(String),
    Image { url: String, width: u32, height: u32 },
    Video { url: String, duration: u32 },
    System(SystemMessage),
}

#[derive(Debug)]
enum SystemMessage {
    Connect,
    Disconnect,
    Ping,
}

fn handle_message(msg: Message) -> String {
    match msg {
        Message::Text(content) => format!("Text: {}", content),
        Message::Image { url, width, height } => {
            format!("Image: {} ({}x{})", url, width, height)
        }
        Message::Video { url, duration } => {
            format!("Video: {} ({}s)", url, duration)
        }
        Message::System(SystemMessage::Connect) => "System: Connected".to_string(),
        Message::System(SystemMessage::Disconnect) => "System: Disconnected".to_string(),
        Message::System(SystemMessage::Ping) => "System: Pong".to_string(),
    }
}

// ============ Smart Pointers ============

struct Node {
    value: i32,
    children: Vec<Rc<RefCell<Node>>>,
}

impl Node {
    fn new(value: i32) -> Rc<RefCell<Self>> {
        Rc::new(RefCell::new(Node {
            value,
            children: Vec::new(),
        }))
    }
    
    fn add_child(&mut self, child: Rc<RefCell<Node>>) {
        self.children.push(child);
    }
}

// ============ Iterator Adaptors ============

struct Fibonacci {
    current: u64,
    next: u64,
}

impl Fibonacci {
    fn new() -> Self {
        Fibonacci { current: 0, next: 1 }
    }
}

impl Iterator for Fibonacci {
    type Item = u64;
    
    fn next(&mut self) -> Option<Self::Item> {
        let current = self.current;
        self.current = self.next;
        self.next = current + self.next;
        Some(current)
    }
}

// ============ Generic Cache with Traits ============

struct Cache<T: Cacheable> {
    data: HashMap<String, T>,
    max_size: usize,
}

impl<T: Cacheable> Cache<T> {
    fn new(max_size: usize) -> Self {
        Cache {
            data: HashMap::new(),
            max_size,
        }
    }
    
    fn insert(&mut self, item: T) {
        if self.data.len() >= self.max_size {
            if let Some(key) = self.data.keys().next().cloned() {
                self.data.remove(&key);
            }
        }
        self.data.insert(item.cache_key(), item);
    }
    
    fn get(&self, key: &str) -> Option<&T> {
        self.data.get(key)
    }
}

// ============ Trait Implementations ============

#[derive(Debug, Clone)]
struct User {
    id: String,
    name: String,
    email: String,
}

impl Processable for User {
    fn process(&self) -> String {
        format!("Processing user: {}", self.name)
    }
    
    fn validate(&self) -> bool {
        !self.name.is_empty() && self.email.contains('@')
    }
}

impl Cacheable for User {
    fn cache_key(&self) -> String {
        self.id.clone()
    }
}

// ============ Functional Programming ============

fn compose<A, B, C, F, G>(f: F, g: G) -> impl Fn(A) -> C
where
    F: Fn(A) -> B,
    G: Fn(B) -> C,
{
    move |x| g(f(x))
}

// ============ Error Handling ============

fn fetch_user(id: &str) -> Result<User> {
    if id.is_empty() {
        return Err(DataError::ValidationError("ID cannot be empty".to_string()));
    }
    
    if id == "404" {
        return Err(DataError::NotFound(format!("User {} not found", id)));
    }
    
    Ok(User {
        id: id.to_string(),
        name: "John Doe".to_string(),
        email: "john@example.com".to_string(),
    })
}

fn process_user_chain(id: &str) -> Result<String> {
    let user = fetch_user(id)?;
    
    if !user.validate() {
        return Err(DataError::ValidationError("Invalid user data".to_string()));
    }
    
    Ok(user.process())
}

// ============ Concurrency ============

fn concurrent_processing(items: Vec<i32>) -> Vec<i32> {
    let data = Arc::new(Mutex::new(Vec::new()));
    let mut handles = vec![];
    
    for item in items {
        let data_clone = Arc::clone(&data);
        let handle = thread::spawn(move || {
            let processed = item * 2;
            let mut data = data_clone.lock().unwrap();
            data.push(processed);
        });
        handles.push(handle);
    }
    
    for handle in handles {
        handle.join().unwrap();
    }
    
    let result = data.lock().unwrap();
    result.clone()
}

// ============ Channel Communication ============

fn producer_consumer_pattern() {
    let (tx, rx) = mpsc::channel();
    
    // Producer
    thread::spawn(move || {
        for i in 1..=5 {
            tx.send(i * 10).unwrap();
            thread::sleep(std::time::Duration::from_millis(10));
        }
    });
    
    // Consumer
    for received in rx {
        println!("Received: {}", received);
    }
}

// ============ Macros ============

macro_rules! create_function {
    ($func_name:ident, $operation:expr) => {
        fn $func_name(x: i32) -> i32 {
            $operation(x)
        }
    };
}

create_function!(double, |x| x * 2);
create_function!(triple, |x| x * 3);

macro_rules! hashmap {
    ($($key:expr => $value:expr),* $(,)?) => {
        {
            let mut map = HashMap::new();
            $(
                map.insert($key, $value);
            )*
            map
        }
    };
}

// ============ Main Function ============

fn main() {
    println!("🦀 RUST ADVANCED FEATURES SHOWCASE\n");
    
    // 1. Ownership and Borrowing
    println!("=== Ownership & Borrowing ===");
    let s1 = String::from("Rust");
    let s2 = &s1; // Borrowing
    println!("Borrowed: {}", s2);
    println!("Original still valid: {}", s1);
    
    // 2. Pattern Matching
    println!("\n=== Pattern Matching ===");
    let messages = vec![
        Message::Text("Hello".to_string()),
        Message::Image { url: "image.jpg".to_string(), width: 800, height: 600 },
        Message::System(SystemMessage::Connect),
    ];
    
    for msg in messages {
        println!("{}", handle_message(msg));
    }
    
    // 3. Error Handling with Result
    println!("\n=== Error Handling ===");
    match process_user_chain("user123") {
        Ok(result) => println!("✓ {}", result),
        Err(e) => println!("✗ Error: {}", e),
    }
    
    match process_user_chain("404") {
        Ok(result) => println!("✓ {}", result),
        Err(e) => println!("✗ Error: {}", e),
    }
    
    // 4. Iterators and Closures
    println!("\n=== Iterators ===");
    let fib_sequence: Vec<u64> = Fibonacci::new().take(10).collect();
    println!("Fibonacci: {:?}", fib_sequence);
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter()
        .map(|x| x * 2)
        .filter(|x| x > &5)
        .sum();
    println!("Sum of doubled & filtered: {}", sum);
    
    // 5. Functional Composition
    println!("\n=== Functional Composition ===");
    let add_5 = |x: i32| x + 5;
    let multiply_3 = |x: i32| x * 3;
    let composed = compose(add_5, multiply_3);
    println!("compose(+5, *3)(10) = {}", composed(10)); // (10+5)*3 = 45
    
    // 6. Smart Pointers
    println!("\n=== Smart Pointers (Rc & RefCell) ===");
    let root = Node::new(1);
    let child1 = Node::new(2);
    let child2 = Node::new(3);
    
    root.borrow_mut().add_child(Rc::clone(&child1));
    root.borrow_mut().add_child(Rc::clone(&child2));
    
    println!("Root value: {}", root.borrow().value);
    println!("Children count: {}", root.borrow().children.len());
    
    // 7. Generic Cache
    println!("\n=== Generic Cache ===");
    let mut user_cache = Cache::<User>::new(100);
    let user = User {
        id: "u1".to_string(),
        name: "Alice".to_string(),
        email: "alice@example.com".to_string(),
    };
    
    user_cache.insert(user.clone());
    if let Some(cached) = user_cache.get("u1") {
        println!("Cached user: {}", cached.name);
    }
    
    // 8. Trait Bounds
    println!("\n=== Traits ===");
    println!("{}", user.process());
    println!("Valid: {}", user.validate());
    
    // 9. Macros
    println!("\n=== Macros ===");
    println!("double(5) = {}", double(5));
    println!("triple(5) = {}", triple(5));
    
    let map = hashmap! {
        "language" => "Rust",
        "year" => "2010",
        "paradigm" => "Multi-paradigm",
    };
    println!("HashMap created via macro: {:?}", map);
    
    // 10. Concurrency
    println!("\n=== Concurrency (Threads) ===");
    let items = vec![1, 2, 3, 4, 5];
    let results = concurrent_processing(items);
    println!("Concurrent results: {:?}", results);
    
    // 11. Channel Communication
    println!("\n=== Channel Communication ===");
    producer_consumer_pattern();
    
    // 12. Option Type
    println!("\n=== Option Type ===");
    let some_value = Some(42);
    let no_value: Option<i32> = None;
    
    if let Some(v) = some_value {
        println!("Value exists: {}", v);
    }
    
    let unwrapped = no_value.unwrap_or(0);
    println!("Unwrapped with default: {}", unwrapped);
    
    // 13. Lifetimes
    println!("\n=== Lifetimes ===");
    let id = "entity_1";
    let mut entity = Entity::new(id, "Some data".to_string());
    entity.add_metadata("created_by".to_string(), "system".to_string());
    println!("Entity ID: {}, Data: {}", entity.id, entity.data);
    
    println!("\n✅ All advanced Rust features demonstrated!");
}
