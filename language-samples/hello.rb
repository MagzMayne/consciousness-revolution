# Ruby Advanced Sample - Demonstrating Most Powerful Features
# BarbrickDesign - Complete Language Portfolio
#
# Features demonstrated:
# - Blocks, Procs, and Lambdas
# - Metaprogramming (define_method, method_missing, class_eval)
# - Modules and Mixins
# - Symbols and Method Chaining
# - Enumerables and Lazy Evaluation
# - Refinements
# - Singleton Methods
# - DSL (Domain Specific Language) Patterns

# ============ Modules and Mixins ============

module Loggable
  def log(message)
    puts "[#{Time.now}] #{self.class}: #{message}"
  end
end

module Cacheable
  def cache_key
    "#{self.class}:#{object_id}"
  end
  
  def cached_result(&block)
    @cache ||= {}
    key = cache_key
    @cache[key] ||= block.call
  end
end

# ============ Metaprogramming ============

class DynamicModel
  attr_accessor :attributes
  
  def initialize(attributes = {})
    @attributes = attributes
    
    # Dynamically create getter and setter methods
    attributes.each do |key, value|
      self.class.send(:define_method, key) { @attributes[key] }
      self.class.send(:define_method, "#{key}=") { |val| @attributes[key] = val }
    end
  end
  
  # Method missing for dynamic attribute access
  def method_missing(method_name, *args)
    method_str = method_name.to_s
    
    if method_str.end_with?('=')
      attr_name = method_str.chop.to_sym
      @attributes[attr_name] = args.first
    elsif @attributes.key?(method_name)
      @attributes[method_name]
    else
      super
    end
  end
  
  def respond_to_missing?(method_name, include_private = false)
    @attributes.key?(method_name) || super
  end
end

# ============ Blocks, Procs, and Lambdas ============

class Pipeline
  def initialize
    @operations = []
  end
  
  def add(&operation)
    @operations << operation
    self
  end
  
  def execute(input)
    @operations.reduce(input) { |acc, op| op.call(acc) }
  end
end

# Proc vs Lambda demonstration
def proc_vs_lambda_demo
  # Proc doesn't check argument count
  my_proc = Proc.new { |x, y| (x || 0) + (y || 0) }
  
  # Lambda checks argument count strictly
  my_lambda = ->(x, y) { x + y }
  
  puts "Proc with missing arg: #{my_proc.call(5)}"
  
  begin
    puts "Lambda with missing arg: #{my_lambda.call(5)}"
  rescue ArgumentError => e
    puts "Lambda error: #{e.message}"
  end
end

# ============ Enumerables and Functional Programming ============

module FunctionalHelpers
  def self.compose(*functions)
    ->(x) { functions.reverse.reduce(x) { |acc, f| f.call(acc) } }
  end
  
  def self.curry(fn, arity = nil)
    arity ||= fn.arity
    lambda do |*args|
      if args.length >= arity
        fn.call(*args)
      else
        curry(lambda { |*more_args| fn.call(*args, *more_args) }, arity - args.length)
      end
    end
  end
end

# ============ Advanced Class with All Features ============

class User
  include Loggable
  include Cacheable
  
  attr_accessor :id, :name, :email, :role
  
  # Class variables and methods
  @@all_users = []
  
  def initialize(id:, name:, email:, role: 'user')
    @id = id
    @name = name
    @email = email
    @role = role
    @@all_users << self
    log("User created: #{name}")
  end
  
  # Class method
  def self.all
    @@all_users
  end
  
  def self.find_by(attribute, value)
    all.find { |user| user.send(attribute) == value }
  end
  
  # Method with block
  def with_role(role)
    yield if @role == role
  end
  
  # Singleton method (added to specific instance)
  def add_admin_privileges
    def self.admin?
      true
    end
    @role = 'admin'
  end
  
  def to_s
    "User(#{id}): #{name} <#{email}> [#{role}]"
  end
end

# ============ DSL Example ============

