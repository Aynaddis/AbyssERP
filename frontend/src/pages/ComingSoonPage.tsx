interface ComingSoonPageProps {
    title: string;
    day: string;
}

export default function ComingSoonPage({ title, day }: ComingSoonPageProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-2">
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-[var(--color-muted)]">
                Coming on <span className="text-[var(--color-accent)] font-medium">{day}</span> of the build plan.
            </p>
        </div>
    );
}