import { getUsers } from "@/services/api";
import { User } from "@/types/user";
import CardComponent from "@/components/CardComponent";

export const revalidate = 60; //enables ISR

export default async function UserListPage() {
  let users: User[] = [];

  try {
    users = await getUsers(); //fetch data at build time
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  if (users.length === 0) {
    return (
        <h1>No Users Found</h1>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="space-y-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          User Management
        </h1>
        <div className="space-y-2">
          {users.map((user) => (
            <a
              key={user.id}
              href={`/user/${user.id}`}
              className="block"
            >
              <CardComponent card={user} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
