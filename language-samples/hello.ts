/**
 * TypeScript Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 * 
 * Features demonstrated:
 * - Advanced Types & Generics
 * - Conditional Types & Mapped Types
 * - Utility Types
 * - Decorators
 * - Type Guards & Narrowing
 * - Template Literal Types
 * - Discriminated Unions
 * - Abstract Classes & Interfaces
 */

// ============ Advanced Type System ============

// Conditional Types
type IsString<T> = T extends string ? "yes" : "no";
type ExtractPromise<T> = T extends Promise<infer U> ? U : T;

// Mapped Types
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

type Optional<T> = {
    [P in keyof T]?: T[P];
};

// Template Literal Types
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = `/api/${string}`;
type APIRoute<T extends HTTPMethod> = `${T} ${Endpoint}`;

// Discriminated Unions
type Success<T> = {
    kind: "success";
    value: T;
    timestamp: number;
};

type Failure = {
    kind: "failure";
    error: string;
    code: number;
};

type Result<T> = Success<T> | Failure;

// ============ Advanced Interfaces ============

interface IRepository<T> {
    find(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<void>;
    delete(id: string): Promise<boolean>;
}

interface ILogger {
    info(message: string, ...args: unknown[]): void;
    error(message: string, error: Error): void;
    warn(message: string): void;
}

// ============ Abstract Classes ============

abstract class BaseEntity {
    constructor(public readonly id: string, public createdAt: Date = new Date()) {}
    
    abstract validate(): boolean;
    
