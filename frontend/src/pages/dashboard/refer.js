import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import styles from '../../styles/refer.module.css'
import getAdminData from '@/Store/Actions/getAdminData'
import setUserData from '@/Store/Actions/setUserData'
import PagesFooter from '@/Components/PagesFooter'
import banker_photo from '../../../public/Images/happy-rich-banker.png'
import Image from 'next/image'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify'
import { RWebShare } from "react-web-share";

export const refer = ({ UserData, AdminData, UpdateAdminData, UpdateUserData }) => {
    useEffect(() => {
        UpdateUserData()
        UpdateAdminData()
    }, [])
    return (
        <>
            <div className={styles.container}>
                <div className={styles.section_1}>
                    <div className={styles.section_1_1}>
                        <p className={styles.heading}>FORTUNE CHEST</p>
                    </div>
                    <div className={styles.section_1_2}>
                        <div className={styles.image_container}>
                            <Image src={banker_photo} />
                        </div>
                    </div>
                    <div className={styles.section_1_3}>
                        <p className={styles.heading}>REFER MORE TO EARN MORE</p>
                        <p className={styles.details}>
                            When User Register with your refer code your will receive {AdminData.per_refer || 0}Rs , if user buy a chest you will receive commision from invested amount
                        </p>
                    </div>
                </div>
                <div className={styles.section_2}>
                    <div className={styles.container}>
                        <div className={styles.label}><p>CODE</p></div>
                        <div className={styles.input_container}>
                            <input readOnly type="text" className={styles.input} value={UserData.inviteCode || 'oeifuhfvbcnc'} />
                            <CopyToClipboard onCopy={(text, result) => {
                                if (result) { toast.success('Invitation Code Copied To Clipboard') } else {
                                    toast.error('There`s An Error While Coping Your Code, Please try Below Button')
                                }
                            }} text={UserData.inviteCode || 'null'}><button onClick={(e) => e.preventDefault()} className={styles.copy_button}><i className='bi bi-clipboard'></i></button></CopyToClipboard>
                        </div>
                    </div>
                </div>
                <div className={`${styles.refer_now_button_container}`}>
                    <button className="orange-button" onClick={function (e) {
                        e.preventDefault()
                        navigator.share({
                            text: "Hey!! Join now Fortune Chest ,the biggest investment Company and earn a lot of profit just sitting on your bed",
                            url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/register/${UserData.inviteCode}`,
                            title: "Fortune Chest",
                        })
                    }}>REFER NOW</button>
                </div>
            </div >
            <PagesFooter />
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
export default connect(mapStateToProps, mapDispatchToProps)(refer)