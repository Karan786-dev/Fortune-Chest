import React, { useEffect, useState } from "react";
import emailPhoto from "../../public/Images/email.png";
import styles from "../styles/otpPage.module.css";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function OtpForm() {
  let router = useRouter();
  let { email } = router.query;
  const [fullOtp, setFullOtp] = useState([]);
  useEffect(() => {
    if (!email) router.push("/register");
  }, [email]);
  const resendOTP = () => {
    let toast_id = toast.loading("Loading...");
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/resendOTP`, { email })
      .then((result) => {
        toast.update(toast_id, {
          render: result.data.message,
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      })
      .catch((error) => {
        toast.update(toast_id, {
          render: error.response?.data?.message || error.message,
          type: "warning",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      });
  };
  const onPasteOTP = () => {
    navigator.clipboard.readText().then((clipboardText) => {
      const digits = clipboardText.match(/\d+/g);
      if (!digits) return;
      const firstValue = Object.values(digits)[0]?.split("");

      if (firstValue?.length > 0) {
        const newFullOtp = firstValue.slice(0, 6).map((value, index) => {
          if (index < fullOtp.length) {
            return value;
          } else {
            return "";
          }
        });
        setFullOtp(newFullOtp);
      }
    });
  };

  const onInputChange = (event, index) => {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, "");
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newFullOtp = fullOtp.slice();
    newFullOtp[index] = value;
    setFullOtp(newFullOtp);
  };

  const onInputKeyUp = (event, index) => {
    const key = event.key;

    if (fullOtp[index] && fullOtp[index].length === 1 && index < 3) {
      event.target.nextSibling.focus();
    } else if (!fullOtp[index] && key === "Backspace" && index > 0) {
      event.target.previousSibling.focus();
    }
  };
  const keydown = (ev) => {
    ev = ev || window.event; // Event object 'ev'
    var key = ev.which || ev.keyCode; // Detecting keyCode

    // Detecting Ctrl
    var ctrl = ev.ctrlKey ? ev.ctrlKey : key === 17 ? true : false;

    // If key pressed is V and if ctrl is true.
    if (key == 86 && ctrl) {
      onPasteOTP();
    }
  };
  const onSubmit = (event) => {
    event.preventDefault();
    const enteredOtp = fullOtp.join("");
    if (!enteredOtp) return toast.warn("Please enter otp");
    axios
      .post(`${process.env.NEXT_PUBLIC_API}/api/auth/verifyOTP`, {
        email: email,
        otp: enteredOtp,
      })
      .then((result) => {
        toast.success(result.data.message);
        router.push("/login");
      })
      .catch((error) => {
        toast.warn(error.response?.data?.message || error.message);
        console.log(error.response.data);
      });
  };

  return (
    <div style={{ backgroundColor: "#F6F0F0", height: "100vh" }}>
      <div className={`d-flex`} style={{ zIndex: 2, position: "fixed" }}>
        <Link href="/register">
          <i className={`${styles.back_icon} bi bi-arrow-left mx-3`}></i>
        </Link>
      </div>
      <div style={{ position: "fixed", width: "100%", heigth: "100%" }}>
        <div className={`d-flex ${styles.image_container}`}>
          <Image alt="Photo Not Found" src={emailPhoto} className={`${styles.image}`} />
          <div className={`${styles.container_under_image}`}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "bold", height: "12px" }}>
                <strong>Verification</strong>
              </p>      
              <p style={{ color: "#E86137", fontWeight: "bold" }}>
                Enter your OTP code number
              </p>
            </div>
            <div className={`${styles.form_container}`}>
              <form className={`container ${styles.form}`} onSubmit={onSubmit}>
                <div className={`${styles.inputs} d-flex`}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      type="number"
                      className={`orange_input ${styles.input}`}
                      name="otp"
                      value={fullOtp[index] || ""}
                      onChange={(event) => onInputChange(event, index)}
                      onKeyUp={(event) => onInputKeyUp(event, index)}
                      onKeyDown={(event) => keydown(event)}
                      maxLength={1}
                      key={index}
                    />
                  ))}
                </div>
                <button
                  style={{ height: "5vh" }}
                  className="orange_button my-3"
                >
                  VERIFY
                </button>
              </form>
            </div>
            <p
              className="my-3"
              style={{
                fontWeight: "bold",
                color: "#E86137",
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={resendOTP}
            >
              Resend Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
