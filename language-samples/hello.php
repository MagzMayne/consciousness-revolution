<?php
/**
 * PHP Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 * 
 * Features demonstrated:
 * - Namespaces and Autoloading
 * - Traits
 * - Generators and Iterators
 * - Type Declarations and Strict Types
 * - Anonymous Classes
 * - Closures and Arrow Functions
 * - Error Handling with try/catch/finally
 * - Magic Methods
 * - Late Static Binding
 * - Dependency Injection
 */

declare(strict_types=1);

namespace BarbrickDesign\LanguageSamples;

// ============ Traits ============

trait Loggable {
    protected array $logs = [];
    
    public function log(string $message): void {
        $this->logs[] = sprintf("[%s] %s: %s", 
            date('Y-m-d H:i:s'), 
            static::class, 
            $message
        );
        echo end($this->logs) . PHP_EOL;
    }
    
    public function getLogs(): array {
        return $this->logs;
    }
}

trait Cacheable {
    private array $cache = [];
    
    public function remember(string $key, callable $callback): mixed {
        if (!isset($this->cache[$key])) {
            $this->cache[$key] = $callback();
        }
        return $this->cache[$key];
    }
    
    public function forget(string $key): void {
        unset($this->cache[$key]);
    }
}

// ============ Interfaces ============

interface RepositoryInterface {
    public function find(string $id): ?object;
    public function findAll(): array;
    public function save(object $entity): void;
    public function delete(string $id): bool;
}

interface ProcessorInterface {
    public function process(mixed $data): mixed;
    public function validate(mixed $data): bool;
}

// ============ Abstract Classes ============

abstract class BaseEntity {
    use Loggable;
    
    protected string $id;
    protected \DateTime $createdAt;
    
    public function __construct(string $id) {
        $this->id = $id;
        $this->createdAt = new \DateTime();
    }
    
    abstract public function validate(): bool;
    
    public function toArray(): array {
        return [
            'id' => $this->id,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s')
        ];
    }
}

// ============ User Entity ============

class User extends BaseEntity {
    use Cacheable;
    
    private string $name;
    private string $email;
    private string $role;
    
    public function __construct(string $id, string $name, string $email, string $role = 'user') {
        parent::__construct($id);
        $this->name = $name;
        $this->email = $email;
        $this->role = $role;
    }
    
    public function getName(): string {
        return $this->name;
    }
    
    public function getEmail(): string {
        return $this->email;
    }
    
    public function getRole(): string {
        return $this->role;
    }
    
