export const fetchGroupMembers = async (token, chat_group_id) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups/members/${chat_group_id}`, {
            method: "GET",
            headers: {
            "x-auth-token": `${token}`,
            "Authorization": `Bearer ${token}`
            }
        })

        // Unauthorized / Expired Or Bad Access Token
        if(res.status === 401){
            console.error("Unauthorized (401)")
            localStorage.removeItem("accessToken")
            sessionStorage.removeItem("accessToken")
            localStorage.removeItem("reduxState")
            window.location.href = "/auth/login"
            return null
        }

        // Other Backend Errors
        if(!res.ok){
            throw new Error(`API error: ${res.status}`)
        }
        
        const data = await res.json()
        return data.data
    } catch (error) {
        console.error(error)
    }
}