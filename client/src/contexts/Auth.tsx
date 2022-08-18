import React, { useState, useEffect, createContext } from 'react';
import api from '../services/api'
import { User, Auth, Permission } from "../entities/Security";
import { AxiosResponse } from 'axios';
import { userStorageKey, authStorageKey } from "../utils";
import Progress from '../components/Progress'
import { askForPermission } from '../services/push-notification'



interface IAuthContextData {
    user: User | undefined,
    auth: Auth | undefined,
    signed: boolean,
    hasPermission(permission: string): boolean,
    hasRole(role: string): boolean,
    signin(email: string, password: string): Promise<void>,
    refreshRoles(empresa_id: number | undefined): Promise<void>,
    signout(): Promise<void>,
    saveAuth(response: AxiosResponse): Promise<void>,
    loading: boolean,
}

interface IAuthProvider {

}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData)

export const AuthProvider: React.FC<IAuthProvider> = ({ children, ...props }) => {

    const [user, setUser] = useState<User | undefined>(undefined)
    const [auth, setAuth] = useState<Auth | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!loading) loadStorageData()
    }, [])


    async function signin(email: string, password: string) {
        const response = await api.post('/sessions', {
            email,
            password,
        })

        await saveAuth(response)
    }


    async function refreshRoles(empresa_id?: number) {
        const response = await api.post('/sessions/refresh-roles', {
            empresa_id
        })

        await refreshUserRoles(response)
    }

    async function refreshUserRoles(response: AxiosResponse): Promise<void> {

        console.log('Entrou no REFRESH USER')

        const { user } = await response.data
        saveUserData(user)
        setUser(user)
    }

    const hasPermission = (permission: string): boolean => {
        let permissions = user?.roles?.map(item => item.permissions)?.map(item => item?.find(it => it.slug == permission))
        if (!permission) return false

        for (let p of (permissions as Array<Permission>)) {
            if (p && p.slug) return true
        }
        return false
    }

    const hasRole = (role: string): boolean => {
        let roles = user?.roles?.find(item => item.slug === role)
        return !!roles
    }


    async function saveAuth(response: AxiosResponse): Promise<void> {

        console.log('Entrou no SAVE AUTH')

        const { user, auth } = await response.data
        saveUserData(user)
        localStorage.setItem(authStorageKey, JSON.stringify(auth))

        setUser(user)
        setAuth(auth)
    }

    function saveUserData(user: object) {
        localStorage.setItem(userStorageKey, JSON.stringify(user))
    }

    async function loadStorageData(): Promise<void> {
        console.log('Entrou no LOAD STORAGE DATA')
        setLoading(true)
        await loadUserStorageData()
        loadAuthStorageData()
        await checkSession()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setLoading(false)
    }

    async function loadUserStorageData() {
        const storagedUser = localStorage.getItem(userStorageKey)
        const oldUser = localStorage.getItem('user')
        if (storagedUser) {
            setUser(JSON.parse(storagedUser))
            console.log('Passou pelo LOAD USER STORAGE DATA')
            setTimeout(askForPermission, 3000)
        }
        if (oldUser) {
            await signout()
        }
    }


    function loadAuthStorageData() {
        const storagedAuth = localStorage.getItem(authStorageKey)
        if (storagedAuth) {
            setAuth(JSON.parse(storagedAuth))
        }
    }

    async function updateToken(): Promise<void> {
        try {
            const storagedAuth = localStorage.getItem(authStorageKey)
            if (storagedAuth) {
                const authObject = JSON.parse(storagedAuth as string)
                const response = await api.post('/sessions', {
                    refresh_token: authObject.refreshToken
                })
                const data = await response.data
                localStorage.setItem(authStorageKey, JSON.stringify(data))
                loadAuthStorageData()
            }
        } catch (error) {
            console.error(error)
            await signout()
        }
    }

    async function checkSession(): Promise<void> {
        try {
            const response = await api.get('/sessions')
            saveUserData(await response.data)
        } catch (error) {
            //@ts-ignore
            if (error.response && error.response.status === 401) {
                await updateToken()
            }
        }
    }

    async function signout() {
        sessionStorage.clear()
        localStorage.clear()
        setUser(undefined)
        setAuth(undefined)
    }


    return (
        <AuthContext.Provider value={{
            user,
            signin,
            signout,
            saveAuth,
            refreshRoles,
            hasPermission,
            hasRole,
            auth,
            signed: user != undefined,
            loading
        }}>
            {
                loading
                    ?
                    <Progress />
                    :
                    children
            }
        </AuthContext.Provider>
    )
}


export default AuthContext;