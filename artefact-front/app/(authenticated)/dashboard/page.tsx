"use client";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../ui/Button";

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="danger" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}