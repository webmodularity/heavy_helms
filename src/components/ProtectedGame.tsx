import styles from "@/styles/ProtectedGame.module.css";
import { usePrivy } from "@privy-io/react-auth";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Import the App component without SSR
const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

interface ProtectedGameProps {
  player1Id?: string;
  player2Id?: string;
}

function ProtectedGame({ player1Id, player2Id }: ProtectedGameProps) {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Show loading state while checking authentication
  if (!ready || !authenticated) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Show the game if authenticated
  return (
    <div className={styles.gameContainer}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
      <AppWithoutSSR player1Id={player1Id} player2Id={player2Id} />
    </div>
  );
}

export default ProtectedGame;
