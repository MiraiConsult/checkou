// Qual empresa a equipe Checkou está acessando NESTA aba. Fica em sessionStorage para
// dar para deixar vários clientes abertos lado a lado na mesma sessão de login.
const KEY = "checkou-acessar";
const PARAM = "acessar";
const UUID = /^[0-9a-f-]{36}$/i;

export function accessUrl(unitId: string) {
  return `/?${PARAM}=${unitId}`;
}

// Roda na importação, antes do primeiro createClient: o id sai da barra de endereço
function start() {
  try {
    const url = new URL(window.location.href);
    const unitId = url.searchParams.get(PARAM);
    if (!unitId) return;
    if (UUID.test(unitId)) sessionStorage.setItem(KEY, unitId);
    url.searchParams.delete(PARAM);
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch { /* navegador sem storage: segue sem acesso */ }
}

if (typeof window !== "undefined") start();

export function accessedUnit(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function leaveAccess() {
  try {
    sessionStorage.removeItem(KEY);
  } catch { /* nada a limpar */ }
  window.location.assign("/admin");
}
