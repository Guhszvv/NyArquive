export async function updateLocalStorage(url: string) {
  const response = await fetch(url);
  if (!response) {
    throw new Error("Erro ao pegar as últimas páginas!");
  }
  const data = await response.json();
  return data.forEach(([title, last_page]: [string, number]) => {
    localStorage.setItem(`pdf-page-${title}`, String(JSON.stringify(last_page)));
  });
}
