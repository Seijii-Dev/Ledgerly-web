export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#top" className="footer-brand-row" aria-label="Ledgerly, back to top">
          <img src="/icon.png" alt="" className="footer-logo" />
          <span className="footer-brand">Ledgerly</span>
        </a>
        <p className="footer-desc">A simpler way to understand everyday spending.</p>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Ledgerly · Group 6</span>
        <a href="/privacy.html">Privacy policy</a>
      </div>
    </footer>
  );
}
