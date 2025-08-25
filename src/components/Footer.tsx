import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 text-center text-gray-500 border-t">
      <div className="mb-4">
        <Link href="/stores" className="text-primary hover:text-accent">
          Find my nearest store
        </Link>
      </div>
      <p>&copy; {new Date().getFullYear()} BetaStore. All rights reserved.</p>
    </footer>
  );
}
