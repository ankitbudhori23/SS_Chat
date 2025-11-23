"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import CustomInput from "@/components/custom-input";
import { createHandleChange } from "@/utils/handleChange";
import BarLoading from "@/components/bar-loader";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "@/state/user/userSlice";

export default function Login() {
  const router = useRouter();
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      router.replace("/");
    }
  }, []);

  // Redux User State
  const currUser = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  // Error State
  const [errorMsg, setErrorMsg] = useState("");
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  // State to store user form input
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    remember_me: false,
  });
  // Function to handle changes to state that manages user form input
  const handleChange = createHandleChange(setUserInfo);

  // Function to validate form data and call the backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Form Validation
    if (!userInfo.email) {
      setErrorMsg("Please enter an email.");
      return;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(userInfo.email)) {
        setErrorMsg("Please enter a valid email.");
        return;
      }
    }
    if (!userInfo.password) {
      setErrorMsg("Please enter an password.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    // Backend call to login the user
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        // 'x-auth-headers': "auth-token"
      },
      body: JSON.stringify({
        email: userInfo.email,
        password: userInfo.password,
      }),
    });
    const { data, message } = await result.json();
    if (result.ok) {
      localStorage.setItem("accessToken", data.token);
      dispatch(setUser(data.user));
      router.replace("/");
    } else {
      setErrorMsg(message || "Something went wrong, please try again later");
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.login_page}>
      <div className={styles.login_main}>
        <div className={styles.login_form_cn}>
          <form className={styles.login_form} onSubmit={handleSubmit}>
            <h2>Login</h2>
            <p className={`${styles.gray}`}>
              Login to access your studifysuccess account.
            </p>
            <CustomInput
              type="email"
              id="email"
              field="Email"
              info={userInfo}
              handleChange={handleChange}
            />
            <CustomInput
              type="password"
              id="password"
              field="Password"
              hideOption="true"
              info={userInfo}
              handleChange={handleChange}
            />

            {/* <div className={styles.randf}>
              <div className={`${styles.remember_me}`}>
                <input
                  type="checkbox"
                  id="remember_me"
                  name="remember_me"
                  className={styles.custom_checkbox}
                  onChange={handleChange}
                ></input>
                <p>Remember me</p>
              </div>
              <a href="forgot">Forgot Password</a>
            </div>
            <div className="err_msg">
              <p
                style={{
                  opacity: errorMsg ? "1" : "0",
                  visibility: errorMsg ? "visible" : "hidden",
                  minHeight: "1.5rem",
                  transition: "opacity 0.3 ease-in",
                }}
              >
                {errorMsg || ""}
              </p>
            </div> */}
            <button
              className={`${styles.ca_btn} ${
                isLoading ? "disabled_button" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? <BarLoading /> : "Login"}
            </button>
            {/* <div className={`${styles.switch}`}>
              Don't have an account?<a href="signup"> Sign up</a>
            </div> */}
          </form>
        </div>
        <div className={styles.login_img_cn}>
          <img src="/login.png" className={styles.login_img}></img>
        </div>
      </div>
    </div>
  );
}
