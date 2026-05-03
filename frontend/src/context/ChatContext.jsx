import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import patientService from '../services/patientService';
import api from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [hasUnread, setHasUnread] = useState(false);
    const [patient, setPatient] = useState(null);

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Initial welcome/history load
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/chat/history');
                if (res.data.success && res.data.messages.length > 0) {
                    setMessages(res.data.messages);
                } else if (user?.name) {
                    setMessages([{
                        role: 'model',
                        text: `👋 Hello ${user.name.split(' ')[0]}! I'm your RetinaAI Diabetes Assistant.\n\nI can help you to understand your diagnostic reports, explain the different stages of Diabetic Retinopathy, and provide guidance on eye health.\n\nWhat would you like to know today?`,
                        time: formatTime(new Date()),
                        id: 'welcome',
                    }]);
                }
            } catch (err) {
                console.error('Failed to fetch chat history', err);
            }
        };
        if (user) void fetchHistory();
    }, [user]);

    // Load profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await patientService.getMyProfile();
                if (res && res.success) {
                    setPatient(res.data);
                }
            } catch (err) {
                console.error('ChatContext: Failed to fetch patient profile', err);
            }
        };
        if (user && user.role === 'patient') {
            void loadProfile();
        }
    }, [user]);

    const clearChat = useCallback(async () => {
        try {
            await api.delete('/chat/history');
            setMessages([{
                role: 'model',
                text: "Chat history cleared from database! How can I help you now?",
                time: formatTime(new Date()),
                id: 'clear-' + Date.now(),
            }]);
        } catch (err) {
            console.error('Failed to clear history', err);
        }
    }, []);

    const value = {
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        isListening,
        setIsListening,
        inputValue,
        setInputValue,
        hasUnread,
        setHasUnread,
        clearChat,
        patient
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
