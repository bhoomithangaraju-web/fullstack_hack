import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Mail, Lock, HeartPulse, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-clay-bg">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left decoration panel */}
        <div className="hidden md:flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-800 text-white shadow-clay-card min-h-[480px] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner border border-white/20">
              <HeartPulse className="w-8 h-8 text-purple-200" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">ClinicCare</h1>
            <p className="text-purple-100 text-sm font-medium leading-relaxed max-w-xs">
              Modern, smooth & intelligent appointment management for doctors, patients, and clinic staff.
            </p>
          </div>

          {/* Feature Pill Highlights */}
          <div className="relative z-10 flex flex-col gap-3 my-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-purple-50">
              <ShieldCheck className="w-5 h-5 text-purple-300 shrink-0" />
              <span>Role-based secure portal for Admin, Doctors & Patients</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-purple-50">
              <Stethoscope className="w-5 h-5 text-purple-300 shrink-0" />
              <span>Real-time daily appointment schedules & status updates</span>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-purple-200/80 font-medium">
            © 2026 ClinicCare Systems • All rights reserved
          </div>
        </div>

        {/* Right Login Form */}
        <Card className="p-8 bg-white/95">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500">Sign in with your email address to access your portal.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. admin@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Demo Credentials (Click to Autofill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@clinic.com', 'Admin@123')}
                className="px-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors border border-purple-200/60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.johnson@clinic.com', 'Doctor@123')}
                className="px-2 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors border border-blue-200/60"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('john.doe@gmail.com', 'Patient@123')}
                className="px-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors border border-emerald-200/60"
              >
                <UserCheck className="w-4 h-4" />
                <span>Patient</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
