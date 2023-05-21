import React, { useState } from "react";
import styles from "../../styles/reset.module.css";
import Link from "next/link";
import verify_styles from "../../styles/otpPage.module.css";
import lock_photo from "../../../public/Images/lock.png";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";

export default function reset() {
  const router = useRouter();
  const { token } = router.query;
  const [Password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [passwordShowing, showPassword] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    if (Password != confirmPassword)
      return toast.warn("Both passwords should match");
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/forget/token/${token}`, { new_password: Password })
      .then((result) => {
        toast.success(result.data.message);
        localStorage.setItem("token", result.data.token);
        router.push('/dashboard')
      })
      .catch((error) => {
        toast.warn(error?.response?.data?.message || error.message)
      });
  };
  return (
    <div>
      <div
        className="h-100 w-100"
        style={{ position: "fixed", backgroundColor: "#F6F0F0" }}
      >
        <div className={`d-flex`}>
          <Link href="/login">
            <i
              className={`${verify_styles.back_icon} bi bi-arrow-left mx-3`}
            ></i>
          </Link>
        </div>
        <h2
          className="my-5"
          style={{
            textAlign: "center",
            color: "rgb(255, 123, 0)",
          }}
        >
          RESET YOUR PASSWORD
        </h2>
        <div className={`${styles.photo_container} d-flex`}>
          <Image alt="Photo Not Found" className={styles.lock_image} src={lock_photo} />
          <div className={styles.box_container} style={{ textAlign: "center" }}>
            <h3
              style={{
                textAlign: "center",
                color: "rgb(255, 123, 0)",
                marginTop: "2vh",
              }}
            >
              New Password
            </h3>
            <form onSubmit={onSubmit} className={styles.form}>
              <div className={`mt-3 ${styles.inputContainer}`}>
                <input
                  type={passwordShowing ? "text" : "password"}
                  className={`orange_input ${styles.input}`}
                  onChange={(e) => setPassword(e.target.value)}
                  value={Password}
                  name="password"
                  placeholder="Create New Password"
                  required
                />
                <i
                  onClick={() => showPassword(passwordShowing ? false : true)}
                  className={`bi ${passwordShowing ? "bi-eye-slash-fill" : "bi-eye-fill "
                    } ${styles.icon2}`}
                ></i>
              </div>
              <div className={`mt-3 ${styles.inputContainer}`}>
                <input
                  type={passwordShowing ? "text" : "password"}
                  className={`orange_input ${styles.input}`}
                  onChange={(e) => setconfirmPassword(e.target.value)}
                  value={confirmPassword}
                  name="password"
                  placeholder="Confirm Password"
                  required
                />
              </div>
              <button className={`orange_button ${styles.button}`}>
                CHANGE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
