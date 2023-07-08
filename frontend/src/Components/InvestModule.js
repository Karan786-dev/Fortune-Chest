import React, { useState } from 'react'
import styles from '../styles/investModule.module.css'
import { toast } from 'react-toastify'
import axios from 'axios'

export default function InvestModule(props) {
    const [investAmount, setinvestAmount] = useState(props.planData.minimum)
    const [secondPage, setsecondPage] = useState(false)
    const investFunction = (e) => {
        e && e.preventDefault()
        const toast_id = toast.loading("Please wait.....");
        axios.post(`${process.env.NEXT_PUBLIC_API}/api/plan/buy/${props.planData._id}`, {
            amount: parseFloat(investAmount)
        }, {
            headers: { "auth-token": localStorage.getItem("token") }
        }).then((result) => {
            console.log(result)
            toast.update(toast_id, {
                render: result.data.message,
                type: "success",
                isLoading: false,
                autoClose: 2000,
                closeButton: true,
            });
            props.module.close()
        })
            .catch((error) => {
                console.log(error?.response?.data || error.message);
                toast.update(toast_id, {
                    render: error?.response?.data?.message || error.message,
                    type: "warning",
                    isLoading: false,
                    autoClose: 5000,
                    closeButton: true,
                });
            })
    }
    if (secondPage) {
        return <>
            <div className={styles.container}>
                <div className={styles.moduleContainer}>
                    <p className={styles.heading}>Are you sure to invest?</p>
                    <div className={styles.buttonsContainer}>
                        <div><button className={styles.yesButton} onClick={investFunction}>Yes</button>
                            <button className={styles.noButton} onClick={() => setsecondPage(false)}>No</button></div>
                    </div>
                </div>
            </div>
        </>
    }
    if (!secondPage) {
        return (
            <>
                <div className={styles.container}>
                    <div className={styles.moduleContainer}>
                        <div className={styles.headContainer}>
                            <p>Invest In Chest</p>
                            <button onClick={() => props.module.close()} className={styles.backButton}>
                                <p>Close</p>
                            </button>
                        </div>
                        <div className={styles.mainContainer}>
                            <div>
                                <button onClick={(e) => {
                                    if ((parseFloat(investAmount) + 1) > parseFloat(props.planData.maximum)) {
                                        return toast.warn(`You can't invest more then ${props.planData.maximum} Rs`)
                                    }
                                    setinvestAmount((parseFloat(investAmount) || (parseFloat(props.planData.maximum - 1))) + 1)
                                }}>+</button>
                                <input type="number" min={props.planData.minimum} max={props.planData.maximum} value={investAmount} onChange={(event) => {
                                    const value = event.target.value
                                    if (parseFloat(value) < parseFloat(props.planData.minimum)) return setinvestAmount(parseFloat(props.planData.minimum))
                                    if (parseFloat(value) > parseFloat(props.planData.maximum)) return setinvestAmount(parseFloat(props.planData.maximum))
                                    setinvestAmount(event.target.value)
                                }} />
                                <button onClick={(e) => {
                                    if ((parseFloat(investAmount) - 1) < parseFloat(props.planData.minimum)) {
                                        return toast.warn(`You can't invest less then ${props.planData.maximum} Rs`)
                                    }
                                    setinvestAmount((parseFloat(investAmount) || parseFloat(props.planData.minimum)) - 1)
                                }}>-</button>
                            </div>
                        </div>
                        <div className={` ${styles.footerContainer}`}>
                            <button className='orange_button' onClick={() => setsecondPage(true)}>Invest</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
