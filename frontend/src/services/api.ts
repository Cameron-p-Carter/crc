// src/services/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

export const getPersons = async () => {
  const response = await fetch(`${BASE_URL}/persons`);
  if (!response.ok) {
    throw new Error("Failed to fetch persons");
  }
  return await response.json();
};

export const getPerson = async (id: number) => {
  const response = await fetch(`${BASE_URL}/persons/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch person");
  }
  return await response.json();
};
