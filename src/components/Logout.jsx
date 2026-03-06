//You can modify this component.

import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Logout() {

  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useUser();

  useEffect(() => {
    let mounted = true;
    logout().finally(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [logout]);

  if (isLoading) {
    return (
      <div className="page-shell auth-shell">
        <div className="card logout-box">
          <h3><span className="pulse" />Logging out...</h3>
        </div>
      </div>
    );
  }
  else {
    return (<Navigate to="/login" replace/>)
  }
}
