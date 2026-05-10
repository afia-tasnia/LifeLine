import "../assets/log_in.css";

export default function Login() {
  return (
    <div className="login-container">
      
      <h2>Login</h2>

      <form className="login-form">
        
        <input
          type="email"
          placeholder="Enter email"
          className="login-input"
        />

        <input
          type="password"
          placeholder="Enter password"
          className="login-input"
        />

        <button type="submit" className="login-btn">
          Login
        </button>

      </form>

    </div>
  );
}