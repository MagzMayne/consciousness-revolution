/**
 * Advanced Tier: Go + C Integration (CGO)
 * BarbrickDesign - Cross-Language Programming Portfolio
 * 
 * This program demonstrates Go calling C code via CGO
 * Use case: Leveraging existing C libraries with Go's concurrency
 */

package main

/*
#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <string.h>

// C function: Fast prime number checking
int is_prime_c(long long n) {
    if (n < 2) return 0;
    if (n == 2) return 1;
    if (n % 2 == 0) return 0;
    
    long long sqrt_n = (long long)sqrt((double)n);
    for (long long i = 3; i <= sqrt_n; i += 2) {
        if (n % i == 0) return 0;
    }
    return 1;
}

// C function: String manipulation (low-level)
void reverse_string_c(char* str) {
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++) {
        char temp = str[i];
        str[i] = str[len - 1 - i];
        str[len - 1 - i] = temp;
    }
}

// C function: Array sum (SIMD-style optimization possible)
double array_sum_c(double* arr, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return sum;
}

// C function: Memory-intensive operation
typedef struct {
    long long value;
    double coefficient;
} DataPoint;

double process_data_c(DataPoint* points, int count) {
    double result = 0.0;
    for (int i = 0; i < count; i++) {
        result += points[i].value * points[i].coefficient;
    }
    return result;
}
*/
import "C"

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
	"unsafe"
)

// Go wrapper for C prime checking
func isPrimeC(n int64) bool {
	return C.is_prime_c(C.longlong(n)) == 1
}

// Go native implementation for comparison
func isPrimeGo(n int64) bool {
	if n < 2 {
		return false
	}
	if n == 2 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	for i := int64(3); i*i <= n; i += 2 {
		if n%i == 0 {
			return false
		}
	}
	return true
}

// Go wrapper for C string reversal
func reverseStringC(s string) string {
	cstr := C.CString(s)
	defer C.free(unsafe.Pointer(cstr))

	C.reverse_string_c(cstr)
	return C.GoString(cstr)
}

// Go wrapper for C array sum
func arraySumC(arr []float64) float64 {
	if len(arr) == 0 {
		return 0
	}
	return float64(C.array_sum_c((*C.double)(unsafe.Pointer(&arr[0])), C.int(len(arr))))
}

// Benchmark result structure
type BenchmarkResult struct {
	Operation  string
	Language   string
	Duration   time.Duration
	Result     interface{}
	Iterations int
}

// Run parallel prime checking (Go concurrency + C computation)
func parallelPrimeCheck(numbers []int64) []bool {
	results := make([]bool, len(numbers))
	var wg sync.WaitGroup

	// Use Go's goroutines with C's computation
	for i, num := range numbers {
		wg.Add(1)
		go func(idx int, n int64) {
			defer wg.Done()
			results[idx] = isPrimeC(n) // C function called from goroutine
		}(i, num)
	}

	wg.Wait()
	return results
}

// Benchmark prime checking
func benchmarkPrimeCheck(n int64, iterations int) (BenchmarkResult, BenchmarkResult) {
	// C version
	startC := time.Now()
	var resultC bool
	for i := 0; i < iterations; i++ {
		resultC = isPrimeC(n)
	}
	durationC := time.Since(startC)

	// Go version
	startGo := time.Now()
	var resultGo bool
	for i := 0; i < iterations; i++ {
		resultGo = isPrimeGo(n)
	}
	durationGo := time.Since(startGo)

	return BenchmarkResult{
			Operation:  fmt.Sprintf("Prime Check(%d)", n),
			Language:   "C (via CGO)",
			Duration:   durationC,
			Result:     resultC,
			Iterations: iterations,
		}, BenchmarkResult{
			Operation:  fmt.Sprintf("Prime Check(%d)", n),
			Language:   "Go (native)",
			Duration:   durationGo,
			Result:     resultGo,
			Iterations: iterations,
		}
}

