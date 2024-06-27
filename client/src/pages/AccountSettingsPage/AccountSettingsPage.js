import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Header from "../../components/Header/Header";
import SideNavigation from "../../components/SideNavigation/SideNavigation";
import SettingsNavigation from "../../components/SettingsNavigation/SettingsNavigation";
import ProfileSettings from "../../components/ProfileSettings/ProfileSettings";
import AlertSettings from "../../components/AlertSettings/AlertSettings";
import PasswordSettings from "../../components/PasswordSettings/PasswordSettings";
import "./AccountSettingsPage.scss";

const AccountSettingsPage = () => {
  const loggedIn = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedComponent, setSelectedComponent] = useState("Profile");

  useEffect(() => {
    // if (!loggedIn) {
    //   navigate("/auth");
    // }

    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab) {
      setSelectedComponent(tab.charAt(0).toUpperCase() + tab.slice(1));
    }
  }, [loggedIn, navigate, location]);

  const settingsComponents = {
    Profile: <ProfileSettings />,
    Password: <PasswordSettings />,
    Alerts: <AlertSettings />,
  };

  return (
    <div className="main-page">
      <div className="main-page__nav">
        <SideNavigation />
      </div>
      <main className="main-page__body">
        <div className="header-container">
          <Header userId={userId} />
        </div>
        <section className="account-settings">
          <div className="account-settings__nav-container">
            <SettingsNavigation setSelectedComponent={setSelectedComponent} />
          </div>
          <div className="account-settings__section-container">
            {settingsComponents[selectedComponent]}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AccountSettingsPage;