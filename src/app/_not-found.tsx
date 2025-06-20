import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto mt-24 text-center space-y-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-gray-600">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="btn-primary">Go home</Link>
    </div>
  );
}
