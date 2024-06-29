import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Api from "../../api/Api";
import "./RegisterForm.scss";

const RegisterForm = () => {
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  const handleClear = (event) => {
    event.preventDefault();
    setFormValues({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    });
    setErrors({});
  };

  const validate = () => {
    let formErrors = {};
    if (!formValues.first_name)
      formErrors.first_name = "First Name is required.";
    if (!formValues.last_name) formErrors.last_name = "Last Name is required.";
    if (!formValues.email) formErrors.email = "Email is required.";
    if (!formValues.password) formErrors.password = "Password is required.";
    return formErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      try {
        const registerPayload = {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          email: formValues.email,
          password: formValues.password,
        };
        const response = await Api.post('/auth/register', registerPayload);

        if (response.data.success) {
          const { id, token } = response.data;
          localStorage.setItem("jwt", token);

          // Navigate AFTER the userId is received
          navigate(`/dashboard/${id}`);
        } else {
          setErrors({ form: response.data.message });
        }
      } catch (error) {
        setErrors({ form: "Unable to Register User." });
      }
    }
  };

  const handleShowPassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-form__fields">
        <label htmlFor="first-name" className="register-form__fields--label">
          First Name
        </label>
        <div className="register-name__wrapper">
          <input
            className="register-form__fields--input"
            name="first_name"
            placeholder="Enter your first name here..."
            onChange={handleInput}
            value={formValues.first_name}
          />
          {errors.first_name && (
            <ErrorMessage message={errors.first_name} isSecondary />
          )}
        </div>
        <label htmlFor="last-name" className="register-form__fields--label">
          Last Name
        </label>
        <div className="register-name__wrapper">
          <input
            className="register-form__fields--input"
            name="last_name"
            placeholder="Enter your last name here..."
            onChange={handleInput}
            value={formValues.last_name}
          />
          {errors.last_name && (
            <ErrorMessage message={errors.last_name} isSecondary />
          )}
        </div>
        <label htmlFor="email" className="register-form__fields--label">
          Email
        </label>
        <div className="register-email__wrapper">
          <input
            className="register-form__fields--input"
            name="email"
            placeholder="Enter your email here..."
            onChange={handleInput}
            value={formValues.email}
          />
          {errors.email && <ErrorMessage message={errors.email} isSecondary />}
        </div>
        <label htmlFor="password" className="register-form__fields--label">
          Password
        </label>
        <div className="register-password__wrapper">
          <div className="register-password__container">
            <input
              className="register-form__fields--input password-field"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="**********"
              onChange={handleInput}
              value={formValues.password}
              autoComplete="off"
            />
            <button className="show-password" onClick={handleShowPassword}>
              {showPassword ? (
                <span className="show-password__hide">Hide</span>
              ) : (
                <span className="show-password__show">Show</span>
              )}
            </button>
          </div>
          {errors.password && (
            <ErrorMessage message={errors.password} isSecondary />
          )}
          {errors.form && <ErrorMessage message={errors.form} isSecondary />}
        </div>
      </div>
      <div className="register-buttons__container">
        <button
          className="register-form__submit"
          type="submit"
          onSubmit={handleSubmit}
        >
          <span className="register-button__text">Create Account</span>
        </button>
        <button className="register-form__clear" onClick={handleClear}>
          <span className="cancel-button__text">Cancel</span>
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;