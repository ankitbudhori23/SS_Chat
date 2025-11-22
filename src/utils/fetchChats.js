export const fetchChats = async(token) => {
    const chats_res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups`, {
        method: "GET",
        headers: {
            "x-auth-token": `${token}`,
            "Authorization": `Bearer ${token}`
        }
    })

    // Unauthorized / Expired Or Bad Access Token
    if(chats_res.status === 401){
        console.error("Unauthorized (401)")
        localStorage.removeItem("accessToken")
        sessionStorage.removeItem("accessToken")
        localStorage.removeItem("reduxState")
        window.location.href = "/auth/login"
        return null
    }

    // Other Backend Errors
    if(!chats_res.ok){
        throw new Error(`API error: ${res.status}`)
    }

    const chats = await chats_res.json()
    const chats_data = chats.data
    return chats_data
}
