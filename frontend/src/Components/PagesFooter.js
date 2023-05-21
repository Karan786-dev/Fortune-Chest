import React from 'react'
import styles from '../styles/footer.module.css'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PagesFooter() {
  let router = useRouter()
  const { pathname } = router;
  return (
    <div className={`${styles.container} move_from_down `}>
      <div>
        {/* Home button */}
        <div className={`${styles.icon} ${pathname == '/dashboard' ? `${styles['active-icon']}` : ''}`}>
          <Link href="/dashboard"> <i className={`bi ${pathname == '/dashboard' ? 'bi-house-door-fill' : 'bi-house-door'}`}></i></Link>
        </div>
        {/* Plans button */}
        <div className={`${styles.icon} ${pathname == '/dashboard/invest' ? `${styles['active-icon']}` : ''}`}>
          <Link href="/dashboard/invest"><i className={`bi bi-graph-up-arrow${pathname == '/dashboard/invest' ? '-fill' : ''}`}></i></Link>
        </div>
        {/* Refer Page Button */}
        <div className={`${styles.icon} ${pathname == '/dashboard/refer' ? `${styles['active-icon']}` : ''}`}>
          <Link href="/dashboard/refer"> <i className={`bi bi-share${pathname == '/dashboard/refer' ? '-fill' : ''}`}></i></Link>
        </div>
        {/* My Prfoile Button */}
        <div className={`${styles.icon} ${pathname == '/dashboard/profile' ? `${styles['active-icon']}` : ''}`}>
          <Link href="/dashboard/profile"><i className={`bi ${pathname == '/dashboard/profile' ? 'bi-person-fill' : 'bi-person'}`}></i></Link>
        </div>
      </div>
    </div>
  )
}
