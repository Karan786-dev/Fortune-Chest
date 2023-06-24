import Head from "next/head";
import React, { useEffect, useState } from "react";
import waves_bg from "../../public/Images/waves_bg.png";
import person2 from "../../public/Images/person2.png";
import styles from "../styles/Login.module.css";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
export default function Register() {
  const router = useRouter();
  let [passwordShowing, showPassword] = useState(false);
  const inviteCode =
    router.query.inviteCode ||
    (typeof window !== "undefined" && localStorage.getItem("inviteCode"));
  let [FormData, setFormData] = useState({});
  useEffect(() => {
    if (inviteCode) {
      localStorage.setItem("inviteCode", inviteCode);
      setFormData({ ...FormData, inviteCode: inviteCode });
    }
  }, [router.query.inviteCode]);
  const inputChange = (event) => {
    setFormData({ ...FormData, [event.target.name]: event.target.value });
  };
  const form_submit = (event) => {
    event.preventDefault();
    let toast_id = toast.loading("Loading...");
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/register`, FormData)
      .then((result) => {
        toast.update(toast_id, {
          render: result.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
          closeButton: true,
        });
        router.push({
          pathname: "/verify",
          query: { email: FormData.email },
        });
      })
      .catch((error) => {
        toast.update(toast_id, {
          render: error.response?.data?.message || error.message,
          type: "warning",
          isLoading: false,
          autoClose: 2000,
          closeButton: true,
        });
      });
  };

  return (
    <>
      <Head>
        <title>Fortune Chest - Register</title>
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
            src={person2}
            className={`${styles.person1}`}
          ></Image>
          <form
            onSubmit={form_submit}
            className=""
            style={{ zIndex: "1", top: "40vh", position: "fixed" }}
          >
            <div className={`mt-2 ${styles.inputContainer}`}>
              <i className={`bi bi-telephone-fill ${styles.icon}`}></i>
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
            <div className={`mt-2 ${styles.inputContainer}`}>
              <i className={`bi bi-envelope-at-fill ${styles.icon}`}></i>
              <input
                type="email"
                className={`orange_input ${styles.input}`}
                onChange={inputChange}
                value={FormData.email}
                name="email"
                placeholder="Email"
                required
              />
            </div>
            <div className={`mt-2 ${styles.inputContainer}`}>
              <i className={`bi  bi-person-fill ${styles.icon}`}></i>
              <input
                type="text"
                className={`orange_input ${styles.input}`}
                onChange={inputChange}
                value={FormData.username}
                name="username"
                placeholder="Username"
                required
              />
            </div>
            <div className={`mt-2 ${styles.inputContainer}`}>
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
            <div className={`mt-2 ${styles.inputContainer}`}>
              <i className={`bi bi-gift-fill ${styles.icon}`}></i>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                className={`orange_input ${styles.input}`}
                disabled={(router.query.inviteCode || inviteCode) ? true : false}
                value={FormData.inviteCode}
                onChange={inputChange}
                placeholder="Referral Code"
              />
            </div>
            <button className={`${styles.button} orange_button my-3`}>
              REGISTER
            </button>
            <Link href="/login">
              <p className={`${styles.p}`}>Already have an Account ? Login</p>
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}