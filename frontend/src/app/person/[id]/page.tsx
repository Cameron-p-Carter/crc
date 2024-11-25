import Link from "next/link";
import { getPerson } from "@/services/api";
import { Person } from "@/types/person";

export const revalidate = 60; //ISR

interface PersonPageProps {
  params: Promise<{ id: string }>; //dynamic route params
}

export default async function PersonDetailPage({ params }: PersonPageProps) {
  const resolvedParams = await params; //await the async params
  const personId = parseInt(resolvedParams.id);

  let person: Person | null = null;
  try {
    person = await getPerson(personId); //fetch person details
  } catch (error) {
    console.error("Error fetching person:", error);
  }

  if (!person) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Person Not Found</h1>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold text-gray-800">{person.name}</h1>
        <p className="text-lg text-gray-700">Email: {person.email}</p>
        <p className="text-md text-gray-600">Person ID: {person.id}</p>
        <Link
          href="/person"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to Person List
        </Link>
      </div>
    </main>
  );
}