    toJSON(): object {
        return {
            id: this.id,
            createdAt: this.createdAt.toISOString(),
        };
    }
}

// ============ Decorators ============

function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with args:`, args);
        const result = originalMethod.apply(this, args);
        console.log(`${propertyKey} returned:`, result);
        return result;
    };
    
    return descriptor;
}

function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, any>();
    
    descriptor.value = function (...args: any[]) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = originalMethod.apply(this, args);
        cache.set(key, result);
        return result;
    };
    
    return descriptor;
}

// ============ Generic Constraints ============

interface HasId {
    id: string;
}

interface HasName {
    name: string;
}

class DataStore<T extends HasId> {
    private items: Map<string, T> = new Map();
    
    add(item: T): void {
        this.items.set(item.id, item);
    }
    
    get(id: string): T | undefined {
        return this.items.get(id);
    }
    
    getAll(): T[] {
        return Array.from(this.items.values());
    }
    
    update<K extends keyof T>(id: string, key: K, value: T[K]): boolean {
        const item = this.items.get(id);
        if (item) {
            item[key] = value;
            return true;
        }
        return false;
    }
}

// ============ Type Guards ============

function isSuccess<T>(result: Result<T>): result is Success<T> {
    return result.kind === "success";
}

function isFailure<T>(result: Result<T>): result is Failure {
    return result.kind === "failure";
}

function assertNever(x: never): never {
    throw new Error("Unexpected value: " + x);
}

// ============ Utility Types Usage ============

interface User extends HasId, HasName {
    email: string;
    age: number;
    roles: string[];
}

type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserWithoutId = Omit<User, "id">;
type UserIdAndName = Pick<User, "id" | "name">;
type UserRecord = Record<string, User>;

// ============ Advanced Class with Generics ============

class AsyncQueue<T> {
    private queue: T[] = [];
    private processing = false;
    
    enqueue(item: T): void {
        this.queue.push(item);
    }
    
    async dequeue(): Promise<T | undefined> {
        while (this.processing) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.processing = true;
        const item = this.queue.shift();
        this.processing = false;
        return item;
    }
    
    get size(): number {
        return this.queue.length;
    }
}

// ============ Advanced Function Types ============

type Middleware<T> = (input: T) => T | Promise<T>;

class Pipeline<T> {
    private middlewares: Middleware<T>[] = [];
    
    use(middleware: Middleware<T>): this {
        this.middlewares.push(middleware);
        return this;
    }
    
    async execute(input: T): Promise<T> {
        let result = input;
        for (const middleware of this.middlewares) {
            result = await middleware(result);
        }
        return result;
    }
}

// ============ Real-World Example: Service Layer ============

class UserService implements IRepository<User> {
    private store = new DataStore<User>();
    
    @log
    async find(id: string): Promise<User | null> {
        return this.store.get(id) || null;
    }
    
    async findAll(): Promise<User[]> {
        return this.store.getAll();
    }
    
    async save(entity: User): Promise<void> {
        this.store.add(entity);
    }
    
    async delete(id: string): Promise<boolean> {
        return true; // Simplified
    }
    
    @memoize
    calculateStatistics(users: User[]): { averageAge: number; totalUsers: number } {
        const totalAge = users.reduce((sum, user) => sum + user.age, 0);
        return {
            averageAge: users.length > 0 ? totalAge / users.length : 0,
            totalUsers: users.length,
        };
    }
}

// ============ Logger Implementation ============

class ConsoleLogger implements ILogger {
    info(message: string, ...args: unknown[]): void {
        console.log(`ℹ️ ${message}`, ...args);
    }
    
    error(message: string, error: Error): void {
        console.error(`❌ ${message}`, error.message);
    }
    
    warn(message: string): void {
        console.warn(`⚠️ ${message}`);
    }
}

// ============ Main Function ============

async function main(): Promise<void> {
    console.log('📘 TYPESCRIPT ADVANCED FEATURES SHOWCASE\n');
    
    const logger = new ConsoleLogger();
    
    // 1. Generic Data Store
    logger.info('=== Generic Data Store ===');
    const userService = new UserService();
    
    const user1: User = {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        age: 28,
        roles: ["admin", "user"],
    };
    
    await userService.save(user1);
    const found = await userService.find("1");
    logger.info('Found user:', found?.name);
    
    // 2. Discriminated Unions
    logger.info('\n=== Discriminated Unions ===');
    
    const processResult = <T>(result: Result<T>): void => {
        if (isSuccess(result)) {
            logger.info('Success:', result.value);
        } else if (isFailure(result)) {
            logger.error('Failure:', new Error(`Code ${result.code}: ${result.error}`));
        } else {
            assertNever(result);
        }
    };
    
    const successResult: Result<string> = {
        kind: "success",
        value: "Operation completed",
        timestamp: Date.now(),
    };
    
    const failureResult: Result<string> = {
        kind: "failure",
        error: "Network error",
        code: 500,
    };
    
    processResult(successResult);
    processResult(failureResult);
    
    // 3. Async Queue
    logger.info('\n=== Async Queue ===');
    const queue = new AsyncQueue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    
    const item = await queue.dequeue();
    logger.info('Dequeued:', item, 'Remaining:', queue.size);
    
    // 4. Pipeline Pattern
    logger.info('\n=== Pipeline Pattern ===');
    const pipeline = new Pipeline<number>()
        .use(x => x + 10)
        .use(x => x * 2)
        .use(async x => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return x ** 2;
        });
    
    const pipelineResult = await pipeline.execute(5);
    logger.info('Pipeline result:', pipelineResult); // ((5+10)*2)^2 = 900
    
    // 5. Utility Types
    logger.info('\n=== Utility Types ===');
    const partialUser: PartialUser = { name: "Bob" };
    logger.info('Partial user:', partialUser);
    
    const userIdName: UserIdAndName = { id: "2", name: "Charlie" };
    logger.info('Picked properties:', userIdName);
    
    // 6. Type Guards
    logger.info('\n=== Type Guards ===');
    const testValue: string | number = "Hello";
    
    if (typeof testValue === "string") {
        logger.info('String value length:', testValue.length);
    }
    
    // 7. Conditional Types
    logger.info('\n=== Conditional Types ===');
    type TestString = IsString<string>; // "yes"
    type TestNumber = IsString<number>; // "no"
    logger.info('IsString<string>:', "yes" as TestString);
    logger.info('IsString<number>:', "no" as TestNumber);
    
    // 8. Template Literal Types
    logger.info('\n=== Template Literal Types ===');
    const route1: APIRoute<"GET"> = "GET /api/users";
    const route2: APIRoute<"POST"> = "POST /api/users";
    logger.info('API Routes:', route1, route2);
    
    // 9. Advanced Generics with Constraints
    logger.info('\n=== Advanced Generics ===');
    
    interface Product extends HasId, HasName {
        price: number;
    }
    
    const productStore = new DataStore<Product>();
    productStore.add({ id: "p1", name: "Laptop", price: 1200 });
    productStore.update("p1", "price", 1100);
    
    const product = productStore.get("p1");
    logger.info('Product:', product);
    
    // 10. Memoization
    logger.info('\n=== Memoization (via decorator) ===');
    const users = [user1, { ...user1, id: "2", age: 35 }];
    const stats1 = userService.calculateStatistics(users);
    const stats2 = userService.calculateStatistics(users); // Cached
    logger.info('Statistics:', stats1);
    
    logger.info('\n✅ All advanced TypeScript features demonstrated!');
}

// Execute main function
main().catch(console.error);

export { 
    main, 
    UserService, 
    DataStore, 
    AsyncQueue, 
    Pipeline, 
    Result, 
    isSuccess, 
    isFailure 
};
