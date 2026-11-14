import React, { useEffect, useState, useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api/admin`;

const api = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
};

const date = (d) => (d ? new Date(d).toLocaleDateString() : '-');
const link = (u) =>
    u ? (
        <a href={u} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">
            Open
        </a>
    ) : (
        '-'
    );

const COMMON = [
    { label: 'Name', render: (u) => u.fullName },
    { label: 'Email', render: (u) => u.email },
    { label: 'Born', render: (u) => date(u.dateOfBirth) },
    { label: 'Verified', render: (u) => (u.isVerified ? 'Yes' : 'No') },
    { label: 'Signed up', render: (u) => date(u.signedUpAt) },
];
const COLUMNS = {
    jobseekers: [
        ...COMMON,
        { label: 'Phone', render: (u) => u.phone || '-' },
        { label: 'CV', render: (u) => link(u.cv) },
        { label: 'LinkedIn', render: (u) => link(u.linkedinUrl) },
        { label: 'GitHub', render: (u) => link(u.githubUrl) },
    ],
    recruiters: [
        ...COMMON,
        { label: 'Company', render: (u) => u.companyName || '-' },
        { label: 'Size', render: (u) => u.companySize || '-' },
        { label: 'Website', render: (u) => link(u.companyWebsite) },
        { label: 'Hired', render: (u) => u.totalHired ?? 0 },
    ],
};

const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500';
const btnCls =
    'w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50';

const Card = ({ children }) => (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg">{children}</div>
    </div>
);

const UserList = ({ type, onUnauthorized }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ users: [], pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => setPage(1), [type, search]);

    useEffect(() => {
        let stale = false;
        setLoading(true);
        const t = setTimeout(async () => {
            const r = await api(`/${type}?page=${page}&search=${encodeURIComponent(search)}`);
            if (stale) return;
            setLoading(false);
            if (r.status === 401) return onUnauthorized();
            if (r.ok) setData(r.data);
        }, 300);
        return () => {
            stale = true;
            clearTimeout(t);
        };
    }, [type, page, search, onUnauthorized]);

    const cols = COLUMNS[type];
    // While loading, render placeholder rows in place of the real ones.
    const rows = loading ? Array.from({ length: 5 }, (_, i) => ({ _id: `sk${i}` })) : data.users;
    const bar = <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-gray-200" />;
    const cell = (c, u) => (loading ? bar : c.render(u));
    return (
        <div className="space-y-3">
            <input
                className={inputCls}
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Phones: one card per user. md and up: a table. */}
            <div className="space-y-3 md:hidden">
                {rows.map((u) => (
                    <div key={u._id} className="space-y-1 rounded-xl bg-white p-4 text-sm shadow">
                        {cols.map((c) => (
                            <div key={c.label} className="flex justify-between gap-3">
                                <span className="text-gray-500">{c.label}</span>
                                <span className="break-all text-right">{cell(c, u)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="hidden overflow-x-auto rounded-xl bg-white shadow md:block">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            {cols.map((c) => (
                                <th key={c.label} className="whitespace-nowrap px-3 py-2">{c.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((u) => (
                            <tr key={u._id} className="border-t">
                                {cols.map((c) => (
                                    <td key={c.label} className="px-3 py-2">{cell(c, u)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && data.users.length === 0 && <p className="py-6 text-center text-gray-500">No users found.</p>}
            <div className="flex items-center justify-between">
                <button className="rounded-lg bg-white px-3 py-2 shadow disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Prev
                </button>
                <span className="text-sm text-gray-600">
                    Page {page} of {data.pages || 1} ({data.total})
                </span>
                <button className="rounded-lg bg-white px-3 py-2 shadow disabled:opacity-40" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ email, onLogout, onUnauthorized }) => {
    const [stats, setStats] = useState(null);
    const [tab, setTab] = useState('jobseekers');

    useEffect(() => {
        api('/overview').then((r) => (r.status === 401 ? onUnauthorized() : r.ok && setStats(r.data)));
    }, [onUnauthorized]);

    const stat = (label, value, sub) => (
        <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-3xl font-bold">{value ?? '-'}</div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-bold sm:text-2xl">Admin</h1>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="break-all text-gray-600">{email}</span>
                        <button className="rounded-lg bg-gray-800 px-3 py-2 text-white" onClick={onLogout}>
                            Log out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {stat('Total users', stats?.totalUsers)}
                    {stat('Job seekers', stats?.jobSeekers.total, stats && `${stats.jobSeekers.verified} verified`)}
                    {stat('Recruiters', stats?.recruiters.total, stats && `${stats.recruiters.verified} verified`)}
                </div>

                <div className="flex gap-2">
                    {[['jobseekers', 'Job Seekers'], ['recruiters', 'Recruiters']].map(([k, label]) => (
                        <button
                            key={k}
                            onClick={() => setTab(k)}
                            className={`flex-1 rounded-lg px-4 py-2 font-semibold sm:flex-none ${tab === k ? 'bg-indigo-600 text-white' : 'bg-white shadow'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <UserList type={tab} onUnauthorized={onUnauthorized} />
            </div>
        </div>
    );
};

