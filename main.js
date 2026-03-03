// ...existing code...
import { useNavigate } from 'react-router-dom';
function Login() {
  const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    // ทำการ authenticate ที่นี่
    const ok = true; // เปลี่ยนเป็นผลจริง
    if (ok) navigate('/dashboard');
    else alert('Login failed');
  }
  return (
    <form onSubmit={handleSubmit}>
      {/* ...fields... */}
      <button type="submit">Login</button>
    </form>
  );
}