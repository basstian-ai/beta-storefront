import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import styles from '../styles/Navbar.module.css'; // Will create this file in the next step

const Navbar = () => {
  const router = useRouter(); // Get router object

  return (
    <nav className={styles.navbar}>
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
        <li>
          <Link href="/cart" legacyBehavior>
            <a
              className={router.pathname === '/cart' ? styles.active : ''}
              aria-current={router.pathname === '/cart' ? 'page' : undefined}
            >
              Cart
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
