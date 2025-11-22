import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        value: []
    },
    reducers: {
        addMessage: (state, action) => {
            state.value.push(action.payload)
        },
        setMessages: (state, action) => {
            state.value = action.payload
        },
        unsetMessages: (state) => {
            state.value = []
        },
        addOlderMessages: (state, action) => {
            const olderMessages = action.payload;
            const existingIds = new Set(state.value.map(msg => msg.id));
            const filteredOlder = olderMessages.filter(msg => !existingIds.has(msg.id));
            state.value = [...filteredOlder, ...state.value];
        }
    }
})

export const { addMessage, setMessages, unsetMessages, addOlderMessages } = messagesSlice.actions