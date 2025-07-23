'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Test Technique Artefact Logo"
        width={48}
        height={48}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-quicksand text-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent tracking-wide">
            Test Technique
          </span>
          <span className="font-quicksand text-lg font-semibold text-indigo-600 -mt-2 tracking-wider">
            Artefact
          </span>
        </div>
      )}
    </Link>
  );
} 