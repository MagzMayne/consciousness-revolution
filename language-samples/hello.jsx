/**
 * React JSX Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 * 
 * Features demonstrated:
 * - Hooks (useState, useEffect, useContext, useReducer, useMemo, useCallback)
 * - Custom Hooks
 * - Context API
 * - Higher-Order Components
 * - Render Props
 * - Compound Components
 * - Performance Optimization
 * - Error Boundaries
 */

import React, { 
    useState, 
    useEffect, 
    useContext, 
    useReducer, 
    useMemo, 
    useCallback,
    createContext,
    memo 
} from 'react';

// ============ Context API ============

const ThemeContext = createContext();
const UserContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ============ Custom Hooks ============

const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
    });
    
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    
    return [value, setValue];
};

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => clearTimeout(handler);
    }, [value, delay]);
    
    return debouncedValue;
};

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let mounted = true;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (mounted) {
                    setData(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            });
        
        return () => {
            mounted = false;
        };
    }, [url]);
    
    return { data, loading, error };
};

// ============ Reducer Pattern ============

const todoReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state, { id: Date.now(), text: action.payload, completed: false }];
        case 'TOGGLE_TODO':
            return state.map(todo =>
                todo.id === action.payload
                    ? { ...todo, completed: !todo.completed }
                    : todo
            );
        case 'DELETE_TODO':
            return state.filter(todo => todo.id !== action.payload);
        default:
            return state;
    }
};

// ============ Higher-Order Component ============

const withLogging = (Component) => {
    return (props) => {
        useEffect(() => {
            console.log(`${Component.name} mounted`);
            return () => console.log(`${Component.name} unmounted`);
        }, []);
        
        return <Component {...props} />;
    };
};

// ============ Render Props Pattern ============

const Mouse = ({ render }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const handleMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);
    
    return render(position);
};

// ============ Compound Components ============

const Tabs = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);
    
    return (
        <div className="tabs">
            {React.Children.map(children, (child, index) =>
                React.cloneElement(child, {
                    isActive: index === activeTab,
                    onActivate: () => setActiveTab(index)
                })
            )}
        </div>
    );
};

const Tab = ({ title, children, isActive, onActivate }) => (
    <div>
        <button onClick={onActivate} className={isActive ? 'active' : ''}>
            {title}
        </button>
        {isActive && <div className="tab-content">{children}</div>}
    </div>
);

// ============ Memoization ============

const ExpensiveComponent = memo(({ data, onProcess }) => {
    console.log('ExpensiveComponent rendered');
    
    const processedData = useMemo(() => {
        console.log('Processing data...');
        return data.map(item => item * 2);
    }, [data]);
    
    return (
        <div>
            <h3>Processed Data</h3>
            <p>{processedData.join(', ')}</p>
            <button onClick={onProcess}>Process</button>
        </div>
    );
});

// ============ Error Boundary ============

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message}</p>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// ============ Advanced Todo Application ============

const TodoApp = () => {
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [input, setInput] = useState('');
    const debouncedInput = useDebounce(input, 300);
    
    const addTodo = useCallback(() => {
        if (input.trim()) {
            dispatch({ type: 'ADD_TODO', payload: input });
            setInput('');
        }
    }, [input]);
    
    const filteredTodos = useMemo(() => {
        if (!debouncedInput) return todos;
        return todos.filter(todo =>
            todo.text.toLowerCase().includes(debouncedInput.toLowerCase())
        );
    }, [todos, debouncedInput]);
    
    return (
        <div className="todo-app">
            <h2>Advanced Todo App</h2>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add or search todos..."
            />
            <button onClick={addTodo}>Add</button>
            
            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
                        />
                        <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                            {todo.text}
                        </span>
                        <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ============ Main App Component ============

const App = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [count, setCount] = useState(0);
    const [data, setData] = useLocalStorage('myData', [1, 2, 3, 4, 5]);
    
    const handleProcess = useCallback(() => {
        console.log('Processing...');
    }, []);
    
    return (
        <div className={`app theme-${theme}`}>
            <h1>🚀 React JSX Advanced Features</h1>
            
            <button onClick={toggleTheme}>
                Toggle Theme ({theme})
            </button>
            
            <section>
                <h2>Counter</h2>
                <p>Count: {count}</p>
                <button onClick={() => setCount(c => c + 1)}>Increment</button>
            </section>
            
            <section>
                <ExpensiveComponent data={data} onProcess={handleProcess} />
            </section>
            
            <section>
                <TodoApp />
            </section>
            
            <section>
                <h2>Mouse Tracking</h2>
                <Mouse render={({ x, y }) => (
                    <p>Mouse position: ({x}, {y})</p>
                )} />
            </section>
            
            <section>
                <Tabs>
                    <Tab title="Tab 1">
                        <p>Content for Tab 1</p>
                    </Tab>
                    <Tab title="Tab 2">
                        <p>Content for Tab 2</p>
                    </Tab>
                    <Tab title="Tab 3">
                        <p>Content for Tab 3</p>
                    </Tab>
                </Tabs>
            </section>
        </div>
    );
};

// ============ Export with Providers ============

const AppWithProviders = withLogging(() => (
    <ErrorBoundary>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </ErrorBoundary>
));

export default AppWithProviders;

// Named exports
export {
    useLocalStorage,
    useDebounce,
    useFetch,
    withLogging,
    ErrorBoundary,
    ThemeProvider,
    TodoApp
};
