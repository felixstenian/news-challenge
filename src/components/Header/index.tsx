import styles from './header.module.scss';

const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <div>
        <img src="/Logo.svg" alt="logo" />
      </div>
    </header>
  );
};

export default Header;
