"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./page.module.css"
import toast, {Toaster} from "react-hot-toast"
import { useSelector, useDispatch} from "react-redux"
import { fetchGroups } from "@/utils/fetchGroups"
import { fetchGroupMembers } from "@/utils/fetchGroupMembers"
import { createGroup, deleteGroups, editGroupName, deleteMembers, addMember } from "@/utils/adminEditMethods"
import { BounceLoader } from "react-spinners"

export default function AdminPage() {
    const router = useRouter()
    const dispatch = useDispatch()

    // Access Token
    const [ accessToken, setAccessToken ] = useState(null)
    const [ checkingAuth, setCheckingAuth ] = useState(true)
    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")

        if(!token){
            localStorage.clear()
            router.replace("auth/login")
            return
        }
        setAccessToken(token)
        setCheckingAuth(false)

    }, [router])

    // User Info
    const user = useSelector((state) => state.user.value)

    // List of Groups
    const [ groups, setGroups ] = useState([])
    const [ groupMembers, setGroupMembers ] = useState(null)

    // Group Open State
    const [ openGroupId, setOpenGroupId ] = useState(null)
    const openGroupInfo = async(id) => {
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        const data = await fetchGroupMembers(accessToken, id)
        setGroupMembers(data)
        setOpenGroupId(openGroupId === id ? null : id)
    }

    // API Call to Delete Groups
    // Deleting State
    const [ showSelector, setShowSelector ] = useState(false)
    const [ deleteList, setDeleteList ] = useState([])
    const handleSelection = (event, group) => {
        if(event.target.checked){
            setDeleteList((prev) => {
                return [
                    ...prev,
                    group
                ]
            })
        }else{
            setDeleteList((prev) => {
                return prev.filter((g) => g.id !== group.id)
            })
        }
    }
    const deleteSelectedGroups = async() => {
        if(deleteList.length === 0) return
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        const res = await deleteGroups(accessToken, deleteList)
        if(res.length === deleteList.length){
            toast.success(`Group${deleteList.length !== 1 ? 's' : ''} deleted successfully.`)
            const updatedGroupList = await fetchGroups(accessToken)
            setGroups(updatedGroupList)
            setDeleteList([])
            setShowSelector(false)
        }
    }
    
    // Edit Group Modal
    const [ showEditModal, setShowEditModal ] = useState(false)
    const [ modalGroup, setModalGroup ] = useState(null)
    const [ memberSelector, setMemberSelector ] = useState(false)
    const openModal = (group) => {
        setShowEditModal(true)
        setModalGroup(group)
        openGroupInfo(group.id)
    }

    // Create Group Modal
    const [ showCreateModal, setShowCreateModal ] = useState(false)

    // Edit Modal API Calls
    // API Call to Change Group Name
    const [ newName, setNewName ] = useState("")
    const changeGroupName = async() => {
        if(!newName) return
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        const res = await editGroupName(accessToken, openGroupId, newName)
        if(res){
            toast.success(`Group Name Changed Successfully.`)
            const updatedGroups = await fetchGroups(accessToken)
            setGroups(updatedGroups)
            setModalGroup((prev) => ({...prev, name: newName}))
            setNewName("")
        }
    }
    // API Call to delete members
    // Member Delete List
    const [ memberDeleteList, setMemberDeleteList ] = useState([])
    const handleMemberSelection = (event, member) => {
        if(event.target.checked){
            setMemberDeleteList((prev) => [...prev, member.user_id])
        }else{
            setMemberDeleteList((prev) => prev.filter((m) => m != member.user_id))
        }
    }
    const removeMembers = async() => {
        if(memberDeleteList.length == 0) return
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        const res = await deleteMembers(accessToken, openGroupId, memberDeleteList)
        if(res.length === memberDeleteList.length){
            toast.success(`Member${memberDeleteList.length !== 1 ? 's' : ''} removed from the group successfully.`)
            const updatedMembers = await await fetchGroupMembers(accessToken, openGroupId)
            setGroupMembers(updatedMembers)
            setMemberDeleteList([])
        }
    }
    // API Call to add a new member
    const [ newMemberData, setNewMemberData ] = useState({
        user_id: "",
        role: ""
    })
    const addNewMember = async() => {
        if(!openGroupId || !newMemberData.user_id || !newMemberData.role) return
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        // Converting user_id to a Number
        const data = {
            ...newMemberData,
            user_id: Number(newMemberData.user_id)
        }
        const res = await addMember(accessToken, openGroupId, data)
        if(res){
            toast.success(`New Member Added!`);
            const updatedMembers = await await fetchGroupMembers(accessToken, openGroupId)
            setGroupMembers(updatedMembers)
            setNewMemberData({ user_id: "", role: "" })
        }
    }
    const handleMemberInput = (event) => {
        const { name, value } = event.target
        setNewMemberData((prev) => ({
            ...prev,
            [name]: value
        })) 
    }

    // Create Modal API Calls
    // API call to create a new group
    const [ newGroupName, setNewGroupName ] = useState("")
    const createNewGroup = async() => {
        if(!newGroupName) return
        // const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        const res = await createGroup(accessToken, newGroupName)
        if(res){
            toast.success(`Group "${newGroupName}" created successfully.`)
            const data = await fetchGroups(accessToken)
            setGroups(data)
            closeModal()
            setNewGroupName("")
        }
    }

    // Fetching Groups
    useEffect(() => {
        const getGroups = async() => {
            if(!accessToken) return
            const data = await fetchGroups(accessToken)
            setGroups(data)
        }
        getGroups()
    }, [accessToken])

    // Close Modal
    const closeModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setModalGroup(null)
        setGroupMembers(null)
        setOpenGroupId(null)
    }

    useEffect(() => {
        if (!showEditModal && !showCreateModal) return
        const handleClickOutside = (event) => {
            const modal = document.querySelector(`.${styles.edit_modal}`)
            if (modal && !modal.contains(event.target)) {
                closeModal()
            }
        }
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                closeModal()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEsc)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEsc)
        }
    }, [showEditModal])

    if (checkingAuth) {
        return (
        <div className={styles.logs_page}>
            <BounceLoader color="#D3D3D3" size={30} />
        </div>
        )
    }
    
    return (
        <div className={styles.admin_page}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Create new group Modal Box */}
            {
                showCreateModal
                &&
                <div className={styles.edit_modal_overlay}>
                    <div className={styles.edit_modal}>
                        <button className={styles.edit_modal_close} onClick={() => closeModal()}>
                            &#10006;
                        </button>
                        <h2>Create a new group.</h2>

                        <h4>Enter group name</h4>
                        <div className={styles.edit_name}>
                            <input 
                                type="text"
                                onChange={(e) => setNewGroupName(e.target.value)}
                                value={newGroupName}
                            ></input>
                            <button className={`${styles.group_util_btn} ${styles.edit_util_change}`} onClick={createNewGroup}>
                                <img src="./edit.png"></img>
                                <p>Create</p>
                            </button>
                        </div>

                        {/* <h4>Add New Member</h4>
                        <div className={styles.edit_add}>
                            <input type="text"></input>
                            <button className={`${styles.group_util_btn} ${styles.group_util_create}`}>
                                <img src="./add.png"></img>
                                <p>Add</p>
                            </button>
                        </div> */}
                        
                    </div>
                </div>
            }

            {/* Edit Modal Box */}
            {
                showEditModal
                &&
                <div className={styles.edit_modal_overlay}>
                    <div className={styles.edit_modal}>
                        <button className={styles.edit_modal_close} onClick={() => closeModal()}>
                            &#10006;
                        </button>
                        <h2>{modalGroup.name}</h2>

                        <h4>Change Name</h4>
                        <div className={styles.edit_name}>
                            <input 
                                type="text"
                                onChange={(e) => setNewName(e.target.value)}
                                value={newName}
                            ></input>
                            <button className={`${styles.group_util_btn} ${styles.edit_util_change}`} onClick={changeGroupName}>
                                <img src="./edit.png"></img>
                                <p>Change</p>
                            </button>
                        </div>

                        <h4>Members</h4>
                        <div className={styles.edit_members}>
                            {
                                (groupMembers && groupMembers.length !== 0)
                                ?
                                groupMembers.map((member, index) => {
                                    return(
                                        <div key={index} className={styles.member_item}>
                                            {
                                                memberSelector
                                                &&
                                                <input type="checkbox" className={styles.group_util_checkbox} onClick={(e) => handleMemberSelection(e, member)}></input>
                                            }
                                            <p>{member.name} <span className={styles.admin_tag}>{member.role !== "user" ? "( Admin )" : ""}</span></p>
                                        </div>
                                    )
                                })
                                :
                                <div className={styles.no_members_msg}>
                                    <p>This group doesn’t have any members yet.</p>
                                </div>
                            }
                            <div className={styles.edit_delete}>
                                {
                                    memberSelector
                                    &&
                                    <button className={`${styles.group_util_btn} ${styles.group_util_delete}`} onClick={() => removeMembers()}>
                                        <img src="./delete.png"></img>
                                        <p>Confirm Delete</p>
                                    </button>
                                }
                                {
                                    (groupMembers && groupMembers.length !== 0)
                                    &&
                                    <button className={`${styles.group_util_btn} ${!memberSelector ? styles.group_util_delete : " "}`} onClick={() => {
                                        if(memberSelector){
                                            setMemberDeleteList([])
                                        }
                                        setMemberSelector((prev) => !prev)
                                    }}>
                                        {!memberSelector && <img src="./delete.png"></img>}
                                        <p>{memberSelector ? "Cancel" : "Delete"}</p>
                                    </button> 
                                }
                            </div>   
                        </div>
                        
                        <h4>Add New Member</h4>
                        <div className={styles.edit_add}>
                            <div className={styles.edit_add_input}>
                                <input 
                                    type="text" 
                                    name="user_id"
                                    value={newMemberData.user_id}
                                    onChange={handleMemberInput}
                                    required
                                ></input>
                                <select
                                    name="role"
                                    value={newMemberData.role}
                                    onChange={handleMemberInput}
                                    required
                                >
                                <option value="" disabled>
                                    Select Role
                                </option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className={`${styles.group_util_btn} ${styles.group_util_create}`} onClick={() => addNewMember()}>
                                <img src="./add.png"></img>
                                <p>Add</p>
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* Admin Panel */}

            <div className={styles.admin_info}>
                <h2>Admin Panel</h2>
                {/* <h3>{user.fname} {user.lname}</h3>
                <h3>{user.email}</h3> */}
            </div>

            <div className={styles.admin_utils}>
                <div className={styles.groups_util}>
                    <h2>Groups</h2>
                    <div className={styles.group_list}>
                        {
                            groups.map((group, index) => {
                                if(group.is_deleted === 1) return null
                                return(
                                    <div key={index} className={styles.group}>
                                        <div className={styles.group_top}>
                                            {showSelector && <input type="checkbox" className={styles.group_util_checkbox} onClick={(e) => handleSelection(e, group)}></input>}
                                            <button className={styles.group_info} onClick={() => openGroupInfo(group.id)}>
                                                {group.name}
                                            </button>
                                            <button className={styles.edit_btn} onClick={() => openModal(group)}>
                                                <img src="./edit.png"></img>
                                            </button>
                                            <button className={styles.edit_btn} onClick={() => router.push(`/admin/logs/${group?.id}`)}>
                                                <img src="./chat-white.png"></img>
                                            </button>
                                        </div>
                                        {
                                            (!showEditModal && group.id === openGroupId) 
                                            &&
                                            <div className={styles.group_members}>
                                                <h4>Members <span>({groupMembers.length})</span></h4>
                                                {
                                                    (groupMembers && groupMembers.length !== 0 && !showEditModal)
                                                    ?
                                                    groupMembers.map((member, index) => {
                                                        return(
                                                            <p key={index}>{member.name} <span className={styles.admin_tag}>{member.role !== "user" ? "( Admin )" : ""}</span></p>
                                                        )
                                                    })
                                                    :
                                                    <div className={styles.no_members_msg}>
                                                        <p>This group doesn’t have any members yet.</p>
                                                        <p>Click <b>Edit</b> to add members.</p>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className={styles.group_util_btns}>
                        {
                            showSelector
                            &&
                            <button className={`${styles.group_util_btn} ${styles.group_util_delete}`} onClick={deleteSelectedGroups}>
                                <img src="./delete.png"></img>
                                <p>Confirm Delete</p>
                            </button>
                        }
                        <button className={`${styles.group_util_btn} ${!showSelector ? styles.group_util_delete : " "}`} onClick={() => {
                            if(showSelector){
                                setDeleteList([])
                            }
                            setShowSelector((prev) => !prev)
                        }}>
                            {!showSelector && <img src="./delete.png"></img>}
                            <p>{showSelector ? "Cancel" : "Delete"}</p>
                        </button>
                        <button className={`${styles.group_util_btn} ${styles.group_util_create}`} onClick={() => setShowCreateModal(true)}>
                            <img src="./create.png"></img>
                            <p>Create</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
