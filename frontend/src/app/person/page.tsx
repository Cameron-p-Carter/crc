import { getPersons } from "@/services/api";
import { Person } from "@/types/person";
import CardComponent from "@/components/CardComponent";

export const revalidate = 60; //enables ISR

export default async function PersonListPage() {
  let persons: Person[] = [];

  try {
    persons = await getPersons(); //fetch data at build time
  } catch (error) {
    console.error("Error fetching persons:", error);
  }

  if (persons.length === 0) {
    return (
        <h1>No Persons Found</h1>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="space-y-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Person Management
        </h1>
        <div className="space-y-2">
          {persons.map((person) => (
            <a
              key={person.id}
              href={`/person/${person.id}`}
              className="block"
            >
              <CardComponent card={person} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
