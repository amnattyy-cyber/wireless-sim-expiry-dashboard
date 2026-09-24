import "@fontsource/noto-sans-thai/thai-400.css";
import "@fontsource/noto-sans-thai/latin-400.css";
import "@fontsource/noto-sans-thai/thai-500.css";
import "@fontsource/noto-sans-thai/latin-500.css";
import "@fontsource/noto-sans-thai/thai-600.css";
import "@fontsource/noto-sans-thai/latin-600.css";
import "@fontsource/noto-sans-thai/thai-700.css";
import "@fontsource/noto-sans-thai/latin-700.css";
import "@fontsource/noto-sans-thai/thai-800.css";
import "@fontsource/noto-sans-thai/latin-800.css";
import "../src/styles.css";

export const metadata = {
  title: "Wire & Wireless — SIM Expiry Dashboard",
  description: "แดชบอร์ดติดตามวันหมดอายุของ SIM Prepay ทั้ง 15 พื้นที่",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
