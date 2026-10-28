// Hand-drawn plate shown when the profile has no avatar.
export function EngineerFigure() {
  return (
    <svg viewBox="0 0 520 420" role="img" aria-labelledby="fig-title" className="block h-auto w-full">
      <title id="fig-title">Illustration of an engineer at a desk, with labelled field marks</title>
      <g fill="none" stroke="#1f3a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 300c0-62 30-104 80-104s80 42 80 104" fill="#6f8a5e" />
        <path d="M205 196l25 30 25-30" fill="#dde5d3" />
        <circle cx="230" cy="150" r="42" fill="#e9c9a3" />
        <path d="M190 140c4-34 26-50 42-50s38 14 40 46" fill="#1f3a2e" />
        <path d="M184 150c0-34 20-62 46-62s46 28 46 62" />
        <rect x="176" y="140" width="14" height="30" rx="6" fill="#a4462b" />
        <rect x="270" y="140" width="14" height="30" rx="6" fill="#a4462b" />
        <path d="M216 160h8M240 160h8" />
        <path d="M222 178q8 5 16 0" />
        <path d="M60 300h400" />
        <path d="M180 300l18-70h112l-18 70z" fill="#f7f9f2" />
        <path d="M150 300h170" />
        <circle cx="245" cy="262" r="5" fill="#e2a93b" stroke="none" />
        <path d="M378 300v-46h36v46z" fill="#e2a93b" />
        <path d="M414 266c14 0 14 22 0 22" />
        <path d="M388 244c-6-10 6-14 0-24M402 244c-6-10 6-14 0-24" strokeWidth="2" />
        <path d="M90 300v80M430 300v80" />
      </g>
      <g fontFamily="Newsreader, Georgia, serif" fontSize="17" fill="#1f3a2e">
        <path d="M276 108l70-40h20" stroke="#1f3a2e" strokeWidth="1.2" fill="none" />
        <text x="370" y="64">Headphones.</text>
        <text x="370" y="84" fontStyle="italic">Do not approach.</text>
        <path d="M160 250l-60-40h-20" stroke="#1f3a2e" strokeWidth="1.2" fill="none" />
        <text x="8" y="196">Hoodie, worn</text>
        <text x="8" y="216" fontStyle="italic">year-round</text>
        <path d="M396 254l40-60h20" stroke="#1f3a2e" strokeWidth="1.2" fill="none" />
        <text x="436" y="168">Mug,</text>
        <text x="436" y="188" fontStyle="italic">empty again</text>
        <path d="M250 300l20 50h30" stroke="#1f3a2e" strokeWidth="1.2" fill="none" />
        <text x="304" y="355">Laptop, 47 tabs open</text>
      </g>
    </svg>
  );
}
