import { Inter, Bokor } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });
const bokor = Bokor({ 
  weight: '400',
  subsets: ['latin'] 
});

export const metadata = {
  title: 'Heavy Helms',
  description: 'A medieval combat game',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
