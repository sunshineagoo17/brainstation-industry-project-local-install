import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./SettingsNavigation.scss";

const SettingsNavigation = ({ setSelectedComponent }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  const handleTabChange = (tab) => {
    setSelectedComponent(tab);
    navigate(`/dashboard/${userId}/settings?tab=${tab.toLowerCase()}`);
  };

  const isActive = (tab) => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("tab") === tab.toLowerCase();
  };

  return (
    <nav className="settings-nav">
      <ul className="settings-nav__list">
        <li
          className={`settings-nav__list--item ${
            isActive("Profile") ? "selected-tab" : ""
          }`}
          onClick={() => handleTabChange("Profile")}
        >
          Profile
        </li>
        <li
          className={`settings-nav__list--item ${
            isActive("Password") ? "selected-tab" : ""
          }`}
          onClick={() => handleTabChange("Password")}
        >
          Password
        </li>
        <li
          className={`settings-nav__list--item alert-tab ${
            isActive("Alerts") ? "selected-tab" : ""
          }`}
          onClick={() => handleTabChange("Alerts")}
        >
          Alerts
        </li>
      </ul>
    </nav>
  );
};

export default SettingsNavigation;
