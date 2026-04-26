const { useState, useEffect } = React;

const API_BASE = "http://127.0.0.1:5000/api/auth";
const rootElement = document.getElementById("auth-root");
const authMode = rootElement?.dataset?.authMode === "register" ? "register" : "login";

function AuthApp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function callApi(path, payload) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  }

  async function loadSession() {
    try {
      const response = await fetch(`${API_BASE}/me`, { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      // Ignore initial session check errors.
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function handleRegister(event) {
    event.preventDefault();
    try {
      const data = await callApi("/register", { name, email, mobile, password });
      setCurrentUser(data.user);
      setMessage("Registration successful. You are now logged in.");
      setIsError(false);
      setPassword("");
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const data = await callApi("/login", { mobile, password });
      setCurrentUser(data.user);
      setMessage("Login successful.");
      setIsError(false);
      setPassword("");
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  }

  async function handleLogout() {
    try {
      await callApi("/logout", {});
      setCurrentUser(null);
      setMessage("Logged out.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  }

  return (
    <div className="auth-card">
      <h3>
        {currentUser
          ? `Welcome, ${currentUser.name}`
          : authMode === "register"
            ? "Register New Account"
            : "Login to Your Account"}
      </h3>

      {!currentUser ? (
        <form onSubmit={authMode === "register" ? handleRegister : handleLogin}>
          {authMode === "register" ? (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          ) : null}
          {authMode === "register" ? (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          ) : null}
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="auth-actions">
            <button type="submit" className="primary">
              {authMode === "register" ? "Register" : "Login"}
            </button>
            <a
              className="secondary auth-link-button"
              href={authMode === "register" ? "login.html" : "register.html"}
            >
              {authMode === "register" ? "Go to Login" : "Create Account"}
            </a>
          </div>
        </form>
      ) : (
        <div className="auth-actions">
          <button className="primary" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {message ? (
        <p className={`auth-message ${isError ? "error" : "success"}`}>{message}</p>
      ) : null}
    </div>
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(<AuthApp />);
