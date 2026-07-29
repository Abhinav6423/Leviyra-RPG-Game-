import React, { useState, useEffect, useCallback } from 'react';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../firebase.js";
import { useAuth } from "../../context/Authcontext.jsx";

// ── Toast System ──────────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
    <div style={{
        position: 'fixed', top: '24px', right: '24px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px'
    }}>
        {toasts.map(t => (
            <div key={t.id} onClick={() => removeToast(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 18px', borderRadius: '12px', cursor: 'pointer',
                backdropFilter: 'blur(12px)', minWidth: '280px', maxWidth: '360px',
                animation: 'slideIn 0.3s ease',
                background: t.type === 'success' ? 'rgba(0,210,120,0.12)' :
                    t.type === 'error' ? 'rgba(255,80,80,0.12)' :
                        'rgba(0,210,255,0.12)',
                border: `1px solid ${t.type === 'success' ? 'rgba(0,210,120,0.3)' :
                    t.type === 'error' ? 'rgba(255,80,80,0.3)' :
                        'rgba(0,210,255,0.3)'
                    }`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
                <span style={{ fontSize: '18px' }}>
                    {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
                </span>
                <span style={{
                    color: t.type === 'success' ? '#00d278' :
                        t.type === 'error' ? '#ff5050' : '#00d2ff',
                    fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500
                }}>{t.message}</span>
            </div>
        ))}
    </div>
);

const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
    }, []);
    const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
    return { toasts, addToast, removeToast };
};

