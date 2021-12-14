import Link from 'next/link';
import styles from './header.module.scss';

const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <div>
          <img src="/Logo.svg" alt="logo" />
        </div>
      </Link>
    </header>
  );
};

export default Header;
