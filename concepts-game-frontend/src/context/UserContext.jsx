import { createContext, useContext, useState, useEffect, useCallBack, useCallback } from 'react';

import { usersApi } from './api/users'

const UserContext = createContext(null)

const STORAGE_KEY = 'concepts_user'

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                // Verify user still exists in backend

                usersApi.getById(parsed.id)
                .then((u) => {
                    setUser(u)
                    setLoading(false)
                })
                .catch(() => {
                    // User was deleted from backend, clear local
                    localStorage.removeItem(STORAGE_KEY)
                    setLoading(false)
                })
            } catch {
                localStorage.removeItem(STORAGE_KEY)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [])

    const login = useCallBack((userData) => {
        setUser(userData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    // Quick-create a user (no real auth yet)
    const quickRegister = useCallback(
        async (username) => {
            const timestamp = Date.now()
            const email = `${username.toLowerCase().replace(/\s+/g, '_')}_${timestamp}@concepts.temp`
            const newUser = await usersApi.create({
                username,
                email,
                passwordHash: 'temp_no_auth',
            })
            login(newUser)
            return newUser
        }, [login])
    
    return (
        <UserContext.Provider value = {{ user, loading, login, logout, quickRegister }}>
            { children }
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error('useUser must be inside UserProvider')
    return ctx
}