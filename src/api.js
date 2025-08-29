const API_BASE = import.meta.env.VITE_API_BASE_URL;
export async function fetchAttendance() {
  const res = await fetch(`${API_BASE}/attendance`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function saveAttendance(subjects) {
  const res = await fetch(`${API_BASE}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjects }),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}
