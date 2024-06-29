import { useEffect, useState } from "react";

const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    console.log("Token in useAuth:", token); // Debug log for token
    setLoggedIn(!!token); 
  }, []);

  return loggedIn;
};

export default useAuth;
