import React, { useState } from "react";
import Photo from "../../public/Images/idiotperson.png";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/forget.module.css";
import verify_styles from "../styles/otpPage.module.css";
import login_styles from "../styles/Login.module.css";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "axios";

export default function forget() {
  const [email, setemail] = useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/forget`, { detail: email })
      .then((result) => {
        toast.success(result.data.message);
      })
      .catch((error) => {
        toast.warn(error.response?.data?.message || error.message);
      });
  };
  return (
    <div>
      <Head>
        <title>Fortune Chest - Forget Password</title>
      </Head>
      <div
        className="h-100 w-100"
        style={{ position: "fixed", backgroundColor: "#F6F0F0" }}
      >
        <div className={`d-flex`}>
          <Link href="/">
            <i
              className={`${verify_styles.back_icon} bi bi-arrow-left mx-3`}
            ></i>
          </Link>
        </div>
        <h2 className="my-5" style={{ textAlign: "center", color: "rgb(255, 123, 0)" ,}}>
          Forgot Your Password?
        </h2>
        <div className={`d-flex  ${styles.photo_container}`}>
           <Image alt="Photo Not Found" src={Photo} className={styles.person_photo} />
          <div className={styles.box_container} style={{ textAlign: "center" }}>
            <h6 style={{ textAlign: "center", color: "rgb(255, 123, 0)" }}>
              Enter Your Registered <br />
              Email Address
            </h6>
            <form onSubmit={onSubmit} className={styles.form}>
              <div className={`mt-2 ${login_styles.inputContainer}`}>
                <i
                  className={`bi bi-envelope-at-fill ${login_styles.icon}`}
                  style={{ left: "5vh" }}
                ></i>
                <input
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  required
                  type="email"
                  className={`orange_input ${styles.input}`}
                />
              </div>
              <button className={`orange_button ${styles.button}`}>
                Send Verification Link
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
