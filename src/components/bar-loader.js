import { BarLoader } from "react-spinners";
import styles from "./bar-loader.module.css"

export default function BarLoading(){
    return(
        <div className={styles.bar_loader}>
            <BarLoader color="#ffffff"/>
        </div>
    )
}