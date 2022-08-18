import React, { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api'
import { Empresa } from "../entities/Common"
import { empresaStorageKey } from "../utils";
import Login from "../pages/security/auth/SignIn";

import AuthContext from './Auth'

import SelectEmpresa from '../components/selects/Empresa'
import Progress from '../components/Progress'

interface IEmpresaContextData {
    empresaSelecionada: Empresa | undefined,
    changeEmpresaSelecionada(empresa: Empresa | undefined): void
    empresas: Array<Empresa>
    loading: boolean,
    routes: Array<any> | undefined
}

interface IEmpresaProvider {

}

const EmpresaContext = createContext<IEmpresaContextData>({} as IEmpresaContextData)

export const EmpresaProvider: React.FC<IEmpresaProvider> = ({ children, ...props }) => {

    const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | undefined>(undefined)
    const [empresas, setEmpresas] = useState(new Array<Empresa>())
    const [routes, setRoutes] = useState(new Array<any>())
    const [loading, setLoading] = useState<boolean>(false)

    const { refreshRoles } = useContext(AuthContext)

    function changeEmpresaSelecionada(empresa: Empresa | undefined): void {
        if (empresa) {
            localStorage.setItem(empresaStorageKey, JSON.stringify(empresa))
        } else {
            localStorage.removeItem(empresaStorageKey)
        }
        setEmpresaSelecionada(empresa)
    }

    useEffect(() => {
        document.title = empresaSelecionada ? `Netiz - ${empresaSelecionada.nome}` : `Netiz`
        loadRoutes();
        refreshRoles(empresaSelecionada?.id)
    }, [empresaSelecionada])

    useEffect(() => {
        loadEmpresas()
    }, [])

    useEffect(() => {
        loadEmpresaFromStorage()
    }, [empresas])



    const loadRoutes = async () => {
        //setLoading(true)
        // console.log('ENTROU NO LOAD_ROUTES EM CONTEXT EMPRESA')
        try {
            //const response = await api.get('security/sessions/empresas')
            const response = await api.get(`/security/sessions/menus?empresa_id=${empresaSelecionada?.id}`)
            const data = await response.data
            setRoutes(data as Array<any>)
        } catch (err) {
            console.error(err)
        }
        //setLoading(false)
    }

    const loadEmpresas = async () => {
        setLoading(true)
        try {
            const response = await api.get('security/sessions/empresas')
            const data = await response.data
            setEmpresas(data as Array<Empresa>)
            if (response.data.length === 1 && !empresaSelecionada) {
                const empresa = response.data[0]
                changeEmpresaSelecionada(empresa)
            }
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    function loadEmpresaFromStorage() {
        if (empresas.length === 0) return

        const empresaId = localStorage.getItem('empresaId')
        const stogareEmpresa = localStorage.getItem(empresaStorageKey)
        if (empresaId) {
            const empresaNaLista = empresas.find(empresa => empresa.id == parseInt(empresaId))
            changeEmpresaSelecionada(empresaNaLista)
            localStorage.removeItem('empresaId')
        } else if (stogareEmpresa) {
            const empresa = JSON.parse(stogareEmpresa) as Empresa
            const empresaNaLista = empresas.find(item => item.id == empresa.id)
            changeEmpresaSelecionada(empresaNaLista)
        }
    }

    return (
        <EmpresaContext.Provider value={{
            empresaSelecionada,
            empresas,
            changeEmpresaSelecionada,
            loading,
            routes
        }}>
            {
                loading ?
                    <Progress />
                    :
                    <>
                        {children}
                        <SelectEmpresa
                            show={!loading && !empresaSelecionada}
                            empresas={empresas}
                            onSelectEmpresa={changeEmpresaSelecionada}
                        />
                    </>

            }
        </EmpresaContext.Provider>
    )
}


export default EmpresaContext;