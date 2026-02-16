/**
 * Go Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 *
 * Features demonstrated:
 * - Goroutines & Concurrency
 * - Channels & Select
 * - Interfaces & Embedding
 * - Defer, Panic, Recover
 * - Context & Cancellation
 * - Generics (Go 1.18+)
 * - Error Handling Patterns
 * - Struct Tags & Reflection
 */

package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"sync"
	"time"
)

// ============ Interfaces ============

type Processor interface {
	Process(data interface{}) (interface{}, error)
	Validate() bool
}

type Logger interface {
	Info(msg string)
	Error(msg string, err error)
}

// ============ Error Types ============

var (
	ErrNotFound      = errors.New("not found")
	ErrInvalidInput  = errors.New("invalid input")
	ErrTimeout       = errors.New("operation timeout")
)

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}

// ============ Generic Functions (Go 1.18+) ============

func Map[T any, U any](slice []T, fn func(T) U) []U {
	result := make([]U, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}
	return result
}

func Filter[T any](slice []T, fn func(T) bool) []T {
	result := make([]T, 0)
	for _, v := range slice {
		if fn(v) {
			result = append(result, v)
		}
	}
	return result
}

func Reduce[T any, U any](slice []T, initial U, fn func(U, T) U) U {
	result := initial
	for _, v := range slice {
		result = fn(result, v)
	}
	return result
}

// ============ Generic Types ============

type Cache[K comparable, V any] struct {
	mu    sync.RWMutex
	items map[K]V
}

func NewCache[K comparable, V any]() *Cache[K, V] {
	return &Cache[K, V]{
		items: make(map[K]V),
	}
}

func (c *Cache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = value
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	val, exists := c.items[key]
	return val, exists
}

// ============ Structs with Tags ============

