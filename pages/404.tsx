import Layout from '@/components/Layout';
import Link from 'next/link';
import styles from '@/styles/Home.module.css'; // Or a new CSS module for 404 page

const NotFoundPage = () => {
  return (
    <Layout>
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link href="/">
          Go back to Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