const AdminPage = () => {
    const [stage, setStage] = useState('loading'); // loading | login | otp | dashboard
    const [adminEmail, setAdminEmail] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [challenge, setChallenge] = useState('');
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);

    const toLogin = useCallback(() => {
        setStage('login');
        setOtp('');
        setChallenge('');
        setForm({ email: '', password: '' });
    }, []);

    useEffect(() => {
        api('/me').then((r) => {
            if (r.ok) {
                setAdminEmail(r.data.email);
                setStage('dashboard');
            } else setStage('login');
        });
    }, []);

    const submit = (fn) => async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg('');
        await fn();
        setBusy(false);
    };

    const login = submit(async () => {
        const r = await api('/login', { method: 'POST', body: JSON.stringify(form) });
        if (r.ok) {
            setChallenge(r.data.challengeToken);
            setForm({ email: form.email, password: '' });
            setStage('otp');
        } else setMsg(r.data.message || 'Login failed');
    });

    const verify = submit(async () => {
        const r = await api('/verify-otp', { method: 'POST', body: JSON.stringify({ challengeToken: challenge, otp }) });
        if (r.ok) {
            setAdminEmail(r.data.email);
            setStage('dashboard');
        } else {
            setMsg(r.data.message || 'Verification failed');
            // A voided code needs a fresh login.
            if (r.status === 401) setTimeout(toLogin, 2500);
        }
    });

    const resend = async () => {
        const r = await api('/resend-otp', { method: 'POST', body: JSON.stringify({ challengeToken: challenge }) });
        setMsg(r.data.message || 'Could not resend');
    };

    const logout = async () => {
        await api('/logout', { method: 'POST' });
        toLogin();
    };

    if (stage === 'loading') return <Card><p className="text-center text-gray-500">Loading...</p></Card>;
    if (stage === 'dashboard') return <Dashboard email={adminEmail} onLogout={logout} onUnauthorized={toLogin} />;

    if (stage === 'otp')
        return (
            <Card>
                <form onSubmit={verify} className="space-y-4">
                    <h1 className="text-xl font-bold">Enter code</h1>
                    <p className="text-sm text-gray-600">We emailed a 6-digit code to {form.email}.</p>
                    <input
                        className={`${inputCls} text-center tracking-widest`}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    {msg && <p className="text-sm text-red-600">{msg}</p>}
                    <button className={btnCls} disabled={busy || otp.length !== 6}>Verify</button>
                    <button type="button" className="w-full text-sm text-indigo-600" onClick={resend}>Resend code</button>
                </form>
            </Card>
        );

    return (
        <Card>
            <form onSubmit={login} className="space-y-4">
                <h1 className="text-xl font-bold">Admin login</h1>
                <input className={inputCls} type="email" placeholder="Email" autoComplete="username" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className={inputCls} type="password" placeholder="Password" autoComplete="current-password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                {msg && <p className="text-sm text-red-600">{msg}</p>}
                <button className={btnCls} disabled={busy}>Continue</button>
            </form>
        </Card>
    );
};

export default AdminPage;