// ── Eye Icon ──────────────────────────────────────────────────
const EyeIcon = ({ show }) => show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// ── Input Field ───────────────────────────────────────────────
const InputField = ({ label, labelRight, name, type, placeholder, value, onChange, showToggle, onToggle, showPass }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{
                color: '#00d2ff', fontSize: '12px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif"
            }}>{label}</label>
            {labelRight && labelRight}
        </div>
        <div style={{ position: 'relative' }}>
            <input
                type={showToggle ? (showPass ? 'text' : 'password') : type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '14px 44px 14px 16px',
                    color: '#e2e8f0', fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => {
                    e.target.style.borderColor = 'rgba(0,210,255,0.5)';
                    e.target.style.background = 'rgba(0,210,255,0.05)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,210,255,0.08)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.background = 'rgba(255,255,255,0.04)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {showToggle && (
                <button type="button" onClick={onToggle} style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#4b5563',
                    display: 'flex', alignItems: 'center', padding: 0,
                    transition: 'color 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00d2ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                >
                    <EyeIcon show={showPass} />
                </button>
            )}
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────
const LoginPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toasts, addToast, removeToast } = useToast();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (user) navigate("/home"); }, [user, navigate]);

    const handleChange = (e) =>
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCred = await signInWithEmailAndPassword(
                auth, formData.email, formData.password
            );

            if (!userCred.user.emailVerified) {
                await auth.signOut();
                addToast("Please verify your email before logging in.", "error", 5000);
                setLoading(false);
                return;
            }
            // AuthContext handles redirect

        } catch (err) {
            const msg =
                err.code === 'auth/user-not-found' ? "No account found with this email." :
                    err.code === 'auth/wrong-password' ? "Incorrect password. Try again." :
                        err.code === 'auth/invalid-email' ? "Invalid email address." :
                            err.code === 'auth/too-many-requests' ? "Too many attempts. Try again later." :
                                "Invalid email or password.";
            addToast(msg, "error");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            addToast("Google login failed. Please try again.", "error");
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            @keyframes toastIn { from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
            @keyframes pulse   { 0%,100%{opacity:.5} 50%{opacity:1} }
            input::placeholder { color: rgba(255,255,255,0.18) !important; }
            input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0f1117 inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
            .glow-btn:hover { box-shadow: 0 0 24px rgba(139,92,246,0.4) !important; transform: translateY(-1px) !important; }
            .glow-btn:active { transform: translateY(0) !important; }
            .ghost-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.18) !important; }
            .link-hover:hover { color: #a78bfa !important; }
        `}</style>

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div style={{
                display: 'flex', minHeight: '100vh', width: '100%',
                background: '#080a0f', fontFamily: "'Inter',sans-serif", overflow: 'hidden'
            }}>
                {/* ── Left Panel ── */}
                <div className="hidden md:block" style={{ width: '48%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: "url('https://i.pinimg.com/1200x/3c/83/3d/3c833d7b8cbbaef7461020461b7e5461.jpg')",
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        filter: 'brightness(0.55)'
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to right, transparent 60%, #080a0f 100%), linear-gradient(to top, #080a0f 0%, transparent 40%)'
                    }} />
                    <div style={{
                        position: 'absolute', top: '36px', left: '36px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 14px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)'
                    }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', fontWeight: 500 }}>LIVE UNIVERSE</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '48px', left: '44px', right: '44px' }}>
                        <div style={{ width: '32px', height: '2px', background: '#8b5cf6', borderRadius: '2px', marginBottom: '20px' }} />
                        <p style={{
                            fontSize: '34px', fontWeight: 600, color: '#fff', lineHeight: 1.25,
                            margin: '0 0 14px', letterSpacing: '-0.03em',
                            textShadow: '0 2px 30px rgba(0,0,0,0.6)'
                        }}>
                            Welcome back.<br />
                            <span style={{
                                background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>Your story awaits.</span>
                        </p>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 300 }}>
                            Sign in to continue where you left off.
                        </p>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '40px 24px', position: 'relative',
                    background: 'linear-gradient(135deg, #0d0f16 0%, #080a0f 100%)',
                }}>
                    <div style={{
                        position: 'absolute', top: '20%', right: '8%',
                        width: '280px', height: '280px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        width: '100%', maxWidth: '360px', position: 'relative',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease'
                    }}>
                        {/* Header */}
                        <div style={{ marginBottom: '36px' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', borderRadius: '10px', marginBottom: '20px',
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.1))',
                                border: '1px solid rgba(139,92,246,0.25)', fontSize: '18px'
                            }}>✦</div>
                            <h1 style={{
                                fontSize: '24px', fontWeight: 600, color: '#f1f5f9',
                                margin: '0 0 6px', letterSpacing: '-0.04em', lineHeight: 1.2
                            }}>Welcome back</h1>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 300 }}>
                                Sign in to continue your adventure
                            </p>
                        </div>

                        {/* Google */}
                        <button onClick={handleGoogleLogin} disabled={loading} className="ghost-btn"
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                padding: '12px', borderRadius: '10px', marginBottom: '20px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                                color: '#cbd5e1', fontSize: '14px', fontWeight: 500,
                                fontFamily: "'Inter',sans-serif", transition: 'all 0.2s'
                            }}>
                            <svg width="17" height="17" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', fontWeight: 500 }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                            <InputField
                                label="Email" name="email" type="email" placeholder="you@example.com"
                                value={formData.email} onChange={handleChange}
                            />

                            <InputField
                                label="Password" name="password" type="password" placeholder="Enter your password"
                                value={formData.password} onChange={handleChange}
                                showToggle={true} onToggle={() => setShowPass(p => !p)} showPass={showPass}
                                labelRight={
                                    <Link to="/forgot-password" className="link-hover" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}>
                                        Forgot password?
                                    </Link>
                                }
                            />

                            {/* Submit */}
                            <button type="submit" disabled={loading} className="glow-btn"
                                style={{
                                    width: '100%', padding: '13px', borderRadius: '10px', border: 'none', marginTop: '4px',
                                    background: loading ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
                                    fontSize: '14px', fontWeight: 600, fontFamily: "'Inter',sans-serif",
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.25s', letterSpacing: '0.01em',
                                    animation: loading ? 'pulse 1.5s infinite' : 'none'
                                }}>
                                {loading ? "Authenticating..." : "Sign In →"}
                            </button>
                        </form>

                        {/* Footer */}
                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" className="link-hover" style={{ color: '#a78bfa', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;