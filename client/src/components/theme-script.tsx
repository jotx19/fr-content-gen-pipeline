/** Runs before paint — avoids theme flash; keeps script out of client component tree (React 19). */
export function ThemeScript() {
  const script = `(function(){try{var k='fringo-theme',t=localStorage.getItem(k)||'light';if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;}catch(e){}})();`;

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
