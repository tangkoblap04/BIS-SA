import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setError('');
      const response = await login(email, password);

      if (response.token && response.user) {
        // Navigate based on user role
        if (response.user.role === 'HR') {
          navigate('/hr-dashboard');
        } else {
          navigate('/dashboard'); // Employee จะไปหน้า Employee Dashboard
        }
      } else {
        setError('ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-sky-700 mb-2 text-center">เข้าสู่ระบบ</h1>
        <p className="text-sm text-gray-500 text-center mb-6">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="รหัสผ่านของคุณ"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-sky-600"
              >
                {showPassword ? 'ซ่อน' : 'แสดง'}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}