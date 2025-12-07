import { Toaster } from "react-hot-toast";
import "./globals.css";
import { version } from "../package.json";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-container">
        <div className="main-content">
          {/* Toaster for notifications across all pages */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
              },
            }}
          />
          {children}
        </div>

        {/* Global Footer */}
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Bloxion. All Rights Reserved.</p>
          <p>Version {version}</p>
        </footer>
      </body>
    </html>
  );
}