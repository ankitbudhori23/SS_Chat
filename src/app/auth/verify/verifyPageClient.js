"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "./page.module.css"
import CustomInput from "@/components/custom-input"
import { createHandleChange } from "@/utils/handleChange"
import BarLoading from "@/components/bar-loader"

export default function VerifyPageClient(){
    // Router Initialization
    const router = useRouter()
    // Getting Email from the serch params
    const searchParams = useSearchParams()
    const email = searchParams.get("email")
    // Error state
    const [ errorMsg, setErrorMsg ] = useState("")
    // Loading State
    const [ isLoading, setIsLoading ] = useState(false)
    // Resending State
    const [ isResending, setIsResending ] = useState(false)
    const [ resent, setResent ] = useState(false)
    // State to track verifcation code
    const [userVerificationCode, setUserVerificationCode ] = useState({
        verification_code: ""
    })
    // Function to manage changes to user verification code state
    const handleChange = createHandleChange(setUserVerificationCode)

    // Function to handle form validation and call to backend
    const handleSubmit = async(event) => {
        event.preventDefault()

        // Form validation
        if(!userVerificationCode.verification_code){
            setErrorMsg("Please enter the verification code")
            return
        }

        setErrorMsg("")
        setIsLoading(true)
        // Backend Call to check the verification code
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/auth/verifyOtp`, {
            method: "POST",
            headers: { 
                'Content-type': 'application/json',
                // 'x-auth-token': 'auth-token'
            },
            body: JSON.stringify({
                email: email,
                otp: userVerificationCode.verification_code,
                type: "1"
            })
        })
        const { data, message } = await result.json()
        if(result.ok){
            // Happy Path
            router.push(`/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(userVerificationCode.verification_code)}`)
        }else{
            setErrorMsg(message || "Something went wrong, please try again later")
        }
        setIsLoading(false)
    }

    // Function to handle backend call to resend the code
    const handleResend = async(event) => {
        event.preventDefault()
        
        setIsResending(true)
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/auth/sendOtp`, {
            method: "POST",
            headers: { 
                'Content-type': 'application/json',
                // 'x-auth-token': 'auth-token'
            },
            body: JSON.stringify({
                email: email
            })
        })
        const { data, message } = await result.json()
        if(!result.ok){
            setErrorMsg(message || "Something went wrong, please try again later")
        }
        setIsResending(false)
        setResent(true)
    }

    return(
        <div className={styles.verify_page}>
            <div className={styles.verify_main}>
                <div className={styles.verify_form_cn}>
                    <form className={styles.verify_form} onSubmit={handleSubmit}>
                        <a href="login" className={styles.back_btn}><span>&lt;</span> Back to login</a>
                        <h2>
                        Verify code
                        </h2>
                        <p className={`${styles.gray}`}>
                            An authentication code has been sent to your email.
                        </p>
                        <CustomInput type="password" id="verification_code" field="Verify Code" hideOption="true" info={userVerificationCode} handleChange={handleChange}/>
                        {
                            !resent
                            ?
                            <div className={`${styles.resend}`}>
                                Didn't receive a code? 
                                <button type="button" className={`${isLoading || isResending ? "disabled_button" : ""}`} onClick={handleResend} disabled={isLoading || isResending}>
                                    Resend Code
                                </button>
                            </div>
                            :
                            <div className={`${styles.resend}`}>
                                A new code has been sent.
                                <button type="button" className={`${isLoading || isResending ? "disabled_button" : ""}`} onClick={handleResend} disabled={isLoading || isResending}>
                                    Resend again
                                </button>
                            </div>
                        }

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
                        <button className={`${styles.ca_btn} ${isLoading || isResending ? "disabled_button" : ""}`} disabled={isLoading || isResending}>
                            {isLoading ? <BarLoading /> : "Verify"}
                        </button>
                    </form>
                </div>
                <div className={styles.verify_img_cn}>
                    <img src="/login.png" className={styles.verify_img}></img>
                </div>
            </div>
        </div>
    )
}