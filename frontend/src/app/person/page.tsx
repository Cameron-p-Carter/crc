// src/app/person/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPersons } from "@/services/api";
import { Person } from "@/types/person";

export default function PersonListPage() {
  const [persons, setPersons] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const fetchedPersons = await getPersons();
        setPersons(fetchedPersons.reverse());
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };
    fetchPersons();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="space-y-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Person Management</h1>
        <div className="space-y-2">
          {persons.map((person) => (
            <Link key={person.id} href={`/person/${person.id}`} className="block p-4 bg-white rounded-lg shadow hover:bg-gray-100">
              <div className="text-lg font-semibold text-gray-800">{person.name}</div>
              <div className="text-sm text-gray-600">{person.email}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
