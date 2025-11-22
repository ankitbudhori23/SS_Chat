"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import styles from "./page.module.css"
import CustomInput from "@/components/custom-input"
import { createHandleChange } from "@/utils/handleChange"
import BarLoading from "@/components/bar-loader"

export default function ResetPageClient(){
    // Getting email and otp from search param
    const searchParams = useSearchParams()
    const email = searchParams.get("email")
    const otp = searchParams.get("otp")
    // console.log(email + " : " + otp)
    // Error State
    const [ errorMsg, setErrorMsg ] = useState("")
    // Loading State
    const [ isLoading, setIsLoading ] = useState(false)
    // State to store form values
    const [ userPass, setUserPass ] = useState({
        new_pass: "",
        re_new_pass: ""
    })
    // Function to update state that manages change in form inputs
    const handleChange = createHandleChange(setUserPass)

    // Form input validation and backend call
    const handleSubmit = async(event) => {
        event.preventDefault()

        // Form Validation
        if(!userPass.new_pass){
            setErrorMsg("Please enter a password.")
            return
        }
        if(!userPass.re_new_pass){
            setErrorMsg("Please re-enter the password.")
            return
        }
        if(userPass.new_pass != userPass.re_new_pass){
            setErrorMsg("Passwords don't match.")
            return
        }

        setErrorMsg("")
        setIsLoading(true)       
        // Backend call to reset the password
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/auth/resetPassword`, {
            method: "POST",
            headers: {
                "Content-type" : "application/json",
                // "x-auth-token" : "auth-token"
            },
            body: JSON.stringify({
                email: email,
                password: userPass.new_pass,
                otp: otp
            })
        })
        const { data, message} = await result.json()
        if(!result.ok){
            setErrorMsg(message || "Something went wrong, please try again later")
        }
        setIsLoading(false)
    }

    return(
        <Suspense>
            <div className={styles.reset_page}>
                <div className={styles.reset_main}>
                    <div className={styles.reset_form_cn}>
                        <form className={styles.reset_form} onSubmit={handleSubmit}>
                            <h2>
                            Set a new password
                            </h2>
                            <p className={`${styles.gray}`}>
                                Your previous password has been reseted. Please set a new password for your account.
                            </p>
                            <CustomInput type="password" id="new_pass" field="Create Password" hideOption="true" info={userPass} handleChange={handleChange}/>
                            <CustomInput type="password" id="re_new_pass" field="Re-Enter Password" hideOption="true" info={userPass} handleChange={handleChange}/>

                            <div className="err_msg">
                                <p
                                    style={{
                                        opacity: errorMsg ? "1" : "0",
                                        visibility: errorMsg ? "visible" : "hidden",
                                        minHeight: "1.5rem",
                                        transition: "opacity 0.4 ease-in"
                                    }}
                                >
                                    {errorMsg || ""} 
                                </p>
                            </div>
                            <button className={`${styles.ca_btn} ${isLoading ? "disabled_button" : ""}`} disabled={isLoading}>
                                {isLoading ? <BarLoading /> : "Set password"}
                            </button>
                        </form>
                    </div>
                    <div className={styles.reset_img_cn}>
                        <img src="/forgot.png" className={styles.reset_img}></img>
                    </div>
                </div>
            </div>
        </Suspense>
    )
}