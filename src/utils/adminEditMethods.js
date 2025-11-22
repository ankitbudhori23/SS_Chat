const createGroup = async(token, newGroupName) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": `${token}`,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                "is_group": 1,
                "name": newGroupName
            })
        })
        if(response.ok){
            console.log("Group Created Successfully.")
            return true
        }
        console.error("Failed to create new group.")
        return false
    } catch (error) {
        console.error("Error creating a new group : \n", error)
        return false
    }
}

const deleteGroups = async(token, groups) => {
    try {
        const deletePromises = groups.map(async(g) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups/${g.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": `${token}`,
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    "name": g.name,
                    "is_deleted": 1
                })
            })

            if(!response.ok){
                throw new Error(`Failed to delete group with id ${g.id}.`)
            }
            return g
        })

        const deletedGroups = await Promise.all(deletePromises)
        return deletedGroups
    } catch (error) {
        console.error("Error deleting groups : \n", error)
        return []
    }
}

const editGroupName = async(token, groupID, newName) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups/${groupID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": `${token}`,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newName,
                "is_deleted": 0
            })
        })

        if(response.ok){
            console.log("Group Name Changed successfully")
            return true
        }
        console.log("Failed to change group name")
        return false
    } catch (error) {
        console.log("Error changing the group name : \n", error)
        return false
    }
}

const deleteMembers = async(token, groupID, memberIDs) => {
    try {
        const deletePromises = memberIDs.map(async(mID) => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups/members/${groupID}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token,
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: mID
                    })
                }
            )
            if(!response.ok){
                throw new Error(`Failed to delete member with id ${id}.`)
            }
            return mID
        })

        const deleteIDs = await Promise.all(deletePromises)
        return deleteIDs
    } catch (error) {
        console.error("Error delete members : \n", error)
        return []
    }
}

const addMember = async(token, groupID, data) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/groups/members/${groupID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            }
        )

        if (response.ok) {
            console.log("Member added successfully")
            return true
        }
        console.error("Failed to add member")
        return false;
    } catch (err) {
        console.error("Error adding user:\n", err);
        return false;
    }
}

export { createGroup, deleteGroups, editGroupName, deleteMembers, addMember }