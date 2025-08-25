import Link from 'next/link';
import styles from '../../styles/Breadcrumb.module.css'; // Import CSS module

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ segments }) => {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        {segments.map((segment, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            {index > 0 && <span className={styles.separator}>{'>'}</span>}
            {index === segments.length - 1 ? (
              <span className={styles.currentSegment}>{segment.label}</span>
            ) : (
              <Link href={segment.href}>
                <a className={styles.link}>{segment.label}</a>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
