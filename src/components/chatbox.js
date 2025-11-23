import React, { useMemo } from "react";
import { useRef, useEffect, useState } from "react";
import styles from "./chatbox.module.css";
import TypeBox from "./typebox";
import { capitalizeFirstWord } from "@/utils/capitalizeFirstWord";
import { useSelector } from "react-redux";
import { timeString } from "@/utils/timeString";
import { fetchGroupMembers } from "@/utils/fetchGroupMembers";
import { formatMessageDate } from "@/utils/dateFormatter";

export default function ChatBox({
  topicRef,
  clientRef,
  fetchOlderMessages,
  setShowMediaOverlay,
  setMediaURL,
  setMediaType,
}) {
  // Messages State (Redux)
  const messagesState = useSelector((state) => state.messages.value);

  // Current User State (Redux)
  const userState = useSelector((state) => state.user.value);

  // Selected Chat State (Redux)
  const chatState = useSelector((state) => state.selectedChat.value);
  const chatRef = useRef(null);
  const loadingOlderRef = useRef(false);

  // Chat Name
  const chatName = chatState?.display_name.split(" ");

  // Unread Divider
  const chatList = useSelector((state) => state.chatList.value);
  const currentChat = chatList.find(
    (c) => c.chat_group_id === chatState?.chat_group_id
  );
  const unreadCount = currentChat?.client_unread || 0;
  const dividerIndex = messagesState?.length - unreadCount;

  // Group Description Modal Box
  const [showGroupDesc, setShowGroupDesc] = useState(false);

  // Set Media State function
  const handleMedia = (url, type) => {
    setShowMediaOverlay(true);
    setMediaURL(url);
    setMediaType(type);
  };

  // Getting all group members if the selected chat is group
  const accessToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    const getMembers = async () => {
      const memberList = await fetchGroupMembers(
        accessToken,
        chatState.chat_group_id
      );
      setGroupMembers(memberList);
    };
    if (chatState?.is_group == 1) {
      getMembers();
    }
  }, [chatState]);

  // Map to quickly match sender_id with user_id to get the user_name
  const groupMembersMap = useMemo(() => {
    return new Map(groupMembers.map((u) => [u.user_id, u.name]));
  }, [groupMembers]);

  useEffect(() => {
    setShowGroupDesc(false);
  }, [chatState]);

  // Detect scroll to top and fetch older messages
  useEffect(() => {
    const container = chatRef.current;
    if (!container) return;
    const handleLoadingMessages = async () => {
      if (container.scrollTop == 0 && !loadingOlderRef.current) {
        loadingOlderRef.current = true;
        const prevScrollHeight = container.scrollHeight;
        const prevScrollFromTop = container.scrollTop;
        await fetchOlderMessages();

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            newScrollHeight - prevScrollHeight + prevScrollFromTop;
          loadingOlderRef.current = false;
        });
      }
    };
    container.addEventListener("scroll", handleLoadingMessages);
    return () => container.removeEventListener("scroll", handleLoadingMessages);
  }, [fetchOlderMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!chatRef.current) return;
    if (!loadingOlderRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messagesState, chatState?.chat_group_id]);

  return (
    <div className={styles.chat_main}>
      {!chatState || Object.keys(chatState).length == 0 ? (
        <div className={styles.chat_main_placeholder}>
          Select a group to start Conversation
        </div>
      ) : (
        <div className={styles.curr_chat_main_cn}>
          <div className={styles.curr_chat_head_cn}>
            <button
              className={styles.curr_chat_head}
              onClick={() => setShowGroupDesc(true)}
            >
              <div className={styles.curr_chat_img}>
                <img
                  src={`${
                    chatState.is_group ? "/group.png" : "/profile-gray.png"
                  }`}
                ></img>
              </div>
              <div className={styles.curr_chat_name}>
                <h2>
                  {`${capitalizeFirstWord(chatName[0])} ${capitalizeFirstWord(
                    chatName[1]
                  )}`}
                </h2>
                <div className={styles.curr_chat_status}>{`${
                  chatState.is_group ? "Group Description" : "Bio"
                }`}</div>
              </div>
            </button>
          </div>
          <div className={styles.curr_chat_main} ref={chatRef}>
            {messagesState &&
              messagesState.length > 0 &&
              messagesState.map((msg, index) => {
                const prevMsg = messagesState[index - 1];
                const showDateDivider =
                  index == 0 ||
                  new Date(msg.created_at).toDateString() !==
                    new Date(prevMsg?.created_at).toDateString();
                return (
                  <React.Fragment key={`${msg.id}-${index}`}>
                    {/* Date / Day Divider */}
                    {showDateDivider && (
                      <div className={styles.date_divider}>
                        {formatMessageDate(msg.created_at)}
                      </div>
                    )}

                    {/* New Message Divider */}
                    {index === dividerIndex && unreadCount > 0 && (
                      <div className={styles.new_messages_divider}>
                        New Messages
                      </div>
                    )}

                    {/* Chat Messages */}
                    <div
                      className={`${styles.message} ${
                        msg.sender_id === userState?.user_id
                          ? styles.curruser
                          : ""
                      }`}
                    >
                      {chatState.is_group == 1 &&
                        msg.sender_id !== userState?.user_id && (
                          <div className={styles.sender_name}>
                            {groupMembersMap.get(msg?.sender_id)}
                          </div>
                        )}
                      {msg.media_url && (
                        <>
                          {/* Image */}
                          {msg.message_type === "image" &&
                            (() => {
                              let urls = [];
                              try {
                                const parsed = JSON.parse(msg.media_url);
                                urls = Array.isArray(parsed)
                                  ? parsed
                                  : [parsed];
                              } catch (err) {
                                urls = [msg.media_url];
                              }
                              return urls.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    handleMedia(url, msg.message_type)
                                  }
                                  className={styles.message_media_cn}
                                >
                                  <img
                                    src={url}
                                    alt="image"
                                    className={`${styles.message_media} ${
                                      msg.receiver_id === chatState.receiver_id
                                        ? styles.curruser
                                        : ""
                                    }`}
                                  />
                                </button>
                              ));
                            })()}

                          {/* Video */}
                          {msg.message_type === "video" && (
                            <button
                              onClick={() =>
                                handleMedia(msg.media_url, msg.message_type)
                              }
                              className={styles.message_media_cn}
                            >
                              <video
                                src={msg.media_url}
                                controls
                                className={`${styles.message_media} ${
                                  msg.receiver_id === chatState.receiver_id
                                    ? styles.curruser
                                    : ""
                                }`}
                              />
                            </button>
                          )}

                          {/* Document */}
                          {msg.message_type === "document" && (
                            <button
                              onClick={() =>
                                handleMedia(msg.media_url, msg.message_type)
                              }
                              className={`${styles.message_media} ${
                                msg.receiver_id === chatState.receiver_id
                                  ? styles.curruser
                                  : ""
                              }`}
                            >
                              {msg.media_url.split("/").pop()}
                            </button>
                          )}
                        </>
                      )}
                      {(msg.message || msg.media_url) && (
                        <div className={styles.message_text}>
                          {msg.message || ""}
                        </div>
                      )}
                      <div className={styles.message_time}>
                        {timeString(msg?.created_at)}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
          <TypeBox
            topicRef={topicRef}
            clientRef={clientRef}
            groupMembers={groupMembers}
          />
        </div>
      )}

      {showGroupDesc && chatState && (
        <div
          className={styles.modal_overlay}
          onClick={() => {
            setShowGroupDesc(false);
          }}
        >
          <div
            className={`${styles.modal} ${
              showGroupDesc ? styles.modal_show : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className={styles.modal_close}
              onClick={() => setShowGroupDesc(false)}
            >
              &#10005;
            </button>

            <div className={styles.modal_head}>
              <div className={styles.modal_img}>
                <img
                  src={`${
                    chatState?.is_group ? "/group.png" : "/profile-gray.png"
                  }`}
                ></img>
              </div>
              <div className={styles.modal_name}>
                <h2>
                  {`${capitalizeFirstWord(chatName[0])} ${capitalizeFirstWord(
                    chatName[1]
                  )}`}
                </h2>
                <div className={styles.modal_status}>{`${
                  chatState.is_group ? "Group Description" : "Bio"
                }`}</div>
              </div>
            </div>

            {chatState.is_group === 1 && (
              <div className={styles.members}>
                <h3>Participants</h3>
                {groupMembers.map((member, index) => {
                  const name = member.name;
                  const isCurrUser =
                    name ===
                    capitalizeFirstWord(userState?.fname) +
                      " " +
                      capitalizeFirstWord(userState?.lname);
                  return (
                    <p key={index}>{`${member.name} ${
                      isCurrUser ? "(You)" : ""
                    }`}</p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
