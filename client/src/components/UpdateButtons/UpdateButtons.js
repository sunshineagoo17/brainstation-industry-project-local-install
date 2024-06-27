import { Link } from "react-router-dom";
import "./UpdateButtons.scss";

const UpdateButtons = ({ handleSubmit, userId }) => {
  return (
    <div className="update-buttons__container">
      <button
        type="submit"
        onClick={handleSubmit}
        className="update-save__button"
      >
        Save
      </button>
      <Link to={`/dashboard/${userId}`} className="update-cancel__button">
        <span className="update-cancel__button--text">Cancel</span>
      </Link>
    </div>
  );
};

export default UpdateButtons;