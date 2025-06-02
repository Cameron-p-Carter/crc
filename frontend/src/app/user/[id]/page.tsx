import Link from "next/link";
import { getUser } from "@/services/api";
import { User } from "@/types/user";

export const revalidate = 60; //ISR

interface UserPageProps {
  params: Promise<{ id: string }>; //dynamic route params
}

export default async function UserDetailPage({ params }: UserPageProps) {
  const resolvedParams = await params; //await the async params
  const userId = parseInt(resolvedParams.id);

  let user: User | null = null;
  try {
    user = await getUser(userId); //fetch user details
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-xl font-bold text-gray-800">User Not Found</h1>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-lg text-gray-700">Email: {user.email}</p>
        <p className="text-md text-gray-600">User ID: {user.id}</p>
        <Link
          href="/user"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to User List
        </Link>
      </div>
    </main>
  );
}
