import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "./Button";
import cn from 'classnames';
import Logo from "./Logo";

interface AppLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function AppLayout({ title, children, className }: AppLayoutProps) {
  const { logout, user } = useAuth();

  return (
    <div className="space-y-8 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center mb-6 bg-gray-100 p-4 shadow-sm">
        <Logo />
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
      <div className={cn("p-4 mt-20", className)}>
        {children}
      </div>
    </div>
  );
} 