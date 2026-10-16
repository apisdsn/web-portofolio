/* eslint-disable @next/next/no-img-element -- media is served by the API with long-lived cache headers */

interface Props {
  src: string | null;
  alt: string;
  status: string;
  initials: string;
}

/** Round photo with a thought-bubble status note, as in the design. Sized for desktop; scales down on phones. */
export function AvatarBubble({ src, alt, status, initials }: Props) {
  return (
    <div className="relative h-[234px] w-[180px] shrink-0 sm:h-[364px] sm:w-[280px]">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute left-0 top-[54px] block h-[180px] w-[180px] rounded-full object-cover sm:top-[84px] sm:h-[280px] sm:w-[280px]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute left-0 top-[54px] flex h-[180px] w-[180px] items-center justify-center rounded-full bg-chip font-mono text-4xl font-semibold sm:top-[84px] sm:h-[280px] sm:w-[280px]"
        >
          {initials}
        </div>
      )}
      {status ? (
        <>
          <span
            aria-hidden="true"
            className="absolute left-[35px] top-[50px] h-[30px] w-[30px] rounded-full bg-white shadow-[0_4px_14px_rgba(21,23,26,0.12)] sm:left-[55px] sm:top-[77px] sm:h-[46px] sm:w-[46px]"
          />
          <span
            aria-hidden="true"
            className="absolute left-[58px] top-[77px] h-3 w-3 rounded-full bg-white shadow-[0_3px_8px_rgba(21,23,26,0.16)] sm:left-[90px] sm:top-[119px] sm:h-[18px] sm:w-[18px]"
          />
          <p className="absolute left-[3px] top-0 m-0 flex h-16 w-[175px] items-center justify-center gap-2 rounded-full bg-white px-3 text-center text-[15px] font-medium shadow-[0_6px_20px_rgba(21,23,26,0.12)] sm:left-1 sm:h-[100px] sm:w-[272px] sm:gap-2.5 sm:px-5 sm:text-[22px]">
            <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
            <span>{status}</span>
          </p>
        </>
      ) : null}
    </div>
  );
}
