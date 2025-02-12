import "./LandingPage.scss";
import spectraLogoWht from "../../assets/images/logos/spectra-logo-white.svg";
import monitoring from "../../assets/images/icons+btns/monitoring-icon.svg";
import detection from "../../assets/images/icons+btns/detection-icon.svg";
import scalability from "../../assets/images/icons+btns/scalability-icon.svg";
import integrity from "../../assets/images/icons+btns/brand-icon.svg";
import stability from "../../assets/images/icons+btns/market-stability.svg";
import efficiency from "../../assets/images/icons+btns/efficiency.svg";
import start from "../../assets/images/icons+btns/login-icon.svg";

import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing-page">
      <main>
        <section className="title">
          <div className="title__page-header">
            Track MSRP Compliance Effortlessly
          </div>
          <div className="title__subheader">
            Empower your decision making with Spectra.
            <br />
            Redefining MSRP Tracking.
          </div>
        </section>
        <section className="card-container">
          <div className="card">
            <div className="card__features">
              <div className="card__features--img">
                <img src={monitoring} alt="" />
                <img src={detection} alt="" />
                <img src={scalability} alt="" />
              </div>
              <div className="card__features--text">
                <p>
                  Continuous
                  <br />
                  Monitoring
                </p>
                <p>
                  Accurate
                  <br />
                  Detection
                </p>
                <p>Scalability</p>
              </div>
            </div>
            <div className="card__benefits">
              <div className="card__benefits--img">
                <img className="integrity" src={integrity} alt="" />
                <img src={stability} alt="" />
                <img src={efficiency} alt="" />
              </div>
              <div className="card__benefits--text">
                <p>
                  Brand
                  <br />
                  Integrity
                </p>
                <p>
                  Market
                  <br />
                  Stability
                </p>
                <p>Efficiency</p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <Link to="/auth" className="login">
            <button className="login__cta">
              <img className="login__cta--icon" src={start} alt="" />
              <div className="login__cta--text">Start Now</div>
            </button>
          </Link>
        </section>
      </main>
      <div className="spectra-right-column-container">
        <div className="spectra-logo-white">
          <img src={spectraLogoWht} alt="spectra-logo-wht" />
        </div>
        <div className="dell-molecules">
          <div className="dell-molecules__overlap">
            <div className="dell-molecules__overlap--group">
              <div className="molecule m1"></div>
              <div className="molecule m2"></div>
              <div className="molecule m3"></div>
              <div className="molecule m4"></div>
              <div className="molecule m5"></div>
              <div className="molecule m6"></div>
            </div>
            <div className="moecule m7"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;