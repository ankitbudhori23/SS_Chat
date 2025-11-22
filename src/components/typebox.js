import { useEffect, useRef, useState } from "react"
import styles from "./typebox.module.css"
import { uploadFile } from "@/utils/uploadFile"
import { useSelector, useDispatch } from "react-redux"
import { resetUnread } from "@/state/chatList/chatListSlice"
import { BounceLoader } from "react-spinners"

export default function TypeBox({ topicRef, clientRef, groupMembers }){
    // Dispatch to use Redux Actions
    const dispatch = useDispatch()
    // Current User State (Redux)
    const userState = useSelector((state) => state.user.value)
    const userId = userState?.user_id

    // Current Selected Chat State (Redux)
    const chat = useSelector((state) => state.selectedChat.value)

    
    const [ message, setMessage ] = useState("") 
    const [ typeBoxUtil, setTypeBoxUtil ] = useState(false)
    const typeBoxRef = useRef(null)

    // File Upload (Doc / Video)
    const [ filePreview, setFilePreview ] = useState(null)
    const [ uploadedFile, setUploadedFile ] = useState(null)
    const [ fileUploading, setFileUploading ] = useState(false)

    // File Upload (Image)
    const [ imagePreviews, setImagePreviews ] = useState([])
    const [ uploadedImages, setUploadedImages ] = useState([])
    

    const handleInput = () => {
        const textarea = typeBoxRef.current
        if(textarea){
            textarea.style.height = 'auto'
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }
    }

    const handleFileSelected = (e, fileType) => {
        setTypeBoxUtil(false)
        
        if(fileType !== "image"){
            const file = e.target.files[0]
            setFilePreview({
                file,
                type: fileType,
                url: fileType === "image" || fileType === "video"
                    ? URL.createObjectURL(file) : null
            })
        }else{
            const files = Array.from(e.target.files)
            const previews = files.map((file) => ({
                file,
                type: fileType,
                url: URL.createObjectURL(file)
            }))
            setImagePreviews((prev) => [...prev, ...previews])
        }

        e.target.value = ""
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(event.target.tagName === "INPUT" || event.target.type === "file"){
                return
            }
            if(typeBoxRef.current && !typeBoxRef.current.contains(event.target)){
                setTypeBoxUtil(false)
            }
        }  
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        } 
    }, [])

    const sendMessage = () => {
        if(!topicRef.current || !clientRef.current || !chat || !userId) return

        if (
            (filePreview && !uploadedFile && fileUploading) ||
            (imagePreviews.length > 0 && (!uploadedImages || uploadedImages.length === 0) && fileUploading)
        ) {
            alert("Please wait for all files to finish uploading...");
            return;
        }

    
        let payload = {}
        if(uploadedImages.length > 0){
            payload = {
                chat_group_id: chat.chat_group_id,
                receiver_id: chat.receiver_id ?? chat.chat_group_id,
                message: message.trim() || " ",
                message_type: "image", 
                sender_id: Number(userId),
                media_url: JSON.stringify(uploadedImages),
                created_at: new Date().toISOString()
            }
        }else{
            payload = {
                chat_group_id: chat.chat_group_id,
                receiver_id: chat.receiver_id ?? chat.chat_group_id,
                message: message.trim() || " ",
                message_type: uploadedFile ? filePreview.type : "text", 
                sender_id: Number(userId),
                media_url: uploadedFile?.url || null,
                created_at: new Date().toISOString()
            }
        }

        // Publish to MQTT
        if (!message.trim() && !uploadedFile && uploadedImages.length === 0) return
        clientRef.current.publish(topicRef.current, JSON.stringify(payload))
        
        // Send Notification
        if(!chat.is_group){
            clientRef.current.publish(
                `notification/${chat.receiver_id}`,
                JSON.stringify({
                    chat_group_id: `${chat.chat_group_id}`,
                    receiver_id: `${chat.receiver_id}`,
                    message: message.trim() || " ",
                    data: {
                        chat_group_id: `${chat.chat_group_id}`,
                        display_name: `${userState.fname} ${userState.lname}` || "New message",
                        is_group: "0",
                        receiver_id: `${chat.receiver_id}`,
                        screen:"Chat",
                    }
                })
            )
        }else{
            groupMembers?.forEach((member) => {
                if(member.user_id !== userId){
                    clientRef.current.publish(
                        `notification/${member.user_id}`,
                        JSON.stringify({
                            chat_group_id: `${chat.chat_group_id}`,
                            receiver_id: `${member.user_id}`,
                            message: message.trim() || " ",
                            data: {
                                chat_group_id: `${chat.chat_group_id}`,
                                display_name: `${chat?.display_name}` || "New message",
                                is_group: "1",
                                receiver_id: `${member.user_id}`,
                                screen:"Chat",
                            },
                        })
                    )
                }
            })
        }
        
        setMessage("")
        setFilePreview(null)
        setUploadedFile(null)
        setImagePreviews([])
        setUploadedImages([])
        dispatch(resetUnread(payload.chat_group_id))
    }


    useEffect(() => {
        const upload = async () => {
            setFileUploading(true);
            const formData = new FormData();
            try {
                // Handle single file (video/document)
                if (filePreview) {
                    formData.append(filePreview.type, filePreview.file);
                    const uploaded_file = await uploadFile(formData, filePreview.type);
                    setUploadedFile(uploaded_file);
                }

                // Handle multiple or single images
                if (imagePreviews.length > 0) {
                    const imageForm = new FormData();
                    imagePreviews.forEach((img) => {
                        imageForm.append("images[]", img.file);
                    });
                    const uploaded_images = await uploadFile(imageForm, "image");
                    setUploadedImages(uploaded_images.urls);
                }
            } catch (err) {
                console.error("Upload failed:", err);
            } finally {
                setFileUploading(false);
            }
        }

        if (filePreview || imagePreviews.length > 0) {
            upload()
        }
    }, [filePreview, imagePreviews]);

    useEffect(() => {
    const handleClickOutside = (event) => {
            if (
                typeBoxRef.current && 
                typeBoxRef.current.contains(event.target)
            ) return;

            setTypeBoxUtil(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return(
        <div className={styles.type_box} ref={typeBoxRef}>
            <div className={`${styles.type_box_util_upload} ${typeBoxUtil ? styles.show : ""}`}>
                <div className={`${styles.upload_optn} ${typeBoxUtil ? styles.show : ""}`}>
                    <div className={styles.upload_optn_dis}>
                        <img src="/document.png"></img>
                        <p>Document</p>
                    </div>
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={(e) => handleFileSelected(e, "document")}
                    />
                </div>
                <div className={`${styles.upload_optn} ${typeBoxUtil ? styles.show : ""}`}>
                    <div className={styles.upload_optn_dis}>
                        <img src="/image.png"></img>
                        <p>Image</p>
                    </div>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileSelected(e, "image")}
                        multiple
                    />
                </div>
                <div className={`${styles.upload_optn} ${typeBoxUtil ? styles.show : ""}`}>
                    <div className={styles.upload_optn_dis}>
                        <img src="/video.png"></img>
                        <p>Video</p>
                    </div>
                    <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => handleFileSelected(e, "video")}
                    />
                </div>
            </div>
            {
                filePreview
                &&
                <div className={styles.file_preview}>
                    {
                        filePreview.type === "video"
                        &&
                        <video src={filePreview.url} className={styles.file_preview_video} muted/>
                    }
                    {
                        filePreview.type === "document"
                        &&
                        <span className={styles.file_preview_document}>
                            {
                                filePreview.file.name.length > 8
                                ? filePreview.file.name.slice(0, 8) + "..."
                                : filePreview.file.name
                            }
                        </span>
                    }
                    <div className={styles.file_preview_btn}>
                        {
                            uploadedFile 
                            ?
                            <button onClick={() => {
                                setFilePreview(null)
                                setUploadedFile(null)
                            }}>
                                &#10006;
                            </button>
                            :
                            <BounceLoader color="#D3D3D3" size={16}/>
                        }
                    </div>
                </div>
            }
            {
                imagePreviews.length > 0 && (
                <div className={styles.image_preview_container}>
                    {imagePreviews.map((img, idx) => (
                        <div key={idx} className={styles.image_preview_item}>
                            <img src={img.url} className={styles.image_preview} />
                            <div className={styles.image_preview_btn}>
                                <button onClick={() => {
                                    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                }}>
                                    &#10006;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className={styles.type_box_util} onClick={() => setTypeBoxUtil(prev => !prev)}></button>
            <textarea 
                placeholder="Type a message." 
                onInput={handleInput} 
                onChange={(e) => setMessage(e.target.value)} value={message}
                onKeyDown={(e) => {
                    if(e.key === "Enter" && !e.shiftKey){
                        e.preventDefault()
                        sendMessage()
                    }
                }}    
            ></textarea>
            <button className={styles.type_box_send} onClick={sendMessage}>
                <img src="/send-white.png"></img>
            </button>
        </div>
    )
}