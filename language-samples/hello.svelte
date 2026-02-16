<!--
  Svelte Advanced Sample - Demonstrating Most Powerful Features
  BarbrickDesign - Complete Language Portfolio
  
  Features demonstrated:
  - Reactive Declarations
  - Stores (writable, readable, derived)
  - Two-way Binding
  - Lifecycle Hooks
  - Slots & Component Composition
  - Transitions & Animations
  - Actions
  - Context API
  - TypeScript Support
-->

<script lang="ts">
  import { onMount, onDestroy, beforeUpdate, afterUpdate, tick } from 'svelte';
  import { writable, derived, readable } from 'svelte/store';
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  // ============ Types ============
  
  interface Todo {
    id: number;
    text: string;
    completed: boolean;
  }

  interface User {
    id: string;
    name: string;
    email: string;
  }

  // ============ Stores ============
  
  const count = writable<number>(0);
  const name = writable<string>('World');
  
  // Derived store
  const doubled = derived(count, $count => $count * 2);
  const greeting = derived(name, $name => `Hello, ${$name}!`);
  
  // Readable store (time)
  const time = readable(new Date(), function start(set) {
    const interval = setInterval(() => {
      set(new Date());
    }, 1000);

    return function stop() {
      clearInterval(interval);
    };
  });

  // Custom store with additional methods
  function createTodoStore() {
    const { subscribe, set, update } = writable<Todo[]>([]);

    return {
      subscribe,
      add: (text: string) => update(todos => [
        ...todos,
        { id: Date.now(), text, completed: false }
      ]),
      toggle: (id: number) => update(todos =>
        todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      ),
      remove: (id: number) => update(todos =>
        todos.filter(todo => todo.id !== id)
      ),
      clear: () => set([])
    };
  }

  const todos = createTodoStore();

  // ============ Reactive Declarations ============
  
  let a = 1;
  let b = 2;
  
  // Reactive statement
  $: sum = a + b;
  $: if (sum > 10) {
    console.log('Sum is greater than 10:', sum);
  }
  
  // Reactive block
  $: {
    console.log('a or b changed');
    console.log(`a = ${a}, b = ${b}`);
  }

  // ============ Component State ============
  
  let todoInput = '';
  let users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];
  
  let searchTerm = '';
  let selectedUser: User | null = null;

  // Computed/Reactive values
  $: filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  $: activeTodoCount = $todos.filter(t => !t.completed).length;
  $: completedTodoCount = $todos.filter(t => t.completed).length;

  // ============ Lifecycle Hooks ============
  
  onMount(() => {
    console.log('Component mounted');
    
    // Example: Fetch data
    fetchUsers();
    
    return () => {
      console.log('Component cleanup');
    };
  });

  onDestroy(() => {
    console.log('Component will unmount');
  });

  beforeUpdate(() => {
    console.log('Before component updates');
  });

  afterUpdate(() => {
    console.log('After component updates');
  });

  // ============ Actions ============
  
  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node)) {
        node.dispatchEvent(new CustomEvent('outclick'));
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  function autofocus(node: HTMLElement) {
    node.focus();
  }

  // ============ Functions ============
  
  async function fetchUsers() {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Users fetched');
  }

  function handleAddTodo() {
    if (todoInput.trim()) {
      todos.add(todoInput);
      todoInput = '';
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  }

  async function handleAsync() {
    console.log('Before tick');
    await tick(); // Wait for DOM updates
    console.log('After tick');
  }

  // ============ Event Handlers ============
  
  function handleUserClick(user: User) {
    selectedUser = user;
  }

  function closeModal() {
    selectedUser = null;
  }
</script>

<!-- ============ Styles ============ -->

<style>
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .counter {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  button {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background: #45a049;
  }

  .danger {
    background: #f44336;
  }

  .danger:hover {
    background: #da190b;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .todo-list {
    list-style: none;
    padding: 0;
  }

  .todo-item {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem;
    background: white;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }

  .todo-item.completed {
    opacity: 0.6;
  }

  .user-card {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .user-card:hover {
    transform: translateX(10px);
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
  }

  .stat {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #4CAF50;
  }
</style>

<!-- ============ Template ============ -->

<div class="app">
  <h1>⚡ Svelte Advanced Features</h1>

  <!-- Reactive Declarations -->
  <section class="section">
    <h2>Reactive Declarations</h2>
    <div class="counter">
      <label>
        a: <input type="number" bind:value={a} />
      </label>
      <label>
        b: <input type="number" bind:value={b} />
      </label>
      <p>Sum: {sum}</p>
    </div>
  </section>

  <!-- Stores -->
  <section class="section">
    <h2>Stores</h2>
    <div class="counter">
      <button on:click={() => count.update(n => n - 1)}>-</button>
      <span>Count: {$count}</span>
      <button on:click={() => count.update(n => n + 1)}>+</button>
      <span>Doubled: {$doubled}</span>
    </div>
    
    <div style="margin-top: 1rem;">
      <input bind:value={$name} placeholder="Enter name" />
      <p>{$greeting}</p>
    </div>

    <div style="margin-top: 1rem;">
      <p>Time: {$time.toLocaleTimeString()}</p>
    </div>
  </section>

  <!-- Todo List with Transitions -->
  <section class="section">
    <h2>Advanced Todo List</h2>
    
    <div style="margin-bottom: 1rem;">
      <input
        bind:value={todoInput}
        on:keypress={handleKeyPress}
        placeholder="Add todo..."
        use:autofocus
      />
      <button on:click={handleAddTodo}>Add</button>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">{activeTodoCount}</div>
        <div>Active</div>
      </div>
      <div class="stat">
        <div class="stat-value">{completedTodoCount}</div>
        <div>Completed</div>
      </div>
    </div>

    <ul class="todo-list">
      {#each $todos as todo (todo.id)}
        <li
          class="todo-item"
          class:completed={todo.completed}
          transition:slide={{ duration: 300 }}
          animate:flip={{ duration: 300 }}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            on:change={() => todos.toggle(todo.id)}
          />
          <span style:text-decoration={todo.completed ? 'line-through' : 'none'}>
            {todo.text}
          </span>
          <button
            class="danger"
            on:click={() => todos.remove(todo.id)}
          >
            Delete
          </button>
        </li>
      {/each}
    </ul>

    {#if $todos.length > 0}
      <button class="danger" on:click={() => todos.clear()}>
        Clear All
      </button>
    {/if}
  </section>

  <!-- User List with Search -->
  <section class="section">
    <h2>User List with Search</h2>
    
    <input
      bind:value={searchTerm}
      placeholder="Search users..."
      style="width: 100%; margin-bottom: 1rem;"
    />

    {#each filteredUsers as user (user.id)}
      <div
        class="user-card"
        on:click={() => handleUserClick(user)}
        transition:fade={{ duration: 200 }}
      >
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    {:else}
      <p>No users found</p>
    {/each}
  </section>

  <!-- Modal with Transitions -->
  {#if selectedUser}
    <div
      class="modal"
      transition:fade={{ duration: 200 }}
      on:click={closeModal}
      on:outclick={closeModal}
      use:clickOutside
    >
      <div
        class="modal-content"
        on:click|stopPropagation
        transition:fly={{ y: 200, duration: 300, easing: quintOut }}
      >
        <h2>{selectedUser.name}</h2>
        <p><strong>Email:</strong> {selectedUser.email}</p>
        <p><strong>ID:</strong> {selectedUser.id}</p>
        <button on:click={closeModal}>Close</button>
      </div>
    </div>
  {/if}
</div>
