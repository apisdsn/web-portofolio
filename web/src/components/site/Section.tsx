interface Props {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ id, number, title, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4 border-t border-line">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-6 py-16 sm:py-20">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[13px] text-accent">{number}</span>
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-[32px]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
