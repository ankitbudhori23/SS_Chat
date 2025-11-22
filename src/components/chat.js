"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./chat.module.css"
import ChatBox from "@/components/chatbox";
import mqtt from "mqtt";
import { BounceLoader } from "react-spinners";
import { fetchChats } from "@/utils/fetchChats";
import { fetchChatMessages } from "@/utils/fetchChatMessages";
import { capitalizeFirstWord } from "@/utils/capitalizeFirstWord";
import { useSelector, useDispatch } from "react-redux";
import { setChatList, incrementUnread, resetUnread } from "@/state/chatList/chatListSlice";
import { setMessages, addMessage, addOlderMessages } from "@/state/messages/messagesSlice";
import { setChat, unsetChat } from "@/state/selectedChat/selectedChatSlice";


export default function Chat(){
    const router = useRouter()
    const [ checkingAuth, setCheckingAuth ] = useState(true)
    // AcessToken Stored in local storage to identify current user to backend
    const [ accessToken, setAccessToken ] = useState(null)
    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        if(!token){
            localStorage.clear()
            router.replace("auth/login")
            return
        }
        setAccessToken(token)
        setCheckingAuth(false)
    }, [])
    // Dispatch to use Redux Actions
    const dispatch = useDispatch()

    // User State (Redux)
    const userState = useSelector((state) => state.user.value)
    const username = userState?.user_id
    
    // ChatList State (Redux)
    const chatListState = useSelector((state) => state.chatList.value)

    // SelectedChat State (Redux)
    const selectedChatState = useSelector((state) => state.selectedChat.value)
    // Current Selected Chat's Id Ref
    const selectedChatIdRef = useRef(null)

    // MQTT Client Ref
    const clientRef = useRef(null)

    // Current Chat / Topic Ref
    const topicRef = useRef(null)

    // Mobile view 
    const [ showChatList, setShowChatList ] = useState(false) 

    // Updating currentChatIdRef on change to selectedChatId
    // Ensuring always see the latest updated chat
    useEffect(() => {
        selectedChatIdRef.current = selectedChatState?.chat_group_id
    }, [selectedChatState?.chat_group_id])

    // Search State
    const [ search, setSearch ] = useState("")
    const [ filter, setFilter ] = useState("all")
    const nameFilteredChats = chatListState.filter((chat) => {
        const name = chat.display_name.toLowerCase()
        return name.includes(search.toLowerCase())
    })
    const filteredChats = filter === "unread" ? nameFilteredChats.filter((chat) => chat.client_unread > 0) : nameFilteredChats

    // Fetching Selected Chat's Messages
    const [ offset, setOffset ] = useState(0)
    const [ doneWithOld, setDoneWithOld ] = useState(false)

    // Media Overlay State
    const [ showMediaOverlay, setShowMediaOverlay ] = useState(false)
    const [ mediaURL, setMediaURL ] = useState(null)
    const [ mediaType, setMediaType ] = useState(null)
    
    // Fetching Current User's Chats
    useEffect(() => {
        if(!accessToken) return
        const getChatList = async() => {
            const chatList = await fetchChats(accessToken)
            dispatch(setChatList(chatList))
        }
        getChatList()
    }, [accessToken])


    // MQTT Connection Setup
    useEffect(() => {
        if(!username || !accessToken || clientRef.current){
            return
        }
        const client = mqtt.connect(process.env.NEXT_PUBLIC_CHAT_BROKER, { clientId: String(username),  reconnectPeriod: 0})

        client.on("connect", () => {
            console.log("MQTT Broker Connected Successfully.")
            client.subscribe(`notification/${username}`)
        })
        const handleMessage =  (topic, message) => {
            const msgStr = message.toString()

            // Checking if the MQTT connections sends a message from the topic that is currently selected
            if (topic === topicRef.current){
                let parsed;
                try {
                    parsed = JSON.parse(msgStr)
                } catch (error) {
                    parsed = { message: msgStr }
                }
                dispatch(addMessage(parsed))
            }

            if(topic === `notification/${username}`){
                const msg = JSON.parse(msgStr)
                if(String(selectedChatIdRef.current) !== msg.chat_group_id){
                    dispatch(incrementUnread(Number(msg.chat_group_id)))
                }
            }
        }
        client.on("message", handleMessage);
        clientRef.current = client
        return () => {
            client.off("message", handleMessage)
            client.end()
        }
    }, [username, accessToken])
    
    useEffect(() => {
        if(!accessToken) return
        const getChatMessages = async() => {
            const chatMessages = await fetchChatMessages(accessToken, selectedChatState?.chat_group_id, 30, 0)
            dispatch(setMessages(chatMessages))
        }
        if(selectedChatState?.chat_group_id) getChatMessages()
    }, [selectedChatState?.chat_group_id, accessToken])
    
    const fetchOlderMessages = async() => {
        if(doneWithOld) return
        const newOffset = offset + 30
        const olderMessages = await fetchChatMessages(
            accessToken,
            selectedChatState?.chat_group_id,
            30,
            newOffset
        )
        if(olderMessages.length > 0){
            dispatch(addOlderMessages(olderMessages))
            setOffset(newOffset)    
        }
        if(olderMessages.length == 0){
            setDoneWithOld(true)
        }
    }

    // Function to handle clicking on a chat and switching the current topic to open up the chat
    const handleChatChange = (chat) => {
        if(!chat || !clientRef.current) return

        if (selectedChatState?.chat_group_id && selectedChatState.chat_group_id !== chat.chat_group_id) {
            dispatch(resetUnread(selectedChatState.chat_group_id));
            setOffset(0)
            setDoneWithOld(false)
        }

        const newTopic = !chat.is_group ? `chat/${[username, chat.receiver_id].sort().join("-")}` : `chat/${chat.chat_group_id}`
        if(topicRef.current && topicRef.current != newTopic){
            clientRef.current.unsubscribe(topicRef.current)
        }

        clientRef.current.subscribe(newTopic)
        topicRef.current = newTopic
        dispatch(setChat(chat))
        setShowChatList(false)
    }

    // Unset Selected Chat on reload
    useEffect(() => {
        dispatch(unsetChat())
    }, [])

    // Close Media Overlay when Back Button on browser is clicked
    useEffect(() => {
        const handlePopState = (e) => {
            if (showMediaOverlay) {
                e.preventDefault()
                setShowMediaOverlay(false)
                setMediaType(null)
                setMediaURL(null)
            }
        }

        window.addEventListener("popstate", handlePopState)
        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [showMediaOverlay]);

    // Close Media when Escape is pressed
    useEffect(() => {
        const handleClose = (e) => {
            if(showMediaOverlay && e.key === "Escape"){
                e.preventDefault()
                setShowMediaOverlay(false)
                setMediaType(null)
                setMediaURL(null)
            }
        }
        window.addEventListener("keydown", handleClose)
        return () => {
            window.removeEventListener("keydown", handleClose)
        }
    }, [showMediaOverlay])

    const chatters = filteredChats ? filteredChats.map((chat, index) => {
        const chatName = chat.display_name.split(" ")
        return(
            <a key={index} className={styles.chatter_cn} onClick={() => handleChatChange(chat)}>
                <img src={`${chat.is_group ? "/group.png"  : "/profile-gray.png" }`} className={`${styles.chatter_img} ${chat.is_group ? styles.group_image : ""}`}></img>
                <div className={styles.chatter_info}>
                    {/* <div className={styles.chatter_time}>12:40</div> */}
                    <div className={styles.chatter_name}>
                        {`${capitalizeFirstWord(chatName[0])} ${capitalizeFirstWord(chatName[1])}`}
                    </div>
                    {/* <div className={styles.chatter_last_msg}>
                        {chat?.lastSeenMessage || "Messages"}
                    </div> */}
                    {
                        chat.client_unread > 0 &&
                        <div className={styles.chatter_unread}>{chat.client_unread}</div>
                    }
                </div>
            </a>
        )
    }): null

    if(checkingAuth){
        return <BounceLoader color="#D3D3D3" size={16}/>
    }

    return (
        <div className={styles.chat_page}>
            <div className={styles.side_bar}>
                <div className={styles.side_bar_top}>
                    <a href="/" className={`${styles.side_bar_icon_img} ${styles.chat_img}`}></a>
                    <div className={styles.divider}></div>
                    <button 
                      className={styles.chatlist_toggle_btn} 
                      onClick={() => setShowChatList(!showChatList)}
                    >
                      ☰
                    </button>
                </div>

                <div className={styles.side_bar_bottom}>
                    <div className={`${styles.side_bar_icon_img} ${styles.settings_img}`}></div>
                    <a href="dashboard" className={`${styles.side_bar_icon_img} ${styles.profile_img}`}></a>
                </div>
            </div>

            {/* Chat List */}
            <div className={`${styles.chat_bar} ${showChatList ? styles.show_mobile : ""}`}>
                <div className={styles.chat_bar_top}>
                    <div className={styles.chat_bar_top_logo}>
                        <img src="/logo.png"></img>
                        <h2>tudify success</h2>
                    </div>
                    <div className={styles.chat_bar_top_search_cn}>
                        <img src="/search-white.png" className={styles.search_icon}></img>
                        <input 
                          className={styles.chat_bar_top_search} 
                          placeholder="Search or start a new chat." 
                          onChange={(e) => setSearch(e.target.value)} 
                          value={search}
                        />
                    </div>
                    <div className={styles.tags_list}>
                        <button className={styles.tag} onClick={() => setFilter("all")}>All</button>
                        <button className={styles.tag} onClick={() => setFilter("unread")}>Unread</button>
                    </div>
                </div>
                <div className={styles.chat_list}>
                    {chatters}
                </div>
                <div className={styles.chat_bar_bottom}></div>
            </div>

            <ChatBox  
                topicRef={topicRef}
                clientRef={clientRef}
                fetchOlderMessages={fetchOlderMessages}
                setShowMediaOverlay={setShowMediaOverlay}
                setMediaURL={setMediaURL}
                setMediaType={setMediaType}
            />

            {
                showMediaOverlay
                &&
                <div className={styles.media_overlay}>
                    <div className={styles.media_overlay_top}>
                        <button className={styles.media_overlay_close} onClick={() => {
                            setShowMediaOverlay(false)
                            setMediaType(null)
                            setMediaURL(null)
                        }}>
                            &#10005;
                        </button>
                    </div>
                    <div className={styles.media_overlay_main}>
                        <div className={styles.media_overlay_media}>
                            {
                                mediaType === "image" 
                                &&
                                <img src={mediaURL} className={styles.media}></img>
                            }
                            {
                                mediaType === "video"
                                &&
                                <video src={mediaURL} controls className={styles.media}></video>
                            }
                            {
                                mediaType === "document"
                                &&
                                <embed src={mediaURL} type="application/json" height="100%" width="1200px" className={styles.media}></embed>
                            }
                        </div>
                    </div>
                    <div className={styles.media_overlay_bottom}>
                    </div>
                </div>
            }
        </div>
    )
}