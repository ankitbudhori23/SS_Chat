export const uploadFile = async(formData, fileType) => {
    let endpoint = ""
    if(fileType === "document"){
        endpoint = "uploadDoc"
    }else if(fileType === "video"){
        endpoint = "uploadVideo"
    }else{
        endpoint = "uploadImage"
    }
    const res = await fetch(`https://studifysuccess.com/app/api/${endpoint}`, {
        method: "POST",
        body: formData
    })
    // if(res.status === 401){
    //     console.error("Unauthorized (401)")
    //     localStorage.removeItem("accessToken")
    //     sessionStorage.removeItem("accessToken")
    //     localStorage.removeItem("reduxState")
    //     window.location.href = "/auth/login"
    //     return
    // }
    const data = await res.json()
    return data
}
