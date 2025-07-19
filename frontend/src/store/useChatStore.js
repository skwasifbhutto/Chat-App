import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get("/message/user");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.messages || "Failed to fetch users");
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async () => {
        set({ isMessagesLoading: true });
        try {
            const { selectedUser } = get();
            console.log('Fetching messages for user:', selectedUser);
            if (!selectedUser) {
                toast.error("No user selected");
                return;
            }

            const url = `/message/${selectedUser._id}`;
            console.log('Requesting:', url);
            const res = await axiosInstance.get(url);
            if (res?.data) {
                set({ messages: res.data });
            } else {
                toast.error("No messages found");
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error(error.response?.data?.messages || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            if (res?.data) {
                set({ messages: [...messages, res.data] });
            } else {
                toast.error("Invalid message data received");
            }
        } catch (error) {
            toast.error(error.response?.data?.messages || "Failed to send message");
        }
    },
    subscribeToMessage:()=>{
        const {selectedUser}=get()
        if(!selectedUser)return;

        const socket=useAuthStore.getState().socket;

        socket.on("newMessage",(newMessage)=>{
            set({
                messages:[...get().messages,newMessage]
            })
        })

        socket.on("typing", ({ userId, isTyping }) => {
            const { selectedUser } = get();
            if (userId === selectedUser?._id) {
                set({ isTyping });
            }
        });

    },
    unsubscribeFromMessage:()=>{
        const socket=useAuthStore.getState().socket;
        socket.off("newMessage");
        socket.off("typing");
    },

    setTyping: (isTyping) => {
        const socket = useAuthStore.getState().socket;
        const { selectedUser } = get();
        if (selectedUser) {
            socket.emit("typing", { receiverId: selectedUser._id, isTyping });
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
