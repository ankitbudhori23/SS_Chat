import { createSlice } from "@reduxjs/toolkit";

export const selectedChatSlice = createSlice({
    name: "selectedChat",
    initialState: {
        value: null
    },
    reducers: {
        setChat: (state, action) => {
            state.value = action.payload
        },
        unsetChat: (state) => {
            state.value = null
        }
    }
})

export const { setChat, unsetChat } = selectedChatSlice.actions