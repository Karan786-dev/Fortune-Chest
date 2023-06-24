import React from 'react'
import { connect } from 'react-redux'
import Image from 'next/image'
import loading_gif from '../../public/Gif/loading.gif'
import styles from '../styles/loading.module.css'
export const Loading = (props) => {
    return (props.loading_redux || props.loading) && (
        <div className={styles.container} style={props.styles || {}}>
            {/* <Image src={loading_gif} /> */}
            <div class={styles['dot-floating']}></div>
        </div>

    )
}

const mapStateToProps = (state) => ({
    loading_redux: state.loading
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Loading)