/**
 * React TypeScript (TSX) Advanced Sample - Demonstrating Most Powerful Features
 * BarbrickDesign - Complete Language Portfolio
 * 
 * Features demonstrated:
 * - TypeScript with React (typed props, state, events)
 * - Generic Components
 * - Discriminated Union Props
 * - Advanced Hook Typing
 * - Utility Types with React
 * - Type-safe Context
 * - Conditional Rendering Types
 */

import React, { 
    useState, 
    useEffect, 
    useContext, 
    useReducer, 
    useMemo, 
    useCallback,
    createContext,
    memo,
    ReactNode,
    FC,
    PropsWithChildren
} from 'react';

// ============ Type Definitions ============

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
}

interface Theme {
    primary: string;
    secondary: string;
    background: string;
    text: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
    status: Status;
    data: T | null;
    error: Error | null;
}

// ============ Discriminated Union Props ============

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface BaseButtonProps {
    variant: ButtonVariant;
    disabled?: boolean;
    onClick?: () => void;
}

interface TextButtonProps extends BaseButtonProps {
    type: 'text';
    text: string;
}

interface IconButtonProps extends BaseButtonProps {
    type: 'icon';
    icon: ReactNode;
    ariaLabel: string;
}

type ButtonProps = TextButtonProps | IconButtonProps;

// ============ Generic Types ============

interface DataTableColumn<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    onRowClick?: (item: T) => void;
}

// ============ Context with TypeScript ============

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// ============ Custom Hooks with TypeScript ============

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

function useAsync<T>(asyncFunction: () => Promise<T>): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>({
        status: 'idle',
        data: null,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        setState({ status: 'loading', data: null, error: null });

        asyncFunction()
            .then(data => {
                if (mounted) {
                    setState({ status: 'success', data, error: null });
                }
            })
            .catch(error => {
                if (mounted) {
                    setState({ status: 'error', data: null, error });
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    return state;
}

// ============ Generic Components ============

function DataTable<T extends Record<string, any>>({ 
    data, 
    columns, 
    onRowClick 
}: DataTableProps<T>): JSX.Element {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map(column => (
                        <th key={String(column.key)}>{column.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr 
                        key={index} 
                        onClick={() => onRowClick?.(item)}
                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                        {columns.map(column => (
                            <td key={String(column.key)}>
                                {column.render 
                                    ? column.render(item[column.key], item)
                                    : String(item[column.key])
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ============ Button Component with Discriminated Union ============

const Button: FC<ButtonProps> = (props) => {
    const baseClasses = `btn btn-${props.variant}`;
    
    if (props.type === 'text') {
        return (
            <button 
                className={baseClasses}
                disabled={props.disabled}
                onClick={props.onClick}
            >
                {props.text}
            </button>
        );
    }
    
    return (
        <button 
            className={baseClasses}
            disabled={props.disabled}
            onClick={props.onClick}
            aria-label={props.ariaLabel}
        >
            {props.icon}
        </button>
    );
};

// ============ Higher-Order Component with TypeScript ============

function withLoading<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P & { isLoading: boolean }> {
    return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
        if (isLoading) {
            return <div>Loading...</div>;
        }
        return <Component {...(props as P)} />;
    };
}

// ============ Typed Reducer ============

type TodoAction =
    | { type: 'ADD_TODO'; payload: string }
    | { type: 'TOGGLE_TODO'; payload: string }
    | { type: 'DELETE_TODO'; payload: string };

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

const todoReducer = (state: Todo[], action: TodoAction): Todo[] => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state, { id: Date.now().toString(), text: action.payload, completed: false }];
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

// ============ Form with TypeScript ============

interface FormData {
    name: string;
    email: string;
    age: number;
}

interface FormErrors {
    name?: string;
    email?: string;
    age?: string;
}

const Form: FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        age: 0,
    });
    
    const [errors, setErrors] = useState<FormErrors>({});
    
    const handleChange = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'age' ? parseInt(e.target.value) : e.target.value,
        }));
    };
    
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.name) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.includes('@')) {
            newErrors.email = 'Invalid email';
        }
        
        if (formData.age < 0 || formData.age > 150) {
            newErrors.age = 'Age must be between 0 and 150';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            console.log('Form submitted:', formData);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Name"
                />
                {errors.name && <span className="error">{errors.name}</span>}
            </div>
            
            <div>
                <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="Email"
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>
            
            <div>
                <input
                    type="number"
                    value={formData.age}
                    onChange={handleChange('age')}
                    placeholder="Age"
                />
                {errors.age && <span className="error">{errors.age}</span>}
            </div>
            
            <button type="submit">Submit</button>
        </form>
    );
};

// ============ Main App Component ============

const App: FC = () => {
    const [users] = useState<User[]>([
        { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
        { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' },
        { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'guest' },
    ]);
    
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [input, setInput] = useState('');
    
    const columns: DataTableColumn<User>[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { 
            key: 'role', 
            label: 'Role',
            render: (value) => (
                <span className={`badge badge-${value}`}>
                    {String(value)}
                </span>
            )
        },
    ];
    
    const handleAddTodo = useCallback(() => {
        if (input.trim()) {
            dispatch({ type: 'ADD_TODO', payload: input });
            setInput('');
        }
    }, [input]);
    
    return (
        <div className="app">
            <h1>📘 React TypeScript (TSX) Advanced Features</h1>
            
            <section>
                <h2>Typed Buttons</h2>
                <Button type="text" variant="primary" text="Primary Button" />
                <Button 
                    type="icon" 
                    variant="secondary" 
                    icon={<span>🔔</span>} 
                    ariaLabel="Notifications"
                />
            </section>
            
            <section>
                <h2>Generic Data Table</h2>
                <DataTable 
                    data={users} 
                    columns={columns}
                    onRowClick={(user) => console.log('Clicked:', user.name)}
                />
            </section>
            
            <section>
                <h2>Typed Form</h2>
                <Form />
            </section>
            
            <section>
                <h2>Typed Todo List</h2>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add todo..."
                />
                <button onClick={handleAddTodo}>Add</button>
                
                <ul>
                    {todos.map(todo => (
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
            </section>
        </div>
    );
};

export default App;

// Named exports
export type { User, Theme, Status, AsyncState, ButtonProps };
export { useLocalStorage, useAsync, useTheme, DataTable, Button, Form };
