
export function Footer() {

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <div className="footer-brand-row">
            <img src="/icon.png" alt="Ledgerly" className="footer-logo" />
            <span className="footer-brand font-serif">Ledgerly</span>
          </div>
          <p className="footer-desc">
            Smart Spending & Savings Tracker. Developed by Group 6.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="copyright-text">
          © {new Date().getFullYear()} Ledgerly. Hosted by Group 6.
        </span>


      </div>
    </footer>
  );
}
