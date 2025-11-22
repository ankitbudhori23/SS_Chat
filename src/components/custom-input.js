"use client"

import React from "react";
import styles from "./custom-input.module.css";

export default function CustomInput({id, type, field, hideOption, colSpan, info, handleChange}){
    const [showPassword, setShowPassword] = React.useState(false)
    return(
        <div className={`${styles.custom_input_cn} ${colSpan ? styles['colspan-2'] : ''}`}>
            {
                hideOption
                &&
                <button type="button" className={styles.hide} onClick={() => setShowPassword(prev => !prev)}>
                    <img src={showPassword ? '/eye.png' : '/eye-off.png'} ></img>
                </button>
            }
            <label htmlFor={id}>{field}</label>
            <input 
                type={hideOption ? showPassword ? "text" : "password" : type} 
                id={id} 
                name={id}
                value={info?.[id] ?? ""}
                onChange={handleChange}
            >
            </input>
        </div>
    )
}