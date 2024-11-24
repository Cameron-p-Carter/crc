// src/services/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  
export const createPerson = async (person: { name: string; email: string }) => {
  const response = await fetch(`${BASE_URL}/persons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(person),
  });
  if (!response.ok) {
    throw new Error("Failed to create person");
  }
  return await response.json();
};

export const updatePerson = async (id: number, person: { name: string; email: string }) => {
  const response = await fetch(`${BASE_URL}/persons/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(person),
  });
  if (!response.ok) {
    throw new Error("Failed to update person");
  }
  return await response.json();
};

export const deletePerson = async (id: number) => {
  const response = await fetch(`${BASE_URL}/persons/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete person");
  }
  return await response.json();
};
