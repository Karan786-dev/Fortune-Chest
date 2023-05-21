import getAdminData from '@/Store/Actions/getAdminData'
import setUserData from '@/Store/Actions/setUserData'
import React, { useState, useEffect, useRef } from 'react'
import styles from '../../styles/withdraw.module.css'
import verify_styles from "../../styles/otpPage.module.css";
import { connect } from 'react-redux'
import Link from 'next/link';
import axios from 'axios'
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export const withdraw = ({ UserData, AdminData, UpdateUserData, UpdateAdminData }) => {
  const minimum_withdraw = AdminData.minimum_withdraw || 1
  const router = useRouter()
  const formRef = useRef()
  const maximum_withdraw = (UserData.balance || 0) > (AdminData.maximum_withdraw || 10) ? (AdminData.maximum_withdraw || 10) : (UserData.balance || 0) || (AdminData.maximum_withdraw || 10)
  const [selectedAmount, setselectedAmount] = useState(0)
  const [amountButtons, setamountButtons] = useState([])
  const [bank_details_ifsc, update_bank_details_ifsc] = useState({})
  const handle_submit = (event) => {
    event.preventDefault()
  }
  function findEquallyDividedAmounts(num1, num2) {
    const equallyDividedAmounts = [];
    const spacing = (num2 - num1) / 5;

    for (let k = 0; k < 6; k++) {
      const number = num1 + (k * spacing);
      equallyDividedAmounts.push(number);
    }

    return equallyDividedAmounts;
  }
  useEffect(() => {
    UpdateUserData()
    UpdateAdminData()
    setamountButtons(findEquallyDividedAmounts(minimum_withdraw, maximum_withdraw))
  }, [])
  useEffect(() => {
    axios.get(`https://ifsc.razorpay.com/${(UserData?.bank?.ifsc) || 'SBIN0002339'}`)
      .then((result) => {
        update_bank_details_ifsc(result.data)
      })
      .catch((error) => {
        return
        console.log(error)
        toast.warn('We cannot found your bank. Please try to recheck your bank details')
        router.push('/dashboard/profile/bind')
      })
  }, [])
  return (
    <>
      <div className={styles.container}>
        <div className={styles.back_button}>
          <Link href="/dashboard">
            <i
              className={`${verify_styles.back_icon} bi bi-arrow-left mx-3`}
            ></i>
          </Link>
        </div>
        <div className={styles.section_1}>
          <div className={styles.header_container}><div className={styles.header}><p>WITHDRAWAL</p></div></div>
          <div className={styles.wallet_balance_container}>
            <div className={styles.wallet_balance}>
              <p>Wallet Balance</p>
              <p>₹{UserData.balance || 0}</p>
            </div>
          </div>
        </div>
        <div className={styles.section_2}>
          <div>
            <p>Select Amount to add :</p>
            <div className={styles.amount_buttons}>
              <div>
                <div>
                  {amountButtons.map((element, index) => {
                    return <button key={index} onClick={(e) => {
                      setselectedAmount(element == selectedAmount ? 0 : element)
                    }} className={`${styles.amount_button} orange_button ${selectedAmount == element ? styles.selected : ''}`}>₹{element}</button>
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section_3}>
          <div className={styles.bank_card}>
            <div className={styles.header_container}><p>{bank_details_ifsc.BANK}</p></div>
            <div className={styles.bank_details}>
              <p className={styles.label}>A/C&nbsp;No.</p>
              <p className={styles.detail}>{UserData?.bank?.number}</p>
              <p className={styles.label}>IFSC</p>
              <p className={styles.detail}>{UserData?.bank?.ifsc}</p>
              <p className={styles.label}>ACCOUNT&nbsp;HOLDER</p>
              <p className={styles.detail}>{UserData?.bank?.holder}</p>
              <p className={styles.label}>BRANCH</p>
              <p className={styles.detail}>{bank_details_ifsc.BRANCH}</p>
            </div>
          </div>
        </div>

      </div>
      <div className={styles.section_4}>
        <div className={styles.below_card}>
          <div className={styles.amount_container}>
            <p>Amount</p>
            <form ref={formRef} onSubmit={handle_submit} method="post">
              <p className={styles.rupee_icon}>₹</p><input type="number" max={maximum_withdraw} min={minimum_withdraw} name="amt" onChange={(e) => setselectedAmount(e.target.value)} value={selectedAmount} />
            </form>
          </div>
          <hr />
          <div className={styles.button_container}>
            <button onClick={() => formRef.current && formRef.current.submit()} disabled={!(selectedAmount >= minimum_withdraw) || !(selectedAmount <= maximum_withdraw)} className='orange_button'>Withdraw ₹{selectedAmount}</button>
          </div>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state) => ({
  UserData: state.userdata,
  AdminData: state.admindata,
})

const mapDispatchToProps = (dispatch) => {
  return {
    UpdateUserData: () => dispatch(setUserData()),
    UpdateAdminData: () => dispatch(getAdminData())
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(withdraw)