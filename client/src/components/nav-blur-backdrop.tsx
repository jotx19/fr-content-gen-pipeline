const NAV_BLUR_MASK =
  'linear-gradient(to bottom, black 0%, black 0%, rgba(0,0,0,0.35) 82%, transparent 100%)';

/** Frosted nav fade — shared by landing + app navbars */
export function NavBlurBackdrop() {
  return (
    <div
      className="absolute inset-0 bg-background/20 backdrop-blur-xl"
      style={{
        WebkitMaskImage: NAV_BLUR_MASK,
        maskImage: NAV_BLUR_MASK,
      }}
    />
  );
}
