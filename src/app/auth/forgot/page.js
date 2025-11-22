"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import CustomInput from "@/components/custom-input"
import { createHandleChange } from "@/utils/handleChange"
import BarLoading from "@/components/bar-loader"

export default function ForgotPassword(){
    // Router initialization
    const router = useRouter();
    // Error State
    const [ errorMsg, setErrorMsg ] = useState("")
    // Loading State
    const [ isLoading, setIsLoading ] = useState(false)
    // State to store user email, track changes to user email input
    const [ userEmail, setUserEmail ] = useState({
        user_email: ""
    })
    // Function to update state that manages user email input
    const handleChange = createHandleChange(setUserEmail)

    // Form Validation and call to backend
    const handleSubmit = async(event) => {
        event.preventDefault()

        // Form Validation
        if(!userEmail.user_email){
            setErrorMsg("Please enter an email.")
            return
        }else{
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if(!emailRegex.test(userEmail.user_email)){
                setErrorMsg("Please enter a valid email.")
                return
            }
        }

        setErrorMsg("")
        setIsLoading(true)
        // Backend call to request password reset
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/auth/sendOtp`, {
            method: "POST",
            headers: { 
                'Content-type': 'application/json',
                // 'x-auth-token': 'auth-token'
            },
            body: JSON.stringify({
                email: userEmail.user_email
            })
        })
        const { data, message } = await result.json()
        if(result.ok){
            // Happy Path
            router.push(`/verify?email=${encodeURIComponent(userInfo.user_email)}`)
        }else{
            setErrorMsg(message || "Something went wrong, please try again later")
        }
        setIsLoading(false)
    }

    return(
        <div className={styles.forgot_pass_page}>
            <div className={styles.forgot_main}>
                <div className={styles.forgot_form_cn}>
                    <form className={styles.forgot_form} onSubmit={handleSubmit}>
                        <a href="login" className={styles.back_btn}><span>&lt;</span> Back to login</a>
                        <h2>
                           Forgot your password ?
                        </h2>
                        <p className={`${styles.gray}`}>
                            Don’t worry, happens to all of us. Enter your email below to recover your password.
                        </p>
                        <CustomInput type="email" id="user_email" field="Email" info={userEmail} handleChange={handleChange}/>
                        
                        <div className="err_msg">
                            <p
                                style={{
                                    opacity: errorMsg ? "1" : "0",
                                    visibility: errorMsg ? "visible" : "hidden",
                                    minHeight: "1.5rem",
                                    transition: "opacity 0.3 ease-in"
                                }}
                            >
                                {errorMsg || "test"} 
                            </p>
                        </div>
                        <button className={`${styles.ca_btn} ${isLoading ? "disabled_button" : ""}`} disabled={isLoading}>
                            {isLoading ? <BarLoading /> : "Submit"}
                        </button>
                    </form>
                </div>
                <div className={styles.forgot_img_cn}>
                    <img src="/forgot.png" className={styles.forgot_img}></img>
                </div>
            </div>
        </div>
    )
}