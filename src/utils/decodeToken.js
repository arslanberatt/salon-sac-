export function decodeToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload; // { id, role, iat, exp }
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login'; // yönlendirme ihtiyacına göre değiştirilebilir
}
