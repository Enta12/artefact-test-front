import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (token) {
    console.log("redirecting to dashboard")
    redirect('/dashboard');
  } else {
    console.log("redirecting to auth")
    redirect('/auth');
  }
  return null;
}