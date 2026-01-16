import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Criamos a instância que vai gerenciar as requisições
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Este provedor resolve o erro "No QueryClient set" */}
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
)