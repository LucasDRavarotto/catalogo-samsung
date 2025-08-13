// config.js
// Lógica para determinar la URL base del backend (local o en la nube)
export function getBackendBase() {
  const { protocol, hostname } = window.location;
  const isCodespaces = /\.app\.github\.dev$/.test(hostname);
  if (isCodespaces) {
    const backendHost = hostname.replace(/-\d+\.app\.github\.dev$/, '-3000.app.github.dev');
    return `${protocol}//${backendHost}`;
  }
  return 'http://localhost:3000';
}

export const BACKEND_BASE = getBackendBase();