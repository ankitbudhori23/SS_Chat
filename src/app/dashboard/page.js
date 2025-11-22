"use client"

import styles from "./page.module.css"
import { useSelector } from "react-redux"
import { capitalizeFirstWord } from "@/utils/capitalizeFirstWord"

export default function DashboardPage(){
    const user = useSelector((state) => state.user.value)
    return(
        <div className={styles.dashboard_page}>

            <div className={styles.side_bar}>
                <div className={styles.side_bar_top}>
                    <a href="/" className={`${styles.side_bar_icon_img} ${styles.chat_img}`}></a>
                    <div className={styles.divider}></div>
                </div>

                <div className={styles.side_bar_bottom}>
                    <div className={`${styles.side_bar_icon_img} ${styles.settings_img}`}></div>
                    <a href="dashboard" className={`${styles.side_bar_icon_img} ${styles.profile_img}`}></a>
                </div>
            </div>

            <div className={styles.dashboard_main}>
                <div className={styles.user_img}>
                    <img src="/profile-picture.png"></img>
                </div>
                <div className={styles.user_info}>
                    <h2>{capitalizeFirstWord(user.fname)} {capitalizeFirstWord(user.lname)}</h2>
                    <div className={styles.user_info_field}>
                        <div><b>Email</b></div>
                        <p>{user.email}</p>
                    </div>

                    <div className={styles.user_info_field}>
                        <div><b>Phone</b></div>
                        <p>+91 9800211241</p>
                    </div>

                    <div className={styles.user_info_field}>
                        <div><b>Profile Type</b></div>
                        <p>Student</p>
                    </div>
                </div>
                <div className={styles.bottom_bar}></div>
            </div>
        </div>
    )
}