    public function validate(): bool {
        return !empty($this->name) && 
               filter_var($this->email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public function toArray(): array {
        return array_merge(parent::toArray(), [
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role
        ]);
    }
    
    // Magic method
    public function __toString(): string {
        return sprintf("User(%s): %s <%s> [%s]", 
            $this->id, 
            $this->name, 
            $this->email, 
            $this->role
        );
    }
}

// ============ Repository Implementation ============

class UserRepository implements RepositoryInterface {
    use Loggable;
    
    private array $users = [];
    
    public function find(string $id): ?object {
        return $this->users[$id] ?? null;
    }
    
    public function findAll(): array {
        return array_values($this->users);
    }
    
    public function save(object $entity): void {
        if (!$entity instanceof User) {
            throw new \InvalidArgumentException("Entity must be an instance of User");
        }
        
        $this->users[$entity->toArray()['id']] = $entity;
        $this->log("User saved: {$entity->getName()}");
    }
    
    public function delete(string $id): bool {
        if (isset($this->users[$id])) {
            unset($this->users[$id]);
            return true;
        }
        return false;
    }
}

// ============ Generators ============

class FibonacciGenerator {
    public static function generate(int $limit): \Generator {
        $a = 0;
        $b = 1;
        
        while ($a < $limit) {
            yield $a;
            [$a, $b] = [$b, $a + $b];
        }
    }
}

class RangeGenerator {
    public static function range(int $start, int $end, int $step = 1): \Generator {
        for ($i = $start; $i <= $end; $i += $step) {
            yield $i;
        }
    }
}

// ============ Collection Class ============

class Collection implements \Iterator, \Countable {
    private array $items = [];
    private int $position = 0;
    
    public function __construct(array $items = []) {
        $this->items = array_values($items);
    }
    
    public function map(callable $callback): self {
        return new self(array_map($callback, $this->items));
    }
    
    public function filter(callable $callback): self {
        return new self(array_filter($this->items, $callback));
    }
    
    public function reduce(callable $callback, mixed $initial = null): mixed {
        return array_reduce($this->items, $callback, $initial);
    }
    
    public function each(callable $callback): self {
        foreach ($this->items as $item) {
            $callback($item);
        }
        return $this;
    }
    
    // Iterator implementation
    public function rewind(): void {
        $this->position = 0;
    }
    
    public function current(): mixed {
        return $this->items[$this->position];
    }
    
    public function key(): int {
        return $this->position;
    }
    
    public function next(): void {
        ++$this->position;
    }
    
    public function valid(): bool {
        return isset($this->items[$this->position]);
    }
    
    // Countable implementation
    public function count(): int {
        return count($this->items);
    }
    
    public function toArray(): array {
        return $this->items;
    }
}

// ============ Pipeline Pattern ============

class Pipeline {
    private array $stages = [];
    
    public function pipe(callable $stage): self {
        $this->stages[] = $stage;
        return $this;
    }
    
    public function process(mixed $input): mixed {
        return array_reduce(
            $this->stages,
            fn($carry, $stage) => $stage($carry),
            $input
        );
    }
}

// ============ Anonymous Class Example ============

function createLogger(string $prefix): object {
    return new class($prefix) {
        private string $prefix;
        
        public function __construct(string $prefix) {
            $this->prefix = $prefix;
        }
        
        public function log(string $message): void {
            echo "[{$this->prefix}] {$message}" . PHP_EOL;
        }
    };
}

// ============ Error Handling ============

class ValidationException extends \Exception {
    private array $errors;
    
    public function __construct(array $errors, string $message = "Validation failed", int $code = 0) {
        parent::__construct($message, $code);
        $this->errors = $errors;
    }
    
    public function getErrors(): array {
        return $this->errors;
    }
}

// ============ Main Execution ============

function main(): void {
    echo "🐘 PHP ADVANCED FEATURES SHOWCASE\n\n";
    
    // 1. Traits
    echo "=== Traits ===\n";
    $user = new User('u1', 'Alice', 'alice@example.com', 'admin');
    echo $user . PHP_EOL;
    
    // 2. Repository Pattern
    echo "\n=== Repository Pattern ===\n";
    $repository = new UserRepository();
    $repository->save($user);
    
    $found = $repository->find('u1');
    if ($found) {
        echo "Found user: {$found->getName()}\n";
    }
    
    // 3. Generators
    echo "\n=== Generators ===\n";
    echo "Fibonacci < 100: ";
    $fib = [];
    foreach (FibonacciGenerator::generate(100) as $num) {
        $fib[] = $num;
    }
    echo implode(', ', $fib) . PHP_EOL;
    
    echo "Range 1-10, step 2: ";
    $range = [];
    foreach (RangeGenerator::range(1, 10, 2) as $num) {
        $range[] = $num;
    }
    echo implode(', ', $range) . PHP_EOL;
    
    // 4. Collections
    echo "\n=== Collections ===\n";
    $collection = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    
    $result = $collection
        ->filter(fn($n) => $n % 2 === 0)
        ->map(fn($n) => $n * 2)
        ->reduce(fn($carry, $n) => $carry + $n, 0);
    
    echo "Sum of doubled evens: {$result}\n";
    
    // 5. Arrow Functions
    echo "\n=== Arrow Functions ===\n";
    $numbers = [1, 2, 3, 4, 5];
    $squared = array_map(fn($n) => $n ** 2, $numbers);
    echo "Squared: " . implode(', ', $squared) . PHP_EOL;
    
    // 6. Pipeline Pattern
    echo "\n=== Pipeline Pattern ===\n";
    $pipeline = new Pipeline();
    $result = $pipeline
        ->pipe(fn($x) => $x + 10)
        ->pipe(fn($x) => $x * 2)
        ->pipe(fn($x) => $x ** 2)
        ->process(5);
    
    echo "Pipeline result: {$result}\n"; // ((5+10)*2)^2 = 900
    
    // 7. Closures
    echo "\n=== Closures ===\n";
    $multiplier = 3;
    $multiply = function($n) use ($multiplier) {
        return $n * $multiplier;
    };
    echo "5 * 3 = " . $multiply(5) . PHP_EOL;
    
    // 8. Anonymous Classes
    echo "\n=== Anonymous Classes ===\n";
    $logger = createLogger('APP');
    $logger->log('Application started');
    
    // 9. Type Declarations
    echo "\n=== Type Declarations ===\n";
    $add = function(int $a, int $b): int {
        return $a + $b;
    };
    echo "10 + 20 = " . $add(10, 20) . PHP_EOL;
    
    // 10. Error Handling
    echo "\n=== Error Handling ===\n";
    try {
        $invalidUser = new User('u2', '', 'invalid-email', 'user');
        if (!$invalidUser->validate()) {
            throw new ValidationException(
                ['email' => 'Invalid email format', 'name' => 'Name cannot be empty'],
                'User validation failed'
            );
        }
    } catch (ValidationException $e) {
        echo "Validation error: {$e->getMessage()}\n";
        echo "Errors: " . json_encode($e->getErrors()) . PHP_EOL;
    } finally {
        echo "Validation complete\n";
    }
    
    // 11. Spread Operator
    echo "\n=== Spread Operator ===\n";
    $arr1 = [1, 2, 3];
    $arr2 = [4, 5, 6];
    $combined = [...$arr1, ...$arr2];
    echo "Combined: " . implode(', ', $combined) . PHP_EOL;
    
    // 12. Null Coalescing
    echo "\n=== Null Coalescing ===\n";
    $value = null;
    $result = $value ?? 'default value';
    echo "Result: {$result}\n";
    
    // 13. Match Expression (PHP 8+)
    echo "\n=== Match Expression ===\n";
    $status = 200;
    $message = match($status) {
        200 => 'Success',
        404 => 'Not Found',
        500 => 'Server Error',
        default => 'Unknown'
    };
    echo "Status {$status}: {$message}\n";
    
    // 14. Named Arguments
    echo "\n=== Named Arguments ===\n";
    $user3 = new User(
        id: 'u3',
        name: 'Bob',
        email: 'bob@example.com',
        role: 'moderator'
    );
    echo $user3 . PHP_EOL;
    
    echo "\n✅ All advanced PHP features demonstrated!\n";
}

// Run main function
main();