class QueryBuilder
  def initialize(table)
    @table = table
    @conditions = []
    @order = nil
    @limit = nil
  end
  
  def where(condition)
    @conditions << condition
    self
  end
  
  def order(column)
    @order = column
    self
  end
  
  def limit(n)
    @limit = n
    self
  end
  
  def to_sql
    sql = "SELECT * FROM #{@table}"
    sql += " WHERE #{@conditions.join(' AND ')}" unless @conditions.empty?
    sql += " ORDER BY #{@order}" if @order
    sql += " LIMIT #{@limit}" if @limit
    sql
  end
end

# ============ Lazy Evaluation ============

class LazyRange
  def self.fibonacci
    Enumerator.new do |yielder|
      a, b = 0, 1
      loop do
        yielder << a
        a, b = b, a + b
      end
    end.lazy
  end
end

# ============ Main Execution ============

def main
  puts "💎 RUBY ADVANCED FEATURES SHOWCASE\n\n"
  
  # 1. Blocks, Procs, and Lambdas
  puts "=== Blocks, Procs, and Lambdas ==="
  
  # Block
  [1, 2, 3].each { |n| puts "Number: #{n}" }
  
  # Proc
  square = Proc.new { |x| x ** 2 }
  puts "Square of 5: #{square.call(5)}"
  
  # Lambda
  cube = ->(x) { x ** 3 }
  puts "Cube of 5: #{cube.call(5)}"
  
  proc_vs_lambda_demo
  
  # 2. Enumerables
  puts "\n=== Enumerables ==="
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  
  result = numbers
    .select { |n| n.even? }
    .map { |n| n * 2 }
    .reduce(:+)
  
  puts "Sum of doubled evens: #{result}"
  
  # 3. Lazy Evaluation
  puts "\n=== Lazy Evaluation ==="
  fib = LazyRange.fibonacci.take(10).to_a
  puts "First 10 Fibonacci numbers: #{fib.join(', ')}"
  
  # 4. Metaprogramming
  puts "\n=== Metaprogramming ==="
  model = DynamicModel.new(name: 'John', age: 30)
  puts "Dynamic model: #{model.name}, #{model.age}"
  model.email = 'john@example.com'
  puts "Added email: #{model.email}"
  
  # 5. Modules and Mixins
  puts "\n=== Modules and Mixins ==="
  user = User.new(id: 1, name: 'Alice', email: 'alice@example.com')
  puts user.to_s
  puts "Cache key: #{user.cache_key}"
  
  # 6. DSL Pattern
  puts "\n=== DSL Pattern ==="
  query = QueryBuilder.new('users')
    .where('age > 18')
    .where("role = 'admin'")
    .order('created_at DESC')
    .limit(10)
  
  puts "Generated SQL: #{query.to_sql}"
  
  # 7. Pipeline Pattern
  puts "\n=== Pipeline Pattern ==="
  pipeline = Pipeline.new
    .add { |x| x + 10 }
    .add { |x| x * 2 }
    .add { |x| x ** 2 }
  
  puts "Pipeline result: #{pipeline.execute(5)}" # ((5+10)*2)^2 = 900
  
  # 8. Functional Composition
  puts "\n=== Functional Composition ==="
  add_5 = ->(x) { x + 5 }
  multiply_3 = ->(x) { x * 3 }
  square = ->(x) { x ** 2 }
  
  composed = FunctionalHelpers.compose(square, multiply_3, add_5)
  puts "Composed function: #{composed.call(10)}" # ((10+5)*3)^2
  
  # 9. Currying
  puts "\n=== Currying ==="
  multiply = ->(a, b, c) { a * b * c }
  curried = FunctionalHelpers.curry(multiply)
  multiply_by_2 = curried.call(2)
  multiply_by_2_and_3 = multiply_by_2.call(3)
  puts "Curried: #{multiply_by_2_and_3.call(4)}" # 2 * 3 * 4 = 24
  
  # 10. Symbol to Proc
  puts "\n=== Symbol to Proc ==="
  words = ['hello', 'world', 'ruby']
  upcased = words.map(&:upcase)
  puts "Upcased: #{upcased.join(', ')}"
  
  puts "\n✅ All advanced Ruby features demonstrated!"
end

# Run main
main if __FILE__ == $PROGRAM_NAME
