import getAdminData from '@/Store/Actions/getAdminData'
import setUserData from '@/Store/Actions/setUserData'
import React, { useState, useEffect, useRef } from 'react'
import styles from '../../styles/recharge.module.css'
import verify_styles from "../../styles/otpPage.module.css";
import { connect } from 'react-redux'
import Link from 'next/link';
import axios from 'axios'
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';


export const recharge = ({ UserData, AdminData, UpdateAdminData, UpdateUserData }) => {
  const minimumRecharge = AdminData.minimum_recharge || 1
  const api_link = process?.env?.NEXT_PUBLIC_ACCEPT_PAYMENT_API
  const router = useRouter()
  const formRef = useRef()
  const maximumRecharge = AdminData.maximum_recharge || 10
  const [gatewayData, updategatewayData] = useState({})
  const merchant_key = gatewayData.merchant_key
  let order_id = gatewayData.order_id
  // let order_id = 'UPI495fnnf666967j7h'
  // let api_link = 'https://2pay.infomattic.com/init_payment.php'
  // let merchant_key = '0959311372483'
  const [selectedAmount, setselectedAmount] = useState(0)
  const [amountButtons, setamountButtons] = useState([])
  function findEquallyDividedAmounts(num1, num2) {
    const equallyDividedAmounts = [];
    const spacing = (num2 - num1) / 5;

    for (let k = 0; k < 6; k++) {
      const number = num1 + (k * spacing);
      equallyDividedAmounts.push(number);
    }

    return equallyDividedAmounts;
  }
  useEffect(() => console.log(merchant_key), [gatewayData])
  useEffect(() => {
    UpdateUserData()
    UpdateAdminData()
    setamountButtons(findEquallyDividedAmounts(minimumRecharge, maximumRecharge))
    axios.post(`${process.env.NEXT_PUBLIC_API}/api/user/recharge`, {}, {
      headers: {
        'auth-token': localStorage && localStorage.getItem('token')
      }
    })
      .then((result) => {
        updategatewayData(result.data.data)
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || error.message)
        router.push('/dashboard')
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
          <div className={styles.header_container}><div className={styles.header}><p>RECHARGE MONEY</p></div></div>
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
          <div className={styles.below_card}>
            <div className={styles.amount_container}>
              <p>Amount</p>
              <form ref={formRef} action={api_link} method="post">
                <p className={styles.rupee_icon}>₹</p><input type="number" min={minimumRecharge} max={maximumRecharge} name="amt" onChange={(e) => setselectedAmount(e.target.value)} value={selectedAmount} />
                <input type="hidden" name="order_id" value={order_id} />
                <input type="hidden" name="pid" value={merchant_key} />
                <input type="hidden" value={UserData?.email} name="email" />
                <input type="hidden" value="Recharge" name="purpose" />
              </form>
            </div>
            <hr />
            <div className={styles.button_container}>
              <button onClick={() => formRef.current && formRef.current.submit()} disabled={!(selectedAmount >= minimumRecharge) || !(selectedAmount <= maximumRecharge)} className='orange_button'>Pay ₹{selectedAmount}</button>
            </div>
          </div>
        </div>
      </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(recharge)