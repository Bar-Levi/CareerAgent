import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { AuthShell, LoginStep, OtpStep } from '../components/AdminAuth';

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
// User-supplied links: only http(s), so a javascript: URL can never run in the admin's session.
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);
const link = (u) =>
    safeUrl(u) ? (
        <a href={safeUrl(u)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">
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

const Sk = ({ className }) => <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;

// Phone layout: a compact card per user, different from the desktop table.
const MOBILE = {
    jobseekers: {
        facts: [
            ['Phone', (u) => u.phone],
            ['Born', (u) => date(u.dateOfBirth)],
            ['Signed up', (u) => date(u.signedUpAt)],
        ],
        links: [['CV', 'cv'], ['LinkedIn', 'linkedinUrl'], ['GitHub', 'githubUrl']],
    },
    recruiters: {
        facts: [
            ['Company', (u) => u.companyName],
            ['Size', (u) => u.companySize],
            ['Hired', (u) => u.totalHired ?? 0],
            ['Signed up', (u) => date(u.signedUpAt)],
        ],
        links: [['Website', 'companyWebsite']],
    },
};

const MobileCard = ({ u, type, onDelete, deletingId }) => {
    const { facts, links } = MOBILE[type];
    const shown = links.filter(([, k]) => safeUrl(u[k]));
    const busy = deletingId === u._id;
    return (
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-white">
                    {(u.fullName || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-gray-800">{u.fullName}</div>
                    <div className="truncate text-xs text-gray-500">{u.email}</div>
                </div>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        u.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                >
                    {u.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <button
                    type="button"
                    aria-label="Delete user"
                    disabled={busy}
                    onClick={() => onDelete(u)}
                    className="shrink-0 rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {facts.map(([label, get]) => {
                    const v = get(u);
                    return (
                        <div key={label} className="min-w-0">
                            <dt className="text-[10px] uppercase tracking-wide text-gray-400">{label}</dt>
                            <dd className="truncate text-gray-800">{v === undefined || v === null || v === '' ? '-' : v}</dd>
                        </div>
                    );
                })}
            </dl>
            {shown.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {shown.map(([label, k]) => (
                        <a
                            key={k}
                            href={safeUrl(u[k])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 active:bg-indigo-100"
                        >
                            {label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

const MobileSkeleton = () => (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-3">
            <Sk className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
                <Sk className="h-4 w-2/3" />
                <Sk className="h-3 w-1/2" />
            </div>
            <Sk className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                    <Sk className="h-2.5 w-1/3" />
                    <Sk className="h-3.5 w-3/4" />
                </div>
            ))}
        </div>
    </div>
);

const UserList = ({ type, onUnauthorized, onChanged }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ users: [], pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

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
    }, [type, page, search, refreshKey, onUnauthorized]);

    const handleDelete = async (u) => {
        if (!window.confirm(`Delete ${u.fullName} (${u.email})? This cannot be undone.`)) return;
        const userType = type === 'recruiters' ? 'Recruiter' : 'JobSeeker';
        setDeletingId(u._id);
        const r = await api(`/users/${userType}/${u._id}`, { method: 'DELETE' });
        setDeletingId(null);
        if (r.status === 401) return onUnauthorized();
        if (r.ok) {
            setRefreshKey((k) => k + 1);
            onChanged();
        } else {
            window.alert(r.data.message || 'Failed to delete user.');
        }
    };

    const cols = COLUMNS[type];
    // Desktop table: placeholder rows while loading.
    const rows = loading ? Array.from({ length: 5 }, (_, i) => ({ _id: `sk${i}` })) : data.users;
    const cell = (c, u) => (loading ? <Sk className="h-4 w-24" /> : c.render(u));
    return (
        <div className="space-y-3">
            <input
                className={inputCls}
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Phones: cards. md and up: a table. */}
            <div className="space-y-3 md:hidden">
                {loading
                    ? [0, 1, 2, 3, 4].map((i) => <MobileSkeleton key={i} />)
                    : data.users.map((u) => <MobileCard key={u._id} u={u} type={type} onDelete={handleDelete} deletingId={deletingId} />)}
            </div>
            <div className="hidden overflow-x-auto rounded-xl bg-white shadow md:block">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            {cols.map((c) => (
                                <th key={c.label} className="whitespace-nowrap px-3 py-2">{c.label}</th>
                            ))}
                            <th className="whitespace-nowrap px-3 py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((u) => (
                            <tr key={u._id} className="border-t">
                                {cols.map((c) => (
                                    <td key={c.label} className="px-3 py-2">{cell(c, u)}</td>
                                ))}
                                <td className="px-3 py-2 text-right">
                                    {loading ? (
                                        <Sk className="ml-auto h-4 w-8" />
                                    ) : (
                                        <button
                                            type="button"
                                            aria-label="Delete user"
                                            disabled={deletingId === u._id}
                                            onClick={() => handleDelete(u)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                                        >
                                            {deletingId === u._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && data.users.length === 0 && <p className="py-6 text-center text-gray-500">No users found.</p>}
            <div className="flex items-center justify-between gap-2">
                <button className="min-h-[44px] rounded-xl bg-white px-4 shadow-sm ring-1 ring-gray-100 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Prev
                </button>
                <span className="text-center text-xs text-gray-600 sm:text-sm">
                    Page {page} of {data.pages || 1}
                    <br className="sm:hidden" /> <span className="text-gray-400">({data.total} total)</span>
                </span>
                <button className="min-h-[44px] rounded-xl bg-white px-4 shadow-sm ring-1 ring-gray-100 disabled:opacity-40" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

const Dashboard = ({ email, onLogout, onUnauthorized }) => {
    const [stats, setStats] = useState(null);
    const [tab, setTab] = useState('jobseekers');

    const loadOverview = useCallback(() => {
        api('/overview').then((r) => (r.status === 401 ? onUnauthorized() : r.ok && setStats(r.data)));
    }, [onUnauthorized]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const stat = (label, value, sub, cls = '') => (
        <div className={`rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:p-4 ${cls}`}>
            <div className="text-xs text-gray-500 sm:text-sm">{label}</div>
            {stats ? <div className="text-2xl font-bold sm:text-3xl">{value}</div> : <Sk className="mt-1 h-8 w-16" />}
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-bold sm:text-2xl">Admin</h1>
                    <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
                        <span className="min-w-0 truncate text-gray-600">{email}</span>
                        <button className="shrink-0 rounded-lg bg-gray-800 px-3 py-2 text-white" onClick={onLogout}>
                            Log out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {stat('Total users', stats?.totalUsers, null, 'col-span-2 sm:col-span-1')}
                    {stat('Job seekers', stats?.jobSeekers.total, stats && `${stats.jobSeekers.verified} verified`)}
                    {stat('Recruiters', stats?.recruiters.total, stats && `${stats.recruiters.verified} verified`)}
                </div>

                <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100 sm:inline-flex">
                    {[['jobseekers', 'Job Seekers'], ['recruiters', 'Recruiters']].map(([k, label]) => (
                        <button
                            key={k}
                            onClick={() => setTab(k)}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-6 ${tab === k ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <UserList type={tab} onUnauthorized={onUnauthorized} onChanged={loadOverview} />
            </div>
        </div>
    );
};

const AdminPage = () => {
    const [stage, setStage] = useState('loading'); // loading | login | otp | dashboard
    const [adminEmail, setAdminEmail] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });
    const [challenge, setChallenge] = useState('');
    const [msg, setMsg] = useState('');
    const [info, setInfo] = useState('');
    const [busy, setBusy] = useState(false);

    const toLogin = useCallback(() => {
        setStage('login');
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
        await run(fn);
    };

    const run = async (fn) => {
        setBusy(true);
        setMsg('');
        setInfo('');
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

    const verify = (otp) =>
        run(async () => {
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

    // Returns true when a new code was sent, so the form can restart its cooldown.
    const resend = async () => {
        const r = await api('/resend-otp', { method: 'POST', body: JSON.stringify({ challengeToken: challenge }) });
        setMsg(r.ok ? '' : r.data.message || 'Could not resend');
        setInfo(r.ok ? 'New code sent.' : '');
        return r.ok;
    };

    const logout = async () => {
        await api('/logout', { method: 'POST' });
        toLogin();
    };

    if (stage === 'loading')
        return (
            <AuthShell>
                <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            </AuthShell>
        );
    if (stage === 'dashboard') return <Dashboard email={adminEmail} onLogout={logout} onUnauthorized={toLogin} />;

    if (stage === 'otp')
        return (
            <AuthShell step={2}>
                <OtpStep email={form.email} onSubmit={verify} onResend={resend} onBack={toLogin} busy={busy} msg={msg} info={info} />
            </AuthShell>
        );

    return (
        <AuthShell step={1}>
            <LoginStep form={form} setForm={setForm} onSubmit={login} busy={busy} msg={msg} />
        </AuthShell>
    );
};

export default AdminPage;
