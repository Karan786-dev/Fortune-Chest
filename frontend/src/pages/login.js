import Head from "next/head";
import React, { useState } from "react";
import axios from "axios";
import waves_bg from "../../public/Images/waves_bg.png";
import person1 from "../../public/Images/person1.png";
import styles from "../styles/Login.module.css";
import Link from "next/link";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/router";
export default function Login() {
  let router = useRouter()
  let [FormData, setFormData] = useState({});
  let [passwordShowing, showPassword] = useState(false);
  const inputChange = (e) => {
    setFormData({ ...FormData, [e.target.name]: e.target.value });
  };
  const formSubmit = (e) => {
    e.preventDefault();
    const toast_id = toast.loading("Please wait.....");
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/login`, FormData)
      .then((result) => {
        toast.update(toast_id, {
          render: result.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
          closeButton: true,
        });
        localStorage.setItem("token", result.data.token);
        router.push('/dashboard')
      })
      .catch((error) => {
        toast.update(toast_id, {
          render: error?.response?.data?.message || error.message,
          type: "warning",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      });
  };
  return (
    <>
      <Head>
        <title>Fortune Chest - Login</title>
      </Head>
      <div
        className=""
        style={{ position: "fixed", width: "100%", heigth: "100%" }}
      >
        <Image
          alt="Background Photo Not Found"
          className={`${styles.waves_bg}`}
          src={waves_bg}
        />
        <div className={`d-flex ${styles.person1_container}`}>
          <Image
            alt="Person Photo Not Found"
            src={person1}
            className={`${styles.person1}`}
          ></Image>
          <form
            onSubmit={formSubmit}
            className=""
            style={{ zIndex: "1", top: "47vh", position: "fixed" }}
          >
            <div className={`mt-2 ${styles.inputContainer}`}>
              <i className={`bi bi-person-fill ${styles.icon}`}></i>
              <input
                type="text"
                className={`orange_input ${styles.input}`}
                onChange={inputChange}
                value={FormData.phone}
                name="phone"
                placeholder="Phone"
                required
              />
            </div>
            <div className={`mt-3 ${styles.inputContainer}`}>
              <i className={`bi bi-lock-fill ${styles.icon}`}></i>
              <input
                type={passwordShowing ? "text" : "password"}
                className={`orange_input ${styles.input}`}
                onChange={inputChange}
                value={FormData.password}
                name="password"
                placeholder="Password"
                required
              />
              <i
                onClick={() => showPassword(passwordShowing ? false : true)}
                className={`bi ${passwordShowing ? "bi-eye-slash-fill" : "bi-eye-fill "
                  } ${styles.icon2}`}
              ></i>
            </div>
            <button className={`${styles.button} orange_button my-3`}>
              LOGIN
            </button>
            <Link href="/register">
              <p className={styles.p}>Create Account</p>
            </Link>
            <Link href="/forget">
              <p className={styles.p}>Forget Password</p>
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}