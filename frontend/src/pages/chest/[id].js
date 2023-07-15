import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import styles from '../../styles/chest.module.css'
import axios from 'axios'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'
import fs from 'fs';
import path from 'path';
import profile_user from '../../../public/Images/profile-user.png'
import setUserData from '@/Store/Actions/setUserData'
import Loading from '@/Components/Loading'
import InvestModule from '@/Components/InvestModule'


export const Plan = ({ UserData, random_names, updateUserData }) => {
  const router = useRouter()
  const { id } = router.query;
  const [planData, setPlanData] = useState({})
  const [module, changeModule] = useState(false)
  let [intervalStatus, setintervalStatus] = useState(null)
  let [fake_transactions, set_fake_transactions] = useState([])
  let transactions_scroll = useRef(null)


  function generateRandomTransaction() {
    const name = random_names[Math.floor(Math.random() * random_names.length)];
    const amount = Math.floor(Math.random() * (parseFloat(planData.maximum) - parseFloat(planData.minimum) + 1)) + parseFloat(planData.minimum);
    const profit = (((amount * parseFloat(planData.profit)) / 100) * amount).toFixed(2)
    console.log(profit, amount)
    return {
      name,
      amount,
      profit
    };
  }
  // ...
  // ...

  useEffect(() => {
    if (Object.keys(planData).length > 0 && !intervalStatus) {
      console.log('Interval Starting', planData);
      setintervalStatus(true);
      let interval = setInterval(() => {
        console.log('World');
        set_fake_transactions((prevTransactions) => {
          if (prevTransactions.length > 10) {
            return [generateRandomTransaction()]
          } else {
            return [
              ...prevTransactions,
              generateRandomTransaction(),
            ]
          }
        })
      }, 3000);
    }
  }, [planData]);

  // ...
  useEffect(() => {
    if (id) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API}/api/plan/get/${id}`)
        .then((result) => setPlanData(result.data.data))
        .catch((error) => {
          toast.error(error?.response?.data?.message || error.message);
        });
    }
    updateUserData()
  }, [id]);


  useEffect(() => {
    if (transactions_scroll.current) {
      setTimeout(() => {
        transactions_scroll.current.scrollTo(0, transactions_scroll.current.scrollHeight);
      }, 100);
    }
  }, [fake_transactions]);
  const openModule = () => {
    console.log('OkWorld')
    changeModule(true)
  }
  if (!id) {
    return router.push('/dashboard')
  }
  if (!Object.keys(planData).length || !UserData.username) return <Loading loading={true} />
  return (
    <>
      {module && <InvestModule planData={planData} module={{ status: module, close: () => changeModule(false) }} />}
      <Link href={'/dashboard/invest'}>
        <div className={styles.backButtonContainer}>
          <i className="bi bi-arrow-90deg-right"></i>
        </div>
      </Link>
      <div className={styles.container}>
        <div className={styles.section_1}>
          <p>Investment Plan</p>
          <div className={styles.section_1_1}>
            <div>
              <div className={styles.plan_logo_container}>
                <img height={32} alt='Image' width={32} src={planData.image_link} />
              </div>
              <div className={styles.plan_details}>
                <p className={styles.head}>{planData.period} Day, {planData.profit}%</p>
                <div className={styles.more_details}>
                  <p>Profit: {planData.profit}% of investment amount</p>
                  <p>Receive Profit: {planData.period} Times</p>
                  <p>Investment Amount: {planData.minimum}-{planData.maximum} Rs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section_2}>
          <div>
            <div className={styles.paragraphs}>
              <div>
                <p>Investment amount between:</p>
                <p>&#8377;{planData.minimum}-&#8377;{planData.maximum}</p>
              </div>
              <div>
                <p>Refer commission:</p>
                <p>{planData.commission || 0}%</p>
              </div>
              <div>
                <p>Income:</p>
                <p>{`(${planData.profit}%)`}X {planData.period}</p>
              </div>
              {planData.specific_days && <div><p>Profit on:</p> <p>{planData.specific_days.map(day => { return `${day} ` })}</p></div>}
            </div>
          </div>
        </div>
        <div className={styles.section_3}>
          <div>
            <p className={styles.heading}>Participations</p>
            <div className={styles.section_3_1}>
              <div className={styles.section_4_1} ref={transactions_scroll}>
                {fake_transactions.map(({ name, profit, amount }) => {
                  return (
                    <div key={name} className={styles.transaction_row}>
                      <div className={styles.transaction_container}>
                        <div className={styles.transaction_profile}>
                          <Image alt="Photo Not Found" src={profile_user} />
                        </div>
                        <div className={styles.transaction_detail}>
                          <div>
                            <p className={styles.transaction_phone}>{name}</p>
                            <p className={styles.transaction_reason}>Buy-in &#8377; {amount} | Earn &#8377; {profit}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
        <div className={styles.section_5}>
          <div className={styles.section_5_1}>
            <div className={styles.balance_container}><p>Balance &#8377; {(UserData?.balance || 0).toFixed(2)}</p></div>
            <div className={styles.button_container}><div className={styles.invest_button}>
              <button onClick={openModule}>BUY-IN</button>
            </div></div>
          </div>
        </div>
      </div>
    </>
  );
}


const mapStateToProps = (state) => ({
  UserData: state.userdata
})

export async function getServerSideProps() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'first_names.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return {
      props: {
        random_names: fileContent.split('\n')
      }
    };
  } catch (error) {
    console.error('Error reading file:', error);

    return {
      props: {}
    };
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUserData: () => {
      dispatch(setUserData())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Plan)
