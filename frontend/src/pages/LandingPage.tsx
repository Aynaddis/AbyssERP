import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    ShoppingCart,
    Package,
    Receipt,
    Wallet,
    ShieldCheck,
    Bell,
    ClipboardList,
    FileText,
    UserPlus,
    Moon,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const moduleFlow = [
    { icon: ShoppingCart, title: 'Purchasing', copy: 'Order stock from suppliers, track every PO from pending to received.' },
    { icon: Package, title: 'Inventory', copy: 'Stock levels update the moment a PO lands or a sale closes.' },
    { icon: Receipt, title: 'Sales', copy: 'Ring up a sale, generate the invoice, watch stock update instantly.' },
    { icon: Wallet, title: 'Finance', copy: 'Every sale and purchase lands in the ledger automatically.' },
];

const features = [
    { icon: ShieldCheck, title: 'Role-based access', copy: 'Admin, Manager, and Staff each see exactly the tools their job needs.' },
    { icon: Bell, title: 'Low-stock alerts', copy: "Get notified when an item is running low, before it's gone." },
    { icon: ClipboardList, title: 'Automatic activity log', copy: 'Every sale, purchase, and account change is recorded.' },
    { icon: FileText, title: 'PDF invoices', copy: 'A clean, downloadable invoice is ready the moment a sale closes.' },
    { icon: UserPlus, title: 'Employee onboarding', copy: 'Add someone to the team and their login lands in their inbox.' },
    { icon: Moon, title: 'Dark mode', copy: 'Because nobody wants a blinding white screen doing the books at 11pm.' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
};

export default function LandingPage() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const primaryCtaTo = isAuthenticated ? '/dashboard' : '/register';
    const primaryCtaLabel = isAuthenticated ? 'Go to dashboard' : 'Get started free';

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
            {/* ── Nav ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
                    <span className="font-display font-bold text-lg tracking-tight">
                        Abyss<span className="text-gradient">ERP</span>
                    </span>
                    <nav className="flex items-center gap-2 sm:gap-4">
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                className="hidden sm:inline text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors px-3 py-2"
                            >
                                Sign in
                            </Link>
                        )}
                        <Link
                            to={primaryCtaTo}
                            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white text-sm font-semibold px-4 py-2 shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 hover:scale-[1.03] transition-all"
                        >
                            {primaryCtaLabel}
                            <ArrowRight size={15} />
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <section className="relative">
                <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                    <div className="animate-blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-accent)]/25 blur-[100px]" />
                    <div className="animate-blob-slow absolute top-10 right-0 h-[28rem] w-[28rem] rounded-full bg-[var(--color-accent-2)]/20 blur-[110px]" />
                </div>

                <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-24 text-center">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div
                            variants={fadeUp}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/60 backdrop-blur px-3 py-1 text-xs font-semibold text-[var(--color-accent)] mb-5"
                        >
                            <Sparkles size={13} />
                            Business operations, unified
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            transition={{ duration: 0.55 }}
                            className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] tracking-tight mb-5"
                        >
                            Run the whole business{' '}
                            <span className="text-gradient">from one place.</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            transition={{ duration: 0.55 }}
                            className="text-base sm:text-lg text-[var(--color-muted)] max-w-lg mx-auto mb-7"
                        >
                            AbyssERP tracks stock, sales, purchasing, and payroll in a single system — so
                            nothing falls through the cracks between spreadsheets.
                        </motion.p>

                        <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                to={primaryCtaTo}
                                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white text-sm font-semibold px-6 py-3.5 shadow-xl shadow-[var(--color-accent)]/25 hover:shadow-2xl hover:shadow-[var(--color-accent)]/40 hover:scale-[1.03] transition-all"
                            >
                                {primaryCtaLabel}
                                <ArrowRight size={16} />
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="rounded-full border border-[var(--color-border)] text-sm font-semibold px-6 py-3.5 hover:bg-[var(--color-panel-2)] transition-colors"
                                >
                                    Sign in
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Module flow ─────────────────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-xl mx-auto mb-16"
                >
                    <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight mb-3">
                        One flow, <span className="text-gradient">start to finish</span>
                    </h2>
                    <p className="text-[var(--color-muted)]">
                        Stock and money move through the same four steps in every business. AbyssERP keeps
                        them connected instead of living in four different tools.
                    </p>
                </motion.div>

                <div className="relative">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                        className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-2)] to-[var(--color-accent)]"
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
                    >
                        {moduleFlow.map((m) => (
                            <motion.div
                                key={m.title}
                                variants={fadeUp}
                                transition={{ duration: 0.45 }}
                                whileHover={{ y: -4 }}
                                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 hover:shadow-xl hover:shadow-[var(--color-accent)]/5 transition-shadow"
                            >
                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-accent)]/20">
                                    <m.icon size={19} className="text-white" />
                                </div>
                                <h3 className="font-semibold mb-1.5">{m.title}</h3>
                                <p className="text-sm text-[var(--color-muted)]">{m.copy}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-xl mx-auto mb-16"
                >
                    <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight mb-3">
                        Everything the <span className="text-gradient">day-to-day needs</span>
                    </h2>
                    <p className="text-[var(--color-muted)]">
                        Every feature here solves one specific, recurring annoyance of running a small
                        business.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {features.map((f) => (
                        <motion.div
                            key={f.title}
                            variants={fadeUp}
                            transition={{ duration: 0.4 }}
                            whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
                            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-xl bg-[var(--color-panel-2)] flex items-center justify-center mb-3.5">
                                <f.icon size={18} className="text-[var(--color-accent)]" />
                            </div>
                            <h3 className="font-semibold mb-1.5">{f.title}</h3>
                            <p className="text-sm text-[var(--color-muted)]">{f.copy}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── Trust strip ─────────────────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="grid sm:grid-cols-3 gap-6"
                >
                    {[
                        { title: 'Encrypted by default', copy: 'Passwords are hashed, never stored in plain text.' },
                        { title: 'Nothing happens quietly', copy: 'Every change is logged — you can answer "who did what, and when."' },
                        { title: 'Scales with the team', copy: 'Role-based permissions from day one, not bolted on later.' },
                    ].map((t) => (
                        <motion.div key={t.title} variants={fadeUp} transition={{ duration: 0.4 }} className="text-center sm:text-left">
                            <CheckCircle2 size={18} className="text-[var(--color-accent)] mb-2 mx-auto sm:mx-0" />
                            <h3 className="font-semibold text-sm mb-1.5">{t.title}</h3>
                            <p className="text-sm text-[var(--color-muted)]">{t.copy}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── CTA band ────────────────────────────────────────────────── */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-3xl overflow-hidden px-6 sm:px-12 py-14 text-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)]"
                >
                    <div className="pointer-events-none absolute inset-0 opacity-20">
                        <div className="animate-blob absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white blur-[80px]" />
                        <div className="animate-blob-slow absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white blur-[80px]" />
                    </div>
                    <div className="relative">
                        <h2 className="font-display font-bold text-2xl sm:text-4xl tracking-tight mb-3 text-white">
                            Ready to get organized?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-md mx-auto">
                            Set up takes a few minutes. Your first admin account is free.
                        </p>
                        <Link
                            to={primaryCtaTo}
                            className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--color-text)] text-sm font-semibold px-6 py-3.5 shadow-xl hover:scale-[1.03] transition-transform"
                        >
                            {primaryCtaLabel}
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="border-t border-[var(--color-border)] pt-14 pb-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        <div>
                            <span className="font-display font-bold text-lg">
                                Abyss<span className="text-gradient">ERP</span>
                            </span>
                            <p className="text-sm text-[var(--color-muted)] mt-3 max-w-[220px]">
                                Stock, sales, purchasing, and payroll — run from one place.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Pricing</a></li>
                                <li><Link to="/login" className="hover:text-[var(--color-accent)] transition-colors">Sign in</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[var(--color-accent)] transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                        &copy; {new Date().getFullYear()} AbyssERP. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}