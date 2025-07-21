import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../ui/Button";

interface AppLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  const { logout, user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
            {user?.name && <span className="text-sm text-gray-500">
                Bienvenue, {user.name}
            </span>}
            <Button variant="danger" onClick={logout}>
                Se déconnecter
            </Button>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
} 