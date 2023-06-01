import getPlansData from '@/Store/Actions/getPlansData'
import React, { useEffect } from 'react'
import styles from '../../styles/invest.module.css'
import { connect } from 'react-redux'
import Image from 'next/image'
import Footer from '../../Components/PagesFooter'
import { useRouter } from 'next/router'


export const invest = ({ getPlansData, plansData }) => {
    useEffect(() => {
        getPlansData()
    }, [])
    let router = useRouter()
    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}><p>Fortune Chest Plans</p></div>
                <div className={styles.section_1}><p>Plans&nbsp;-&nbsp;Select&nbsp;a&nbsp;suitable&nbsp;plan</p></div>
                <div className={styles.plans_container}>
                    {plansData.map((planData, index) => {
                        return (
                            <div key={index} onClick={() => {
                                router.push('/chest/' + planData._id.toString())
                            }} className={`${styles.plan_container} move_from_down`}>
                                <div className={styles.plan_container_2}>
                                    <div className={styles.plan_logo_container}>
                                        <Image height={32} width={32} src={`data:image/${planData.image.ext};base64,${planData.image.data}`} />
                                    </div>
                                    <div>
                                        <div className={styles.plan_details_container}>
                                            <p className={styles.plan_name}>Fortune Chest&nbsp;-&nbsp;Plan&nbsp;{index + 1}</p>
                                            <p className={styles.plan_prices}>₹{planData.minimum}&nbsp;-&nbsp;₹{planData.maximum}</p>
                                        </div>
                                    </div>
                                </div>
                                <hr className={styles.line} />
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </>
    )
}

const mapStateToProps = (state) => ({
    plansData: state.plansdata
})

const mapDispatchToProps = (dispatch) => {
    return {
        getPlansData: () => dispatch(getPlansData())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(invest)
