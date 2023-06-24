import React, { useEffect, useState } from 'react'
import styles from '../../../styles/bindCard.module.css'
import setUserData from '@/Store/Actions/setUserData'
import { connect } from 'react-redux'
import PagesFooter from '@/Components/PagesFooter'
import axios from 'axios'
import { toast } from 'react-toastify';
import Loading from '@/Components/Loading';
function bind({ UserData, UpdateUserData }) {
  const [bank_details, update_bank_details] = useState({})
  const [ifsc_verified, set_ifsc_verified] = useState(false)
  const [bank_details_ifsc, update_bank_details_ifsc] = useState({})
  const verify_ifsc = (e) => {
    e && e.preventDefault()
    axios.get(`https://ifsc.razorpay.com/${(bank_details.ifsc)}`)
      .then((result) => {
        set_ifsc_verified(true)
        toast.success(`Bank Details Found , BRANCH: ${result.data.BRANCH}`)
      })
      .catch((error) => {
        console.log(error)
        toast.warn('We cannot found your bank. Please try to recheck your ifsc')
      })
  }
  const inputChange = (event) => {
    if (event.target.name == 'ifsc') {
      set_ifsc_verified(false)
    }
    update_bank_details({ ...bank_details, [event.target.name]: event.target.value });
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    axios.post(`${process.env.NEXT_PUBLIC_API}/api/user/bind_bank`, bank_details, { headers: { "auth-token": localStorage.getItem("token") } })
      .then(() => {
        UpdateUserData()
        toast.success('Bank details updated')
      })
      .catch((error) => {
        toast.warn(error?.response?.message || error.message)
      })
  }
  useEffect(() => {
    UpdateUserData()
  }, [])
  useEffect(() => {
    if (Object.keys(UserData.bank || {}).length) {
      update_bank_details(UserData.bank)
    }
  }, [UserData])
  if (!UserData) return <Loading loading={true} />
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.head}><p>BIND BANK CARD</p></div>
        </div>
        <div className={styles.main_container}>
          <div className={styles.form_container}>
            <form onSubmit={handleSubmit}>
              <div tabIndex={0} className={styles.inputContainer}>
                <p>Account No.</p>
                <input placeholder='Account No.' value={bank_details.number} onChange={inputChange}
                  name='number' type="number" class={`orange_input ${styles.account_no}`} />
              </div>
              <div className={`${styles.inputContainer} ${styles.ifsc_container}`}>
                <p>ifsc code</p>
                <div>
                  <input placeholder='ifsc code' value={bank_details.ifsc} onChange={inputChange}
                    name='ifsc' class={`orange_input ${styles.ifsc_code}`} />
                  {!ifsc_verified && <button onClick={verify_ifsc} className={styles.verify_button}>Verify</button>}
                </div>
              </div>
              <div className={styles.inputContainer}>
                <p>Account Holder Name</p>
                <input placeholder='Account Holder Name' value={bank_details.holder} onChange={inputChange}
                  name='holder' class={`orange_input ${styles.account_holder}`} />
              </div>
              <div className={styles.submit_button_container}>
                <button disabled={!ifsc_verified || !bank_details.number || !bank_details.holder} className={`orange_button ${styles.submit_button}`}>ADD BANK CARD</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <PagesFooter />
    </>
  )
}



const mapStateToProps = (state) => ({
  UserData: state.userdata,
})

const mapDispatchToProps = (dispatch) => {
  return {
    UpdateUserData: () => dispatch(setUserData()),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(bind)