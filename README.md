# StateSync

A reactive state management solution that elegantly synchronizes data across components without frameworks, offering derived states and DOM binding with zero dependencies.

## Features

- Ultra-lightweight (only 50 lines of code)
- Zero dependencies
- Reactive state management
- Derived states that auto-update
- Direct DOM binding
- Support for nested state paths
- Simple subscription model
- Framework-agnostic

## Installation

```bash
npm install state-sync
```

## Usage

### Basic State Management

```javascript
// Create a store with initial state
const userStore = StateSync.createStore('user', {
  name: 'Guest',
  isLoggedIn: false,
  preferences: { theme: 'light', language: 'en' }
});

// Get state or nested properties
const userName = userStore.get('name');
const theme = userStore.get('preferences.theme');
const fullState = userStore.get();

// Update state
userStore.set({ 
  name: 'John Doe', 
  isLoggedIn: true 
});

// Update nested state with function updater
userStore.set(state => ({
  ...state,
  preferences: {
    ...state.preferences,
    theme: 'dark'
  }
}));

// Subscribe to changes
const unsubscribe = userStore.subscribe((newState, oldState) => {
  console.log('User state changed:', newState);
});

// Later, unsubscribe if needed
unsubscribe();
```

### Derived States

```javascript
// Create multiple stores
const userStore = StateSync.createStore('user', { name: 'Guest', isLoggedIn: false });
const cartStore = StateSync.createStore('cart', { items: [], total: 0 });

// Create a derived state that depends on other stores
const uiStore = StateSync.derive('ui', ['user', 'cart'], 
  (userState, cartState) => ({
    displayName: userState.isLoggedIn ? userState.name : 'Guest',
    cartCount: cartState.items.length,
    isEmpty: cartState.items.length === 0
  })
);

// Derived state automatically updates when dependencies change
userStore.set({ name: 'John', isLoggedIn: true });
cartStore.set(state => ({
  items: [...state.items, { id: 1, name: 'Product', price: 100 }],
  total: state.total + 100
}));

// Get the computed state
console.log(uiStore.get()); // { displayName: 'John', cartCount: 1, isEmpty: false }
```

### DOM Binding

```javascript
// Bind state to DOM elements
userStore.bind('#user-name', { 
  prop: 'textContent', 
  transform: state => state.isLoggedIn ? state.name : 'Guest' 
});

cartStore.bind('#cart-badge', { 
  prop: 'textContent', 
  transform: state => state.items.length 
});

uiStore.bind('body', { 
  attr: 'data-theme', 
  transform: state => state.theme 
});

// Elements automatically update when state changes
userStore.set({ name: 'Jane', isLoggedIn: true });
```

## Complete Example

```javascript
// Create stores
const userStore = StateSync.createStore('user', {
  name: 'Guest',
  isLoggedIn: false,
  preferences: { theme: 'light' }
});

const todoStore = StateSync.createStore('todos', {
  items: [],
  filter: 'all'
});

// Create derived state
const uiState = StateSync.derive('ui', ['user', 'todos'], 
  (user, todos) => ({
    theme: user.preferences.theme,
    displayName: user.isLoggedIn ? user.name : 'Guest',
    todoCount: todos.items.length,
    activeTodoCount: todos.items.filter(todo => !todo.completed).length
  })
);

// Bind to DOM
uiState.bind('#user-display', { 
  prop: 'textContent', 
  transform: state => `Hello, ${state.displayName}` 
});

uiState.bind('#todo-count', { 
  prop: 'textContent', 
  transform: state => `${state.activeTodoCount} items left` 
});

uiState.bind('body', { 
  attr: 'data-theme', 
  transform: state => state.theme 
});

// Add a todo
document.querySelector('#add-todo').addEventListener('click', () => {
  const input = document.querySelector('#new-todo');
  const text = input.value.trim();
  
  if (text) {
    todoStore.set(state => ({
      ...state,
      items: [...state.items, { id: Date.now(), text, completed: false }]
    }));
    input.value = '';
  }
});

// Toggle theme
document.querySelector('#toggle-theme').addEventListener('click', () => {
  userStore.set(state => ({
    ...state,
    preferences: {
      ...state.preferences,
      theme: state.preferences.theme === 'light' ? 'dark' : 'light'
    }
  }));
});

// Login
document.querySelector('#login-button').addEventListener('click', () => {
  userStore.set({ name: 'John Doe', isLoggedIn: true });
});
```

## API Reference

**StateSync.createStore(name, initialState)**
Creates a new store with the given name and initial state.

Returns an object with the following methods:

- `get(path?)` - Get the current state or a nested property
- `set(updater, options?)` - Update the state
- `subscribe(callback)` - Subscribe to state changes
- `bind(selector, options)` - Bind state to DOM elements

**StateSync.derive(name, dependencies, computeFn)**
Creates a derived state that automatically updates when its dependencies change.

Parameters:

- name - Unique name for the derived store
- dependencies - Array of store names this derived state depends on
- computeFn - Function that computes the derived state from dependencies

## License

MIT

Made with by Michael Ilyash
