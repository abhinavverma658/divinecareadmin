import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, selectAuth } from "../features/authSlice";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const { user, token } = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      // Allow demo tokens to bypass JWT validation
      if (token.startsWith("demo-token")) {
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const isTokenExpired = decodedToken.exp < Date.now() / 1000;

        if (isTokenExpired) {
          dispatch(clearAuth());
          navigate("/");
        }
      } catch (error) {
        console.log(error)
        dispatch(clearAuth());
        navigate("/");
      }
    };

    checkToken();
  }, [token, navigate, dispatch]);

  return children;
}
