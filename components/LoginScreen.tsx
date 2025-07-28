import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import type { Vibe } from '../types';

const DEFAULT_VIBES: Vibe[] = [
  { id: '1', name: '🚀 پروژه' },
  { id: '2', name: '🤔 فکر خام' },
  { id: '3', name: '💡 لامپ' },
];

const LoginScreen: React.FC = () => {
  const [isRegisterMode, setRegisterMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!/^(09)\d{9}$/.test(phoneNumber)) {
        setError('لطفاً یک شماره موبایل معتبر با فرمت 09... وارد کنید.');
        setLoading(false);
        return;
    }
    if (password.length < 6) {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        setLoading(false);
        return;
    }
    if (isRegisterMode && !fullName.trim()) {
        setError('نام و نام خانوادگی نمی‌تواند خالی باشد.');
        setLoading(false);
        return;
    }

    // Use phone number as the username part of the email for Firebase Auth
    const email = `${phoneNumber}@ideapardaz.app`;

    try {
      if (isRegisterMode) {
        // --- Register a new user ---
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (user) {
          // 1. Update the user's profile in Firebase Auth
          await user.updateProfile({ displayName: fullName });
          
          // 2. Create the user's document in Firestore and add default vibes
          const userDocRef = db.collection('users').doc(user.uid);
          const batch = db.batch();
          
          batch.set(userDocRef, { displayName: fullName, createdAt: new Date().toISOString() });
          
          const vibesRef = userDocRef.collection('vibes');
          DEFAULT_VIBES.forEach(vibe => {
            batch.set(vibesRef.doc(vibe.id), { name: vibe.name });
          });
          
          await batch.commit();

          if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
        }
      } else {
        // --- Login an existing user ---
        await auth.signInWithEmailAndPassword(email, password);
        if (navigator.vibrate) navigator.vibrate(50);
      }
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.');
          break;
        case 'auth/user-not-found':
          setError('کاربری با این شماره موبایل یافت نشد. لطفاً ابتدا ثبت‌نام کنید.');
          break;
        case 'auth/wrong-password':
          setError('رمز عبور اشتباه است.');
          break;
        default:
          setError('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-100";
  const buttonStyle = "w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 text-transparent bg-clip-text mb-4">
          ایده‌پرداز
        </h1>
        <p className="text-slate-300 text-lg mb-8">
            {isRegisterMode ? 'حساب کاربری جدید خود را بسازید' : 'به دنیای ایده‌های خود خوش آمدید'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegisterMode && (
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputStyle}
                required
              />
          )}
          <input
            type="tel"
            placeholder="شماره موبایل (مثال: 0912...)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className={`${inputStyle} text-left`}
            style={{ direction: 'ltr' }}
            required
          />
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputStyle} text-left`}
            style={{ direction: 'ltr' }}
            required
          />
          <button type="submit" disabled={loading} className={buttonStyle}>
            {loading ? <i className="ph-bold ph-circle-notch animate-spin text-2xl"></i> : (isRegisterMode ? 'ثبت‌نام' : 'ورود')}
          </button>
        </form>

        <button 
            type="button" 
            onClick={() => { setRegisterMode(!isRegisterMode); setError(''); }} 
            className="text-slate-400 text-sm mt-6 hover:text-white transition-colors"
        >
            {isRegisterMode ? 'حساب کاربری دارید؟ وارد شوید' : 'حساب کاربری ندارید؟ ثبت‌نام کنید'}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;
