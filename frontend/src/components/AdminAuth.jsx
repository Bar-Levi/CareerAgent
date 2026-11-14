import React, { useEffect, useRef, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

// Same look as the public auth pages: indigo/purple gradient, glowing orbs, grid, glass card.
export const AuthShell = ({ step, children }) => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 p-4">
        <style>{'@keyframes admin-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}'}</style>
        <div
            className="absolute inset-0 opacity-40"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(50,138,241,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(50,138,241,.15) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
            }}
        />
        <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-float rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 animate-pulse rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl" />

        <div className="relative z-10 w-full max-w-md animate-slide-in rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
                <div className="relative mb-3">
                    <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                </div>
                <h1 className="font-heading text-3xl font-extrabold text-gray-800">
                    Career
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Agent</span>
                </h1>
                <span className="mt-1 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-indigo-700">
                    Admin access
                </span>
                {step && (
                    <div className="mt-4 flex w-24 gap-1.5">
                        {[1, 2].map((n) => (
                            <div
                                key={n}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                    n <= step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
            {children}
        </div>
    </div>
);

const Message = ({ text, kind = 'error' }) =>
    text ? (
        <p
            key={text}
            role="alert"
            className={`rounded-lg px-3 py-2 text-sm ${kind === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
            style={kind === 'error' ? { animation: 'admin-shake .4s' } : undefined}
        >
            {text}
        </p>
    ) : null;

const SubmitButton = ({ busy, disabled, children }) => (
    <button
        disabled={busy || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
        {busy && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
    </button>
);

const Field = ({ icon: Icon, right, ...props }) => (
    <div className="group relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" />
        <input
            {...props}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-11 text-base text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        />
        {right}
    </div>
);

export const LoginStep = ({ form, setForm, onSubmit, busy, msg }) => {
    const [show, setShow] = useState(false);
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-center text-gray-600">Sign in to continue</p>
            <Field
                icon={Mail}
                type="email"
                placeholder="Email"
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
            />
            <Field
                icon={Lock}
                type={show ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                right={
                    <button
                        type="button"
                        aria-label={show ? 'Hide password' : 'Show password'}
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                    >
                        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                }
            />
            <Message text={msg} />
            <SubmitButton busy={busy}>{busy ? 'Checking...' : 'Continue'}</SubmitButton>
        </form>
    );
};

const EMPTY = ['', '', '', '', '', ''];

// onSubmit(code) fires by itself when the 6th digit is entered.
export const OtpStep = ({ email, onSubmit, onResend, onBack, busy, msg, info }) => {
    const [digits, setDigits] = useState(EMPTY);
    const [cooldown, setCooldown] = useState(60); // a code was just sent
    const refs = useRef([]);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // A rejected code: clear the boxes and start again.
    useEffect(() => {
        if (msg) {
            setDigits(EMPTY);
            refs.current[0]?.focus();
        }
    }, [msg]);

    useEffect(() => refs.current[0]?.focus(), []);

    const update = (next) => {
        setDigits(next);
        if (next.every(Boolean)) onSubmit(next.join(''));
    };

    const change = (i, v) => {
        const d = v.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = d;
        update(next);
        if (d && i < 5) refs.current[i + 1]?.focus();
    };

    const keyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
        if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
    };

    const paste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = EMPTY.map((_, i) => text[i] || '');
        update(next);
        refs.current[Math.min(text.length, 5)]?.focus();
    };

    const resend = async () => {
        if (await onResend()) setCooldown(60);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (digits.every(Boolean)) onSubmit(digits.join(''));
            }}
            className="space-y-4"
        >
            <p className="text-center text-gray-600">
                Enter the 6-digit code sent to <span className="break-all font-semibold text-gray-800">{email}</span>
            </p>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={paste}>
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => (refs.current[i] = el)}
                        value={d}
                        onChange={(e) => change(i, e.target.value)}
                        onKeyDown={(e) => keyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        aria-label={`Digit ${i + 1}`}
                        disabled={busy}
                        className={`h-12 min-w-0 max-w-[3rem] flex-1 rounded-xl border text-center text-2xl font-bold text-gray-800 transition-all duration-200 focus:scale-110 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 sm:h-14 ${
                            d ? 'border-indigo-400 bg-white' : 'border-gray-300 bg-gray-50'
                        }`}
                    />
                ))}
            </div>
            <Message text={msg} />
            <Message text={info} kind="info" />
            <SubmitButton busy={busy} disabled={!digits.every(Boolean)}>
                {busy ? 'Verifying...' : 'Verify'}
            </SubmitButton>
            <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                    type="button"
                    onClick={resend}
                    disabled={cooldown > 0}
                    className="font-semibold text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
            </div>
        </form>
    );
};
