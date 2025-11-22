"use client"

import { configureStore } from "@reduxjs/toolkit";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { userSlice } from "./user/userSlice";
import { chatListSlice } from "./chatList/chatListSlice";
import { selectedChatSlice } from "./selectedChat/selectedChatSlice";
import { messagesSlice } from "./messages/messagesSlice";

// Load / Rehydrate State from localStorage
function loadState(){
    try {
        const serialisedData = localStorage.getItem("reduxState")
        if(!serialisedData) return undefined
        return JSON.parse(serialisedData)
    } catch (error) {
        console.warn("Could not load state,", error)
        return undefined
    }
}

// Save / store state to localStorage
function saveState(state){
    try {
        const serialisedData = JSON.stringify(state)
        localStorage.setItem("reduxState", serialisedData)
    } catch (error) {
        console.warn("Could not save state,", error)
    }
}

export default function ReduxProvider({ children }){
    const [ store, setStore ] = useState(null)

    useEffect(() => {
        const storeInstance = configureStore({
            reducer: {
                user: userSlice.reducer,
                chatList: chatListSlice.reducer,
                selectedChat: selectedChatSlice.reducer,
                messages: messagesSlice.reducer
            },
            preloadedState: loadState()
        })

        storeInstance.subscribe(() => {
            saveState(storeInstance.getState())
        })
        setStore(storeInstance)
    }, [])

    if(!store) return null

    return(
        <Provider store={store}>
            { children }
        </Provider>
    )
}