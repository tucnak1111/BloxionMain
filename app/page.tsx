export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to Bloxion 👋</h1>
      <p>This will be the landing page.</p>

      <a href="/workspace/new" style={{ color: "#3b82f6" }}>
        Create a new workspace →
      </a>
    </main>
  );
}