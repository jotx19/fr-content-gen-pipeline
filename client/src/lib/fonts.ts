import { Bricolage_Grotesque, Inter, Nunito, Playfair_Display } from 'next/font/google';

export const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** Opt-in only — add `font-bricolage` where needed */
export const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage-face',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

/** Opt-in only — add `nunito.variable` + `font-nunito` where needed */
export const nunito = Nunito({
  variable: '--font-nunito-face',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});
