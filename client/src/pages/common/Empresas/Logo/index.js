import React, { useState, useEffect } from 'react';
import api from "../../../../services/api";

import { useDropzone } from 'react-dropzone';
import { Image } from './styles'
import {
    Spinner,
} from "reactstrap";


export default ({ empresa,
    notify,
    history,
    onEmpresaChange,
    ...props }) => {

    const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
        noClick: true,
        noKeyboard: true,
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            const newFile = acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }))
            if (newFile.length === 0) return

            setLogo(newFile[0])
            onEmpresaChange({
                ...empresa,
                logo: null,
                logo_url: newFile[0].preview
            })
        }
    });

    const [logo, setLogo] = useState(null)
    const [savingAvatar, setSavingAvatar] = useState(false)

    useEffect(() => {
        if (logo != null) saveLogo()
    }, [logo])


    async function saveLogo() {
        setSavingAvatar(true)
        try {
            let formData = new FormData()
            formData.append("logo", logo);
            const response = await api.post(`/common/empresas/${empresa.id}/logos`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                })
            onEmpresaChange(response.data)
        } catch (error) {
            notify('danger', 'Não foi possível alterar imagem')
        }
        setSavingAvatar(false)
    }

    return (
        <>


            <div {...getRootProps({ className: 'dropzone' })}>
                <div
                    title='Alterar foto'
                    onClick={open}
                    style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {
                        (empresa.logo && empresa.logo.length > 0) ?
                            <a href="#" onClick={e => e.preventDefault()} >
                                <Image
                                    alt="logo"
                                    style={{ maxHeight: 50 }}
                                    src={empresa.logo_url}
                                />
                            </a>
                            :
                            <a
                                className="avatar avatar-xl rounded-circle "
                                href="#"
                                onClick={e => e.preventDefault()}
                            >
                                {empresa.nome.substring(0, 1)}
                            </a>

                    }
                    <Spinner
                        hidden={!savingAvatar}
                        color="light"
                        size="md"
                    />
                </div>

                <input {...getInputProps()} />
            </div>
        </>
    )

}