// Benchmark array operations
func benchmarkArraySum(size int) (BenchmarkResult, BenchmarkResult) {
	// Generate random array
	arr := make([]float64, size)
	for i := range arr {
		arr[i] = rand.Float64() * 100
	}

	// C version
	startC := time.Now()
	resultC := arraySumC(arr)
	durationC := time.Since(startC)

	// Go version
	startGo := time.Now()
	var resultGo float64
	for _, val := range arr {
		resultGo += val
	}
	durationGo := time.Since(startGo)

	return BenchmarkResult{
			Operation:  fmt.Sprintf("Array Sum(%d elements)", size),
			Language:   "C (via CGO)",
			Duration:   durationC,
			Result:     resultC,
			Iterations: 1,
		}, BenchmarkResult{
			Operation:  fmt.Sprintf("Array Sum(%d elements)", size),
			Language:   "Go (native)",
			Duration:   durationGo,
			Result:     resultGo,
			Iterations: 1,
		}
}

func printBenchmark(c, go_ BenchmarkResult) {
	fmt.Printf("⚡ %s:\n", c.Operation)
	fmt.Printf("   C:  %v → %v\n", c.Duration, c.Result)
	fmt.Printf("   Go: %v → %v\n", go_.Duration, go_.Result)

	if c.Duration < go_.Duration {
		speedup := float64(go_.Duration) / float64(c.Duration)
		fmt.Printf("   Speedup: %.2fx (C faster)\n\n", speedup)
	} else {
		speedup := float64(c.Duration) / float64(go_.Duration)
		fmt.Printf("   Speedup: %.2fx (Go faster)\n\n", speedup)
	}
}

func main() {
	fmt.Println("=" + string(make([]byte, 59)))
	fmt.Println("🐹 + 🔧 GO + C INTEGRATION (CGO)")
	fmt.Println("Advanced Tier: Go Concurrency with C Performance")
	fmt.Println("=" + string(make([]byte, 59)))
	fmt.Println()

	// Seed random
	rand.Seed(time.Now().UnixNano())

	// Benchmark 1: Prime checking
	fmt.Println("📊 Running Benchmarks\n")
	fmt.Println("=" + string(make([]byte, 59)) + "\n")

	primeNum := int64(1000000007)
	iterations := 1000
	cResult, goResult := benchmarkPrimeCheck(primeNum, iterations)
	printBenchmark(cResult, goResult)

	// Benchmark 2: Array operations
	arraySize := 1000000
	cArrayResult, goArrayResult := benchmarkArraySum(arraySize)
	printBenchmark(cArrayResult, goArrayResult)

	// Benchmark 3: String reversal
	testString := "The quick brown fox jumps over the lazy dog"
	fmt.Printf("⚡ String Reversal:\n")
	fmt.Printf("   Original: %s\n", testString)

	startC := time.Now()
	reversedC := reverseStringC(testString)
	durationC := time.Since(startC)

	fmt.Printf("   C:  %v → %s\n", durationC, reversedC)
	fmt.Println()

	// Demonstrate Go concurrency with C computation
	fmt.Println("=" + string(make([]byte, 59)))
	fmt.Println("🚀 CONCURRENT PRIME CHECKING (Go Goroutines + C Computation)")
	fmt.Println("=" + string(make([]byte, 59)) + "\n")

	numbersToCheck := []int64{
		1000000007, 1000000009, 1000000021, 1000000033,
		999999937, 999999929, 999999893, 999999883,
	}

	start := time.Now()
	results := parallelPrimeCheck(numbersToCheck)
	duration := time.Since(start)

	fmt.Printf("Checked %d numbers in parallel: %v\n", len(numbersToCheck), duration)
	for i, num := range numbersToCheck {
		isPrime := "prime"
		if !results[i] {
			isPrime = "composite"
		}
		fmt.Printf("  %d: %s\n", num, isPrime)
	}

	fmt.Println()
	fmt.Println("=" + string(make([]byte, 59)))
	fmt.Println("✨ INTEGRATION SHOWCASE COMPLETE")
	fmt.Println("=" + string(make([]byte, 59)))
	fmt.Println("Languages Used:")
	fmt.Println("  🐹 Go - Concurrency (goroutines), memory management, high-level")
	fmt.Println("  🔧 C  - Low-level computation, performance, existing libraries")
	fmt.Println("  🔗 CGO - Bridge between Go and C, foreign function interface")
	fmt.Println()
	fmt.Println("This demonstrates how Go can leverage C's performance and")
	fmt.Println("existing libraries while using Go's superior concurrency model!")
	fmt.Println("=" + string(make([]byte, 59)))
}
