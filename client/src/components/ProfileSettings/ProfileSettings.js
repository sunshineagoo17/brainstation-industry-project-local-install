import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import UpdateButtons from "../UpdateButtons/UpdateButtons";
import "./ProfileSettings.scss";

// Base Url
const url = process.env.REACT_APP_BASE_URL;

const ProfileSettings = () => {
  const [errors, setErrors] = useState(true);
  const [user, setUser] = useState({});
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedIn = useAuth();

  const handleInput = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validate = () => {
    let formErrors = {};
    if (!formValues.first_name)
      formErrors.first_name = "First Name is required.";
    if (!formValues.last_name) formErrors.last_name = "Last Name is required.";
    if (!formValues.email) formErrors.email = "Email is required.";
    return formErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      try {
        const updatePayload = {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          email: formValues.email,
        };
        const response = await axios.put(
          `${url}/dashboard/${userId}`,
          updatePayload
        );

        if (response.data.success) {
          const { id, token } = response.data;
          localStorage.setItem("jwt", token);

          // Navigate AFTER the userId is received
          navigate(`/dashboard/${id}/settings`);
        } else {
          setErrors({ form: response.data.message });
        }
      } catch (error) {
        setErrors({ form: "Unable to Update User." });
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${url}/dashboard/${userId}`);

        if (response.data) {
          setUser(response.data);
          setFormValues({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            email: response.data.email,
          });
        }
      } catch (error) {
        console.error("Error retrieving user data: ", error);
      }
    };

    fetchUser();
  }, [loggedIn, userId, navigate]);

  return (
    <>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form__heading-container">
          <h1 className="profile-form__heading">
            {user.first_name} {user.last_name}
          </h1>
          <h4 className="profile-form__heading--title">Administrator</h4>
        </div>
        <div className="profile-inputs">
          <div className="profile-inputs__container">
            <label
              htmlFor="first_name"
              className="profile-inputs__container--label"
            >
              First Name
            </label>
            <input
              className="profile-inputs__container--field"
              name="first_name"
              placeholder="First Name"
              onChange={handleInput}
              value={formValues.first_name}
            />
          </div>
          <div className="profile-inputs__container">
            <label
              htmlFor="last_name"
              className="profile-inputs__container--label"
            >
              Last Name
            </label>
            <input
              className="profile-inputs__container--field"
              name="last_name"
              placeholder="Last Name"
              onChange={handleInput}
              value={formValues.last_name}
            />
          </div>
          <div className="profile-inputs__container">
            <label htmlFor="email" className="profile-inputs__container--label">
              Email
            </label>
            <input
              className="profile-inputs__container--field"
              type="email"
              placeholder="Email"
              onChange={handleInput}
              value={formValues.email}
            />
          </div>
        </div>
      </form>
      <div className="update-buttons">
        <UpdateButtons handleSubmit={handleSubmit} userId={userId} />
      </div>
    </>
  );
};

export default ProfileSettings;