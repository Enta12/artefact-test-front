"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import InlineButton from "../ui/InlineButton";
import Image from "next/image";
import Logo from "../ui/Logo";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-300 lg:py-12 lg:px-8">
      <div className="flex flex-1 justify-between max-lg:items-center  w-full gap-16 bg-gray-100 p-8 lg:rounded-lg">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <div className="space-y-8">
            <Logo className="mx-auto" />
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {isLogin ? "Connexion à votre compte" : "Créer un compte"}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                {isLogin ? (
                    <>
                    Pas encore de compte ?{" "}
                    <InlineButton onClick={() => setIsLogin(false)}>
                        Inscrivez-vous
                    </InlineButton>
                    </>
                ) : (
                    <>
                    Déjà inscrit ?{" "}
                    <InlineButton onClick={() => setIsLogin(true)}>
                        Connectez-vous
                    </InlineButton>
                    </>
                )}
                </p>
            </div>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
        <div className="max-lg:hidden bg-indigo-200 w-full rounded-lg max-w-lg flex items-center justify-center">
          <div className="relative w-full aspect-[199/152]">
            <Image src="/auth.png" alt="logo" fill />
          </div>
        </div>
      </div>
    </div>
  );
}
