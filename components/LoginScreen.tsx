import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

const LoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<firebase.auth.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Make sure reCAPTCHA is only initialized once
    if (!(window as any).recaptchaVerifier) {
      // The `firebase` global is available from the CDN script
      (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhoneNumber(input);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format phone number to E.164 format (e.g., +989123456789)
    // IMPORTANT: This assumes Iranian numbers. Adjust the prefix if needed.
    const formattedPhoneNumber = `+98${phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}`;
    
    if (formattedPhoneNumber.length < 12) {
        setError('لطفاً یک شماره تلفن معتبر وارد کنید.');
        setLoading(false);
        return;
    }

    try {
      const verifier = (window as any).recaptchaVerifier;
      const result = await auth.signInWithPhoneNumber(formattedPhoneNumber, verifier);
      setConfirmationResult(result);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      setError('خطا در ارتباط با سرور. لطفاً از صحت تنظیمات پروژه Firebase (مانند Authorized Domains) اطمینان حاصل کرده و دوباره تلاش کنید.');
      // Reset reCAPTCHA if it fails. The `grecaptcha` global is from the reCAPTCHA script.
      if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otp) return;
    setError('');
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      // User is signed in automatically by onAuthStateChanged listener in App.tsx
      if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError('کد تایید نامعتبر است.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full text-center tracking-[.2em] p-3 bg-slate-900/50 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-slate-100 text-lg";
  const buttonStyle = "w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 text-transparent bg-clip-text mb-4">
          ایده‌پرداز
        </h1>
        <p className="text-slate-300 text-lg mb-8">به دنیای ایده‌های خود خوش آمدید</p>
        
        {!confirmationResult ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="tel"
              placeholder="شماره موبایل (مثال: 0912...)"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={inputStyle}
              style={{ direction: 'ltr' }}
              required
            />
            <button type="submit" disabled={loading} className={buttonStyle}>
              {loading ? <i className="ph-bold ph-circle-notch animate-spin text-2xl"></i> : 'دریافت کد تایید'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             <p className="text-slate-400">کد ۶ رقمی ارسال شده را وارد کنید.</p>
            <input
              type="text"
              inputMode='numeric'
              placeholder="- - - - - -"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={inputStyle}
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading} className={buttonStyle}>
               {loading ? <i className="ph-bold ph-circle-notch animate-spin text-2xl"></i> : 'ورود به برنامه'}
            </button>
            <button type="button" onClick={() => { setConfirmationResult(null); setError(''); }} className="text-slate-400 text-sm mt-4 hover:text-white">
                ویرایش شماره
            </button>
          </form>
        )}

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default LoginScreen;