import styles from "./FirebaseMissing.module.css";

export function FirebaseMissing() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Firebase not configured</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env.local</code>, add your
          Firebase web app keys, then restart the dev server.
        </p>
        <ol>
          <li>Create a Firebase project</li>
          <li>Enable Authentication (Email/Password, optional Google)</li>
          <li>Create a Cloud Firestore database</li>
          <li>Paste the web config into <code>.env.local</code></li>
          <li>Apply rules from <code>firestore.rules</code></li>
        </ol>
      </div>
    </div>
  );
}
