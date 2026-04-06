import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AdminRoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    await updateDoc(doc(db, "users", id), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">👑 Admin Role Manager</h1>

      <table className="w-full border border-slate-800">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-2 border border-slate-700">Email</th>
            <th className="p-2 border border-slate-700">Role</th>
            <th className="p-2 border border-slate-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border border-slate-800">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                {u.role === "admin" ? (
                  <button
                    onClick={() => handleRoleChange(u.id, "user")}
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                  >
                    Demote
                  </button>
                ) : (
                  <button
                    onClick={() => handleRoleChange(u.id, "admin")}
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                  >
                    Promote
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// src/components/AdminRoleManager.jsx