// src/components/UserList.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/useApi";


const UserList = () => {
  const { data: users, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users?.map((user: any) => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
