import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl shadow-indigo-200 shadow-xl">
            💊
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
          Medicine Tracker
          <Sparkles className="text-indigo-500 animate-pulse" size={20} />
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <div className="space-y-6">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); loginWithGoogle(); }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
