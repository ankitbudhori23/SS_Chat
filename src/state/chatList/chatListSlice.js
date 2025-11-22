import { createSlice } from "@reduxjs/toolkit";

export const chatListSlice = createSlice({
    name: "chatList",
    initialState: {
        value: []
    },
    reducers: {
        setChatList: (state, action) => {
            const incoming = action.payload
            const prevById = Object.fromEntries(state.value.map(c => [c.chat_group_id, c]));

            state.value = incoming.map(chat => {
                const prev = prevById[chat.chat_group_id];
                return {
                    ...chat,
                    client_unread: prev?.client_unread ?? chat.unread_count ?? 0
                }
            })
        },
        unsetChatList: (state) => {
            state.value = []
        },
        incrementUnread: (state, action) => {
            state.value = state.value.map(chat => {
                if(chat.chat_group_id === action.payload){
                    return {
                        ...chat,
                        client_unread: (chat.client_unread || 0) + 1
                    }
                }
                return chat
            })
        },
        resetUnread: (state, action) => {
            state.value = state.value.map(chat => {    
                if(chat.chat_group_id === action.payload){
                    return {
                        ...chat,
                        client_unread: 0,
                    };
                }
                return chat;
            });
        }
    }
})

export const { setChatList, unsetChatList, incrementUnread, resetUnread } = chatListSlice.actions