import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função para mesclar classes de CSS de forma inteligente
 * Evita conflitos de classes do Tailwind.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}