type User struct {
	ID        string    `json:"id" validate:"required"`
	Name      string    `json:"name" validate:"required,min=2"`
	Email     string    `json:"email" validate:"required,email"`
	Age       int       `json:"age" validate:"min=0,max=150"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) Validate() error {
	if u.Name == "" {
		return &ValidationError{Field: "Name", Message: "cannot be empty"}
	}
	if u.Age < 0 || u.Age > 150 {
		return &ValidationError{Field: "Age", Message: "must be between 0 and 150"}
	}
	return nil
}

// ============ Interface Implementation ============

type UserProcessor struct {
	logger Logger
}

func (p *UserProcessor) Process(data interface{}) (interface{}, error) {
	user, ok := data.(*User)
	if !ok {
		return nil, ErrInvalidInput
	}
	
	if err := user.Validate(); err != nil {
		return nil, err
	}
	
	p.logger.Info(fmt.Sprintf("Processing user: %s", user.Name))
	return user, nil
}

func (p *UserProcessor) Validate() bool {
	return p.logger != nil
}

// ============ Logger Implementation ============

type ConsoleLogger struct{}

func (l *ConsoleLogger) Info(msg string) {
	fmt.Printf("ℹ️  %s\n", msg)
}

func (l *ConsoleLogger) Error(msg string, err error) {
	fmt.Printf("❌ %s: %v\n", msg, err)
}

// ============ Concurrency Patterns ============

// Worker Pool Pattern
func workerPool(ctx context.Context, jobs <-chan int, results chan<- int, workerCount int) {
	var wg sync.WaitGroup
	
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-jobs:
					if !ok {
						return
					}
					// Simulate work
					time.Sleep(50 * time.Millisecond)
					results <- job * 2
				}
			}
		}(i)
	}
	
	wg.Wait()
	close(results)
}

// Fan-out, Fan-in Pattern
func fanOut(input <-chan int, workers int) []<-chan int {
	channels := make([]<-chan int, workers)
	for i := 0; i < workers; i++ {
		channels[i] = worker(input)
	}
	return channels
}

func worker(input <-chan int) <-chan int {
	output := make(chan int)
	go func() {
		defer close(output)
		for val := range input {
			output <- val * 2
		}
	}()
	return output
}

func fanIn(channels ...<-chan int) <-chan int {
	output := make(chan int)
	var wg sync.WaitGroup
	
	for _, ch := range channels {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for val := range c {
				output <- val
			}
		}(ch)
	}
	
	go func() {
		wg.Wait()
		close(output)
	}()
	
	return output
}

// ============ Pipeline Pattern ============

type Pipeline struct {
	stages []func(interface{}) (interface{}, error)
}

func NewPipeline() *Pipeline {
	return &Pipeline{stages: make([]func(interface{}) (interface{}, error), 0)}
}

func (p *Pipeline) Add(stage func(interface{}) (interface{}, error)) *Pipeline {
	p.stages = append(p.stages, stage)
	return p
}

func (p *Pipeline) Execute(input interface{}) (interface{}, error) {
	result := input
	for _, stage := range p.stages {
		var err error
		result, err = stage(result)
		if err != nil {
			return nil, err
		}
	}
	return result, nil
}

// ============ Context & Cancellation ============

func withTimeout(ctx context.Context, duration time.Duration) {
	ctx, cancel := context.WithTimeout(ctx, duration)
	defer cancel()
	
	done := make(chan bool)
	
	go func() {
		time.Sleep(200 * time.Millisecond)
		done <- true
	}()
	
	select {
	case <-ctx.Done():
		fmt.Println("⏱️  Context timeout:", ctx.Err())
	case <-done:
		fmt.Println("✓ Operation completed in time")
	}
}

// ============ Defer, Panic, Recover ============

func safeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered: %v", r)
		}
	}()
	
	if b == 0 {
		panic("division by zero")
	}
	
	result = a / b
	return
}

// ============ Reflection ============

func inspectStruct(obj interface{}) {
	val := reflect.ValueOf(obj)
	typ := reflect.TypeOf(obj)
	
	fmt.Printf("\nType: %s\n", typ.Name())
	
	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		value := val.Field(i)
		tag := field.Tag.Get("json")
		fmt.Printf("  %s (json: %s): %v\n", field.Name, tag, value.Interface())
	}
}

// ============ Channels & Select ============

func multiplexer() {
	ch1 := make(chan string)
	ch2 := make(chan string)
	done := make(chan bool)
	
	go func() {
		time.Sleep(100 * time.Millisecond)
		ch1 <- "Message from channel 1"
	}()
	
	go func() {
		time.Sleep(150 * time.Millisecond)
		ch2 <- "Message from channel 2"
	}()
	
	go func() {
		time.Sleep(300 * time.Millisecond)
		done <- true
	}()
	
	for {
		select {
		case msg1 := <-ch1:
			fmt.Println("CH1:", msg1)
		case msg2 := <-ch2:
			fmt.Println("CH2:", msg2)
		case <-done:
			fmt.Println("Done!")
			return
		case <-time.After(500 * time.Millisecond):
			fmt.Println("Timeout!")
			return
		}
	}
}

// ============ Main Function ============

func main() {
	fmt.Println("🚀 GO ADVANCED FEATURES SHOWCASE\n")
	
	logger := &ConsoleLogger{}
	
	// 1. Generics
	logger.Info("=== Generics ===")
	numbers := []int{1, 2, 3, 4, 5}
	squared := Map(numbers, func(n int) int { return n * n })
	fmt.Printf("Squared: %v\n", squared)
	
	evens := Filter(numbers, func(n int) bool { return n%2 == 0 })
	fmt.Printf("Evens: %v\n", evens)
	
	sum := Reduce(numbers, 0, func(acc, n int) int { return acc + n })
	fmt.Printf("Sum: %d\n", sum)
	
	// 2. Generic Cache
	logger.Info("\n=== Generic Cache ===")
	cache := NewCache[string, *User]()
	user := &User{
		ID:        "u1",
		Name:      "Alice",
		Email:     "alice@example.com",
		Age:       28,
		CreatedAt: time.Now(),
	}
	cache.Set("u1", user)
	
	if cached, exists := cache.Get("u1"); exists {
		fmt.Printf("Cached user: %s\n", cached.Name)
	}
	
	// 3. Interface Implementation
	logger.Info("\n=== Interface Implementation ===")
	processor := &UserProcessor{logger: logger}
	processed, err := processor.Process(user)
	if err != nil {
		logger.Error("Processing failed", err)
	} else {
		fmt.Printf("Processed: %v\n", processed.(*User).Name)
	}
	
	// 4. Struct Tags & JSON
	logger.Info("\n=== Struct Tags & JSON ===")
	jsonData, _ := json.MarshalIndent(user, "", "  ")
	fmt.Printf("JSON:\n%s\n", jsonData)
	
	// 5. Reflection
	logger.Info("\n=== Reflection ===")
	inspectStruct(*user)
	
	// 6. Defer, Panic, Recover
	logger.Info("\n=== Defer, Panic, Recover ===")
	result, err := safeDivide(10, 2)
	fmt.Printf("10 / 2 = %d\n", result)
	
	result, err = safeDivide(10, 0)
	if err != nil {
		logger.Error("Division failed", err)
	}
	
	// 7. Goroutines & Worker Pool
	logger.Info("\n=== Worker Pool Pattern ===")
	ctx := context.Background()
	jobs := make(chan int, 10)
	results := make(chan int, 10)
	
	go workerPool(ctx, jobs, results, 3)
	
	for i := 1; i <= 5; i++ {
		jobs <- i
	}
	close(jobs)
	
	for result := range results {
		fmt.Printf("Result: %d\n", result)
	}
	
	// 8. Context & Timeout
	logger.Info("\n=== Context & Timeout ===")
	withTimeout(context.Background(), 100*time.Millisecond)
	withTimeout(context.Background(), 300*time.Millisecond)
	
	// 9. Channels & Select
	logger.Info("\n=== Multiplexer (Select) ===")
	multiplexer()
	
	// 10. Pipeline Pattern
	logger.Info("\n=== Pipeline Pattern ===")
	pipeline := NewPipeline().
		Add(func(data interface{}) (interface{}, error) {
			n := data.(int)
			return n + 10, nil
		}).
		Add(func(data interface{}) (interface{}, error) {
			n := data.(int)
			return n * 2, nil
		}).
		Add(func(data interface{}) (interface{}, error) {
			n := data.(int)
			return n * n, nil
		})
	
	pipeResult, _ := pipeline.Execute(5)
	fmt.Printf("Pipeline result: %v\n", pipeResult) // ((5+10)*2)^2 = 900
	
	// 11. Fan-out, Fan-in
	logger.Info("\n=== Fan-out, Fan-in Pattern ===")
	input := make(chan int)
	go func() {
		for i := 1; i <= 5; i++ {
			input <- i
		}
		close(input)
	}()
	
	workers := fanOut(input, 3)
	output := fanIn(workers...)
	
	for val := range output {
		fmt.Printf("Fan result: %d\n", val)
	}
	
	logger.Info("\n✅ All advanced Go features demonstrated!")
}
