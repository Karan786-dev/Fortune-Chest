import getTransactions from '@/Store/Actions/getTransactions'
import setUserData from '@/Store/Actions/setUserData'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import styles from '../../../styles/profile.module.css'
import Image from 'next/image'
import ellipse_2 from '../../../../public/Images/Ellipse_2.png'
import Link from 'next/link'
import Footer from '../../../Components/PagesFooter.js'
import { useRouter } from 'next/router'


export const profile = ({ transactions, updateTransactions, updateUserData, UserData }) => {
    let router = useRouter()
    let [chest_earning, change_chest_earning] = useState(0)
    let [team_earning, change_team_earning] = useState(0)
    let options_in_section_3 = [
        { text: 'Bind Bank Card', icon: 'bi bi-credit-card-2-back-fill', link: '/dashboard/profile/bind' },
        { text: 'Invite Friends', icon: "bi bi-person-plus-fill", link: '/dashboard/refer' },
        { text: 'Join Group', icon: "bi bi-people-fill", link: '/dashboard' },
        { text: 'Rule Description', icon: "bi bi-info-circle-fill", link: '/description' },
        { text: 'Help & Support', icon: "bi bi-wechat", link: '/help' },
    ]
    const [token, change_token] = useState('')
    const logout = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token')
            change_token('')
        }
    }
    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            change_token(localStorage.getItem('token'))
        }
        updateTransactions()
        updateUserData()
    }, [])
    useEffect(() => {
        let var_chest_earning = 0
        let var_team_earning = 0
        transactions.forEach(data => {
            switch (data.code) {
                case 'CHEST_COMMISSION':
                    console.log(data)
                    var_chest_earning += data.amount
                    break;
                case 'REFER_BONUS':
                case 'REFERALL_CHEST_COMMISSION':
                    var_team_earning += data.amount
                default:
                    break;
            }
        });
        change_chest_earning(var_chest_earning)
        change_team_earning(var_team_earning)
    }, [transactions])
    return (
        <>
            <div className={styles.full_page}>
                <div className={styles.section_1}>
                    <div className={styles.section_1_1}>
                        <div className={styles.profile_section}>
                            <Image src={ellipse_2} />
                            <p>Membership&nbsp;Number:&nbsp;{UserData.phone}</p>
                        </div>
                        <div className={styles.earnings}>
                            <div>
                                <div className={styles.chest_earning}>
                                    <p className={styles.earning_amount}>{chest_earning.toFixed(2)}</p>
                                    <p className={styles.earning_text}>Chest&nbsp;Earning&nbsp;(&#x20b9;)</p>
                                </div><hr className={styles.vertical_hr} ></hr>
                                <div className={styles.team_earning}><p className={styles.earning_amount}>{team_earning.toFixed(2)}</p>
                                    <p className={styles.earning_text}>Team&nbsp;Earning&nbsp;(&#x20b9;)</p></div><hr className={styles.vertical_hr} ></hr>
                                <div className={styles.balance}><p className={styles.earning_amount}>{(UserData.balance || 0).toFixed(2)}</p>
                                    <p className={styles.earning_text}>My&nbsp;Wallet&nbsp;(&#x20b9;)</p></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.section_1_2}></div>
                </div>
                <div className={styles.below_container}>
                    <div className={styles.section_2}>
                        <div className={styles.buttons_section_1}>
                            <div>
                                <div className={styles.withdraw_button}>
                                    <Link href="/dashboard/withdraw">
                                        <div><div className={styles.button_photo}><i className="bi bi-credit-card-fill"></i></div>
                                            <div className={styles.button_text}><p>Withdrawal</p></div></div>
                                    </Link>
                                </div>
                                <div className={styles.recharge_button}>
                                    <Link href="/dashboard/recharge">
                                        <div><div className={styles.button_photo}><i className="bi bi-piggy-bank-fill"></i></div>
                                            <div className={styles.button_text}><p>Recharge</p></div></div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.section_3}>
                        <div>
                            {options_in_section_3.map((data, index) => {
                                return <div key={index} className={styles.option_in_section_3}>
                                    <Link href={data.link}>
                                        <div><i className={data.icon}></i>
                                            <p>{data.text}</p></div>
                                        <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className={styles.section_4}><div className={styles.logout_button_section} >
                        {token ? <button className='orange_button' onClick={logout}>LOGOUT</button> : <button className='orange_button' onClick={() => router.push('/login')}>LOGIN</button>}
                    </div></div>
                </div>
            </div>
            <Footer />
        </>
    )
}

const mapStateToProps = (state) => ({
    transactions: state.transactions,
    UserData: state.userdata,
})

const mapDispatchToProps = (dispatch) => {
    return {
        updateUserData: () => dispatch(setUserData()),
        updateTransactions: () => dispatch(getTransactions())
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(profile)