//You can modify this component.

import { useRef, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Login() {

  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
    isLoginOk: false
  });

  const emailRef = useRef();
  const passRef = useRef();
  const {user, login} = useUser();

  async function onLogin () {

    setControlState((prev)=>{
      return {
        ...prev,
        isLoggingIn: true
      }
    });

    const email = emailRef.current.value;
    const pass = passRef.current.value;

    const result = await login(email, pass);

    setControlState(() => {
      return {
        isLoggingIn: false,
        isLoginError: !result,
        isLoginOk: result
      }
    });
  }

  if (!user.isLoggedIn)
    return (
      <div className="page-shell auth-shell">
        <div className="page-header">
          <h1>Library Management</h1>
          <p>Sign in to access books and borrowing services.</p>
        </div>

        <div className="card auth-card">
          <div className="grid-2">
            <label htmlFor="email">
              Email
              <input type="text" name="email" id="email" ref={emailRef} />
            </label>
            <label htmlFor="password">
              Password
              <input type="password" name="password" id="password" ref={passRef} />
            </label>
          </div>

          <div className="inline-actions">
            <button onClick={onLogin} disabled={controlState.isLoggingIn}>
              {controlState.isLoggingIn ? "Signing in..." : "Login"}
            </button>
          </div>

          {controlState.isLoginError && <div className="message error">Login incorrect</div>}
          {user.isLoggedIn && <div className="message">Login success</div>}

          <div className="auth-credentials">
            <div>Admin: admin@test.com / admin123</div>
            <div>User: user@test.com / user123</div>
          </div>
          <div className="helper">Use these accounts for exam testing.</div>
        </div>
      </div>
    );
  else
    return (
      <Navigate to="/books" replace />
    );
}
