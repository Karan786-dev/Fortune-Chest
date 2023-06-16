import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';
import banner_1 from '../../../public/Images/banner_1.png';
import banner_2 from '../../../public/Images/banner_2.png';
import banner_3 from '../../../public/Images/banner_3.png';
import banner_4 from '../../../public/Images/banner_4.png';
import profile_3 from '../../../public/Images/profile_3.png';
import profile_1 from '../../../public/Images/profile_1.png';
import profile_2 from '../../../public/Images/profile_2.png';
import profile_4 from '../../../public/Images/profile_4.png';
import PagesFooter from '../../Components/PagesFooter';
import setUserData from '@/Store/Actions/setUserData';
import getPlansData from '@/Store/Actions/getPlansData';
import Loading from '@/Components/Loading';
import { useRouter } from 'next/router';


const index = ({ UserData, updateUserData, getPlansData }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slidesRef = useRef(null);
  let router = useRouter()
  const banners = [
    {
      image: banner_2,
      link: '/',
    },
    {
      image: banner_1,
      link: '/dashboard/refer',
    },
    {
      image: banner_3,
      link: '/dashboard/recharge',
    },
    {
      image: banner_4,
      link: '/',
    },
  ];
  const [fakeTransactions, setFakeTransactions] = useState([]);

  const transactionsScrollRef = useRef(null);
  const touchPositionRef = useRef(null);

  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    touchPositionRef.current = touchDown;
  };

  const handleTouchMove = (e) => {
    const touchDown = touchPositionRef.current;

    if (touchDown === null) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchDown - currentTouch;

    if (diff > 5) {
      setSlideIndex((prevIndex) =>
        prevIndex + 1 > banners.length - 1 ? 0 : prevIndex + 1
      );
    }

    if (diff < -5) {
      setSlideIndex((prevIndex) =>
        prevIndex === 0 ? banners.length - 1 : prevIndex - 1
      );
    }

    touchPositionRef.current = null;
  };

  const generateRandomTransaction = () => {
    const profiles = [profile_2, profile_3, profile_4];
    const reasons = [
      'Recharge Successfully',
      'Withdraw Completed',
      'Invested Successfully',
    ];
    const randomNumber =
      Math.floor(Math.random() * 9000000000) + 1000000000; // Generates a 10-digit random number
    const numberString = `${randomNumber}`; // Convert the number to a string
    const hiddenNumber = `91${numberString.substring(0, 3)}***${numberString.substring(
      6
    )}`; // Hides the digits in the middle
    const profile = profiles[Math.floor(Math.random() * profiles.length)]; // Gets a random profile image from the array
    const amount = Math.floor(Math.random() * 4901) + 100; // Generates a random amount between 100 and 5000
    const reason = reasons[Math.floor(Math.random() * reasons.length)]; // Gets a random reason from the array

    return {
      number: hiddenNumber,
      profile: profile,
      amount: amount,
      reason: reason,
    };
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (fakeTransactions.length > 10) {
        setFakeTransactions([generateRandomTransaction()]);
      } else {
        setFakeTransactions((prevTransactions) => [
          ...prevTransactions,
          generateRandomTransaction(),
        ]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fakeTransactions]);

  useEffect(() => {
    setTimeout(() => {
      if (transactionsScrollRef.current) {
        transactionsScrollRef.current.scrollTo({
          top: transactionsScrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, [fakeTransactions]);

  const showSlides = () => {
    const slides = slidesRef?.current?.getElementsByClassName(styles.mySlides);

    if (slideIndex > banners.length) {
      setSlideIndex(0);
    }
    if (slideIndex < 1) {
      setSlideIndex(0);
    }
    for (let i = 0; i < slides?.length; i++) {
      slides[i].style.display = 'none';
    }
    slides[slideIndex].style.display = 'block';
  };

  useEffect(() => {
    if(!localStorage.getItem('token')) router.push('/login')
    if (!UserData.username) {
      getPlansData();
      updateUserData();
    }
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) =>
        prevIndex < banners.length - 1 ? prevIndex + 1 : 0
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (slidesRef?.current) showSlides();
  }, [slideIndex]);
  // if (!UserData.username) return <Loading loading={true} />;
  return (
    <>
      <div className={styles.container}>
        <div className={styles.section_1}>
          <div className={styles.section_1_0}>
            <div className={styles.section_1_1}>
              <div className={`${styles.profile_1} h-100`}>
                <Image
                  alt="Photo Not Found"
                  src={profile_3}
                  className={styles.profile_pic_3}
                />
                <div className={styles.profile_3}>
                  <p>{UserData.username}</p>
                </div>
              </div>
              <div className="h-100">
                <Image
                  alt="Photo Not Found"
                  src={profile_1}
                  className={styles.profile_pic_1}
                />
              </div>
            </div>
          </div>
          <div className={styles.banners_section}>
            <div
              className={styles.banners_container}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div ref={slidesRef}>
                {banners.map((data, index) => (
                  <div
                    key={index}
                    className={`${styles.fade} ${styles.mySlides}`}
                  >
                    <Link href={data.link || '/'}>
                      <Image
                        alt="Photo Not Found"
                        src={data.image}
                        className={styles.banner_image}
                        style={{ width: '100%' }}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section_2}>
          <div className="d-flex w-100" style={{ alignItems: 'center' }}>
            <div
              className="d-flex justify-content-center"
              style={{ alignItems: 'center', width: '14%' }}
            >
              <i className={`${styles.speaker_icon} bi bi-megaphone-fill`}></i>
            </div>
            <div className={styles.scrolling_text}>
              <p>Invest&nbsp;to&nbsp;earn&nbsp;2x&nbsp;Profit&nbsp;Every&nbsp;Day&nbsp;~&nbsp;Fortune&nbsp;Chest</p>
            </div>
          </div>
        </div>
        <div className={styles.section_3}>
          <div className={`${styles.section_3_1} d-flex`}>
            <div className={styles.section_3_2}>
              <div className={styles.section_3_3}>
                <div className={styles.paragraph_container}>
                  <p className={styles.my_account_text}>My&nbsp;Balance</p>
                  <p className={styles.my_balance_text}>
                    ₹{(UserData.balance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${styles.section_3_4} `}>
              <Link href="/dashboard/withdraw">
                <div className={styles.section_3_5}>
                  <p>Withdraw</p>
                </div>
              </Link>
              <Link href="/dashboard/recharge">
                <div className={styles.section_3_6}>
                  <p>Recharge</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.section_4}>
          <div className={styles.section_4_1} ref={transactionsScrollRef}>
            {fakeTransactions.map(
              ({ number, profile, amount, reason }) => (
                <div key={number} className={styles.transaction_row}>
                  <div className={styles.transaction_container}>
                    <div className={styles.transaction_profile}>
                      <Image
                        alt="Photo Not Found"
                        src={profile}
                      />
                    </div>
                    <div className={styles.transaction_detail}>
                      <div>
                        <p className={styles.transaction_phone}>{number}</p>
                        <p className={styles.transaction_reason}>{reason}</p>
                      </div>
                    </div>
                    <div className={styles.transaction_amount}>
                      <p>₹{amount}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <PagesFooter />
    </>
  );
};

const mapStateToProps = (state) => ({
  UserData: state.userdata,
});

const mapDispatchToProps = (dispatch) => {
  return {
    updateUserData: () => dispatch(setUserData()),
    getPlansData: () => dispatch(getPlansData()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(index);
