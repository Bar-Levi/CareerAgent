import React, { useEffect, useRef, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const STEPS = {
    1: ['Sign in', 'Restricted area. Authorized administrators only.'],
    2: ['Two-step verification', null],
};

const Brand = ({ className = '' }) => (
    <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <ShieldCheck className="h-5 w-5 text-zinc-200" />
        </div>
        <span className="font-heading text-lg font-semibold tracking-tight text-zinc-100">
            CareerAgent <span className="font-normal text-zinc-500">Admin</span>
        </span>
    </div>
);

// Dark, neutral surfaces with one muted accent, used only for the primary action and focus.
export const AuthShell = ({ step, children }) => {
    const [title, subtitle] = STEPS[step] || [];
    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
            <style>{'@keyframes admin-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}'}</style>
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,.14), transparent 70%)' }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                    WebkitMaskImage: 'radial-gradient(70% 60% at 50% 30%, #000, transparent)',
                    maskImage: 'radial-gradient(70% 60% at 50% 30%, #000, transparent)',
                }}
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8">
                <div className="w-full max-w-md animate-fade-in-fast sm:max-w-lg">
                    <Brand className="mb-8 justify-center" />
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
                        {title && (
                            <div className="mb-8">
                                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                                    Step {step} of 2
                                </p>
                                <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">{title}</h1>
                                {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
                            </div>
                        )}
                        {children}
                    </div>
                    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Encrypted connection
                    </p>
                </div>
            </div>
        </div>
    );
};
const Message = ({ text, kind = 'error' }) =>
    text ? (
        <p
            key={text}
            role="alert"
            className={`rounded-lg border px-3 py-2 text-sm ${
                kind === 'error'
                    ? 'border-red-500/20 bg-red-500/10 text-red-300'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            }`}
            style={kind === 'error' ? { animation: 'admin-shake .35s' } : undefined}
        >
            {text}
        </p>
    ) : null;

const SubmitButton = ({ busy, disabled, children }) => (
    <button
        disabled={busy || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
    >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
    </button>
);

const Field = ({ label, icon: Icon, right, id, ...props }) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-400">
            {label}
        </label>
        <div className="group relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300" />
            <input
                id={id}
                {...props}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/70 py-2.5 pl-10 pr-10 text-base text-zinc-100 placeholder-zinc-600 transition-colors focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:text-sm"
            />
            {right}
        </div>
    </div>
);

export const LoginStep = ({ form, setForm, onSubmit, busy, msg }) => {
    const [show, setShow] = useState(false);
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Field
                id="admin-email"
                label="Email"
                icon={Mail}
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
            />
            <Field
                id="admin-password"
                label="Password"
                icon={Lock}
                type={show ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                right={
                    <button
                        type="button"
                        aria-label={show ? 'Hide password' : 'Show password'}
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
        update(EMPTY.map((_, i) => text[i] || ''));
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
            className="space-y-5"
        >
            <p className="text-sm text-zinc-400">
                Enter the 6-digit code sent to <span className="break-all font-medium text-zinc-200">{email}</span>. It expires in 5 minutes.
            </p>
            <div className="flex justify-between gap-2" onPaste={paste}>
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
                        className={`h-12 min-w-0 flex-1 rounded-lg border bg-zinc-950/70 text-center text-xl font-semibold text-zinc-100 transition-colors focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 sm:h-14 ${
                            d ? 'border-white/30' : 'border-white/10'
                        }`}
                    />
                ))}
            </div>
            <Message text={msg} />
            <Message text={info} kind="info" />
            <SubmitButton busy={busy} disabled={!digits.every(Boolean)}>
                {busy ? 'Verifying...' : 'Verify and continue'}
            </SubmitButton>
            <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={onBack} className="flex items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                    type="button"
                    onClick={resend}
                    disabled={cooldown > 0}
                    className="font-medium text-indigo-300 transition-colors hover:text-indigo-200 disabled:cursor-not-allowed disabled:text-zinc-600"
                >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
            </div>
        </form>
    );
};
