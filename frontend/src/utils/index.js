/**
 * Gera URLs compatíveis com o roteamento do sistema.
 */
export const createPageUrl = (path) => {
    // Remove barras extras caso existam e retorna o caminho limpo
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
};