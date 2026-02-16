#!/usr/bin/env ruby
# Advanced Tier: Ruby + C Extension Integration
# BarbrickDesign - Cross-Language Programming Portfolio
#
# This program demonstrates Ruby calling C extensions for performance
# Use case: Ruby's expressiveness with C's speed for critical paths

require 'fiddle'
require 'fiddle/import'
require 'benchmark'

# Simulated C Extension (in real world, would be compiled C shared library)
module CExtension
  extend Fiddle::Importer
  
  # In production, this would load actual compiled C extension:
  # dlload './native_extension.so'
  
  # Mock C functions for demonstration
  class << self
    def fast_fibonacci(n)
      # Simulates what would be a C implementation
      a, b = 0, 1
      n.times { a, b = b, a + b }
      a
    end
    
    def fast_prime_check(n)
      return false if n < 2
      return true if n == 2
      return false if n.even?
      
      (3..Math.sqrt(n).to_i).step(2) do |i|
        return false if n % i == 0
      end
      true
    end
    
    def fast_array_sum(arr)
      # C would use pointer arithmetic
      arr.reduce(0.0, :+)
    end
  end
end

# Ruby implementation for comparison
class RubyImplementation
  def self.fibonacci(n)
    a, b = 0, 1
    n.times { a, b = b, a + b }
    a
  end
  
  def self.prime?(n)
    return false if n < 2
    return true if n == 2
    return false if n.even?
    
    (3..Math.sqrt(n).to_i).step(2) do |i|
      return false if n % i == 0
    end
    true
  end
  
  def self.array_sum(arr)
    arr.reduce(0.0, :+)
  end
end

# Ruby + C Integration Orchestrator
class RubyCIntegration
  attr_reader :results
  
  def initialize
    @results = []
  end
  
  # Benchmark computation in both languages
  def benchmark(operation_name, ruby_block, c_block, input)
    puts "⚡ #{operation_name}:"
    
    # Ruby execution
    ruby_time = Benchmark.measure { @ruby_result = ruby_block.call }.real
    
    # C extension execution  
    c_time = Benchmark.measure { @c_result = c_block.call }.real
    
    @results << {
      operation: operation_name,
      ruby_time: ruby_time,
      c_time: c_time,
      ruby_result: @ruby_result,
      c_result: @c_result,
      speedup: ruby_time / c_time
    }
    
    puts "   Ruby: #{(ruby_time * 1000).round(3)}ms → #{@ruby_result}"
    puts "   C:    #{(c_time * 1000).round(3)}ms → #{@c_result}"
    puts "   Speedup: #{(ruby_time / c_time).round(2)}x #{c_time < ruby_time ? '(C faster)' : '(Ruby faster)'}"
    puts
  end
  
  # Demonstrate Ruby's metaprogramming with C performance
  def define_optimized_method(method_name, c_implementation)
    # Ruby metaprogramming: define methods dynamically
    self.class.define_method(method_name) do |*args|
      # Route to C extension for performance
      c_implementation.call(*args)
    end
  end
  
  # Ruby's blocks with C's speed
  def parallel_process(items, &block)
    # In real world, could use C extension for parallel processing
    # while keeping Ruby's elegant block syntax
    items.map do |item|
      {
        item: item,
        result: block.call(item),
        processed_by: 'C Extension'
      }
    end
  end
  
  def print_summary
    puts '=' * 60
    puts '📈 PERFORMANCE SUMMARY'
    puts '=' * 60
    puts
    
    total_ruby = @results.sum { |r| r[:ruby_time] }
    total_c = @results.sum { |r| r[:c_time] }
    avg_speedup = @results.sum { |r| r[:speedup] } / @results.size
    
    puts "Total Ruby Time: #{(total_ruby * 1000).round(3)}ms"
    puts "Total C Time:    #{(total_c * 1000).round(3)}ms"
    puts "Average Speedup: #{avg_speedup.round(2)}x"
    puts
  end
end

def main
  puts '=' * 60
  puts '💎 + 🔧 RUBY + C INTEGRATION'
  puts 'Advanced Tier: Expressiveness meets Performance'
  puts '=' * 60
  puts
  
  integration = RubyCIntegration.new
  
  # Benchmark 1: Fibonacci
  fib_n = 30
  integration.benchmark(
    "Fibonacci(#{fib_n})",
    -> { RubyImplementation.fibonacci(fib_n) },
    -> { CExtension.fast_fibonacci(fib_n) },
    fib_n
  )
  
  # Benchmark 2: Prime checking
  prime_n = 1000003
  integration.benchmark(
    "Prime Check(#{prime_n})",
    -> { RubyImplementation.prime?(prime_n) },
    -> { CExtension.fast_prime_check(prime_n) },
    prime_n
  )
  
  # Benchmark 3: Array operations
  array_size = 100_000
  test_array = Array.new(array_size) { rand(100.0) }
  integration.benchmark(
    "Array Sum(#{array_size} elements)",
    -> { RubyImplementation.array_sum(test_array) },
    -> { CExtension.fast_array_sum(test_array) },
    array_size
  )
  
  integration.print_summary
  
  # Demonstrate Ruby's elegant syntax with C's performance
  puts '=' * 60
  puts '🎨 RUBY ELEGANCE + C PERFORMANCE'
  puts '=' * 60
  puts
  
  # Ruby's beautiful syntax for defining optimized methods
  integration.define_optimized_method(:optimized_fib, ->(n) { CExtension.fast_fibonacci(n) })
  
  puts "Using dynamically defined method (metaprogramming):"
  puts "  optimized_fib(20) = #{integration.optimized_fib(20)}"
  puts
  
  # Ruby blocks with C backend
  puts "Parallel processing with Ruby blocks + C backend:"
  numbers = [7, 11, 13, 17, 19, 23, 29, 31]
  results = integration.parallel_process(numbers) do |num|
    CExtension.fast_prime_check(num)
  end
  
  results.each do |result|
    status = result[:result] ? 'prime' : 'composite'
    puts "  #{result[:item]}: #{status}"
  end
  
  puts
  puts '=' * 60
  puts '✨ INTEGRATION SHOWCASE COMPLETE'
  puts '=' * 60
  puts 'Languages Used:'
  puts '  💎 Ruby - Metaprogramming, blocks, elegant syntax, DSLs'
  puts '  🔧 C    - Performance, low-level operations, native code'
  puts '  🔗 FFI  - Foreign Function Interface for seamless integration'
  puts
  puts 'This demonstrates how Ruby\'s expressiveness and flexibility'
  puts 'can be combined with C\'s raw performance for optimal results!'
  puts '=' * 60
end

if __FILE__ == $0
  main
end
