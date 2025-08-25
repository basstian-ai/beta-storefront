import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import { Category } from '@/types'; // Import Category type

interface NavbarProps {
  categories: Category[]; // Add categories prop
}

const Navbar = ({ categories }: NavbarProps) => { // Destructure categories from props
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchTerm('');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.topNav}>
        <div className={styles.logo}>
          <Link href="/" legacyBehavior>
            <a>Logo</a>
          </Link>
        </div>
        <form className={styles.searchContainer} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </form>
        <div className={styles.userActions}>
          <Link href="#" legacyBehavior>
            <a className={styles.userActionLink}>[UserIcon] My Account</a>
          </Link>
          <Link href="/cart" legacyBehavior>
            <a
              className={`${styles.userActionLink} ${router.pathname === '/cart' ? styles.active : ''}`}
              aria-current={router.pathname === '/cart' ? 'page' : undefined}
            >
              [CartIcon] Cart
            </a>
          </Link>
        </div>
      </div>
      <div className={styles.categoryNav}>
        <ul>
          <li>
            <Link href="/" legacyBehavior>
              <a
                className={router.pathname === '/' ? styles.active : ''}
                aria-current={router.pathname === '/' ? 'page' : undefined}
              >
                Home
              </a>
            </Link>
          </li>
          {/* Dynamically render category links */}
          {categories.map(cat => (
            <li key={cat.id}>
              <Link href={`/category/${cat.slug}`} legacyBehavior>
                <a
                  className={router.asPath === `/category/${cat.slug}` ? styles.active : ''}
                  aria-current={router.asPath === `/category/${cat.slug}` ? 'page' : undefined}
                >
                  {cat.name}
                </a>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/products" legacyBehavior>
              <a
                className={router.pathname === '/products' ? styles.active : ''}
                aria-current={router.pathname === '/products' ? 'page' : undefined}
              >
                Products
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
