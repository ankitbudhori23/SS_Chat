import styles from "./layout.module.css";

export default function RootLayout({ children }) {
  return (
    <div>
      <div className={styles.nav_header}>
        <a href="/" className={styles.nav_link}>
          <img src="/logo.png"></img>
          <h2>studifysuccess</h2>
        </a>
      </div>
      {children}
    </div>
  );
}
