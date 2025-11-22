"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import CustomInput from "@/components/custom-input"
import { createHandleChange } from "@/utils/handleChange"
import BarLoading from "@/components/bar-loader"

export default function SignUp(){
    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        if(token){
            router.replace("/")
        }
    }, [])
    // Error State
    const [ errorMsg, setErrorMsg ] = useState("")
    // Loading State
    const [ isLoading, setIsLoading ] = useState(false)
    // State to store form values
    const [ userInfo, setUserInfo ] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        tandc: false
    })
    // Function to update state that manages change in form inputs
    const handleChange = createHandleChange(setUserInfo)

    // Function to handle form submission and validation
    const handleSubmit = async(event) => {
        event.preventDefault()

        // Form validation
        if(!userInfo.first_name){
            setErrorMsg("Please enter a first name.")
            return
        }
        if(!userInfo.last_name){
            setErrorMsg("Please enter a last name.")
            return
        }
        if(!userInfo.email){
            setErrorMsg("Please enter an email.")
            return
        }else{
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if(!emailRegex.test(userInfo.email)){
                setErrorMsg("Please enter a valid email.")
                return
            }
        }
        if(!userInfo.password){
            setErrorMsg("Please provide a password.")
            return
        }
        if(!userInfo.confirm_password){
            setErrorMsg("Please confirm your password.")
            return
        }
        if(userInfo.password != userInfo.confirm_password){
            setErrorMsg("Passwords don't match.")
            return
        }
        if(!userInfo.tandc){
            setErrorMsg("Please agree to terms and privacy policies to continue.")
            return
        }

        setErrorMsg("")
        setIsLoading(true)
        // Make the call to backend to store user info
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lms/auth/signup`, {
            method: "POST",
            headers: {
                'Content-type': 'application/json',
                // 'x-auth-token': "auth-token"
            },
            body: JSON.stringify({
                fname: userInfo.first_name,
                lname: userInfo.last_name,
                email: userInfo.email,
                password: userInfo.password,
                phone: userInfo.phone
            })
        })
        const { data, message } = await result.json()
        if(result.ok){
            router.replace("/auth/login")
            // console.log("Sign up successfull:\n" + data)
        }else{
            setErrorMsg(message || "Something went wrong, please try again later")
        }
        setIsLoading(false)
    }
    
    return(
        <div className={styles.signup_page}>
            <div className={styles.signup_main}>
                <form className={styles.signup_form} onSubmit={handleSubmit}>
                    <h2 className={styles['colspan-2']}>
                        Sign Up
                    </h2>
                    <p className={`${styles.gray} ${styles['colspan-2']}`}>
                        Let’s get you all set up so you can access your personal account.
                    </p>
                    <CustomInput type="text" id="first_name" field="First Name" info={userInfo} handleChange={handleChange}/>
                    <CustomInput type="text" id="last_name" field="Last Name"  info={userInfo} handleChange={handleChange}/>
                    <CustomInput type="email" id="email" field="Email" info={userInfo} handleChange={handleChange}/>
                    <CustomInput type="tel" id="phone" field="Phone Number" info={userInfo} handleChange={handleChange}/>
                    <CustomInput type="password" id="password" field="Password" hideOption="true" colSpan="2"  info={userInfo} handleChange={handleChange}/>
                    <CustomInput type="password" id="confirm_password" field="Confirm Password" hideOption="true" colSpan="2"  info={userInfo} handleChange={handleChange}/>
                    <div className={`${styles.tandc} ${styles['colspan-2']}`}>
                        <input type="checkbox" id="tandc" name="tandc" className={styles.custom_checkbox} checked={userInfo.tandc} onChange={handleChange}></input>
                        <p>I agree to all the <a>Terms</a> and <a>Privacy Policies</a></p>
                    </div>

                    <div className={`err_msg  ${styles['colspan-2']}`}>
                            <p
                                style={{
                                    opacity: errorMsg ? "1" : "0",
                                    visibility: errorMsg ? "visible" : "hidden",
                                    minHeight: "1.5rem",
                                    transition: "opacity 0.3 ease-in"
                                }}
                            >
                                {errorMsg || ""} 
                            </p>
                        </div>
                    <button className={`${styles.ca_btn} ${styles['colspan-2']} ${isLoading ? "disabled_button" : ""}`} disabled={isLoading}>
                        {isLoading ? <BarLoading /> : "Create Account"}
                    </button>
                    <div className={`${styles.switch} ${styles['colspan-2']}`}>
                        Already have an account?<a href="login"> Login</a>
                    </div>
                </form>
                <div className={styles.signup_img_cn}>
                    <img src="/signup.png" className={styles.signup_img}></img>
                </div>
            </div>
        </div>
    )
}
