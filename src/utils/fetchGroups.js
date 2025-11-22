export const fetchGroups = async(token) => {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/allGroups`, {
            method: "GET",
            headers: {
                "x-auth-token": `${token}`,
                "Authorization": `Bearer ${token}`
            }
        })

        const data = await response.json()
        return data.data
    }catch(err){
        console.log("Error fetching groups.\n" + err)
        return []
    }
}