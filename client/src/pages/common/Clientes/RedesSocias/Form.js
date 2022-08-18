import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../contexts/Empresa'
import api from "../../../../services/api";

import InputMask from "react-input-mask";
import Select2 from "react-select2-wrapper";
import {
    Button,
    Row,
    Col,
    Input,
    FormGroup,
    Spinner,
} from "reactstrap";

export default ({
    notify,
    close,
    onSuccess,
    redeSocial = {},
    redesAdicionadas = [],
    tiposRedesSociais = [],
    clienteId },
    ...props) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [id, setId] = useState(null)
    const [tipo, setTipo] = useState(null)
    const [endereco, setEndereco] = useState('')
    const [saving, setSaving] = useState(false)

    const [erros, setErros] = useState({})

    useEffect(() => {
        fillRedeSocial(redeSocial)
    }, [redeSocial])

    function fillRedeSocial(redeSocial) {
        setId(redeSocial.id)
        setTipo(redeSocial.tipo)
        setEndereco(redeSocial.endereco)
    }

    async function insert() {
        setSaving(true)
        try {
            await api.post(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/redes-sociais`, {
                tipo,
                endereco
            })
            updateErros(null)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            if (notify) notify('danger', 'Não foi possível adicionar rede social')
            if (error.response && error.response.status === 400) updateErros(error.response.data)
        }
        setSaving(false)
    }

    async function update() {
        setSaving(true)
        try {
            await api.put(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/redes-sociais/${id}`, {
                tipo,
                endereco
            })
            updateErros(null)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            if (notify) notify('danger', 'Não foi possível alterar rede social')
            if (error.response && error.response.status === 400) updateErros(error.response.data)
        }
        setSaving(false)
    }

    function updateErros(error) {
        if (error && error instanceof Array) {
            const errors = {}
            for (let e of error) {
                errors[e.field] = e.message
            }
            setErros(errors)
        } else {
            setErros({})
        }
    }

    async function handleSave() {
        if (clienteId) {
            if (id) {
                await update()
            } else {
                await insert()
            }
        } else {
            if (valid()) {
                onSuccess({ tipo, endereco })
            }
        }
    }

    function valid() {
        const error = {}

        var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        var regex = new RegExp(expression);

        if (!endereco || endereco.length === 0) {
            error['endereco'] = 'Informe o endereço da rede social'
        } else if (!endereco.match(regex)) {
            error['endereco'] = 'Informe o endereço válido'
        }
        if (!tipo || tipo.length === 0) {
            error['tipo'] = 'Selecione o tipo da rede social'
        }
        if (alreadyExist()) {
            error['endereco'] = 'Você já adicionou este endereço'
        }
        setErros(error)
        return !error.endereco && !error.tipo
    }

    function alreadyExist() {
        const enderecoLocal = redesAdicionadas.find(redeSocial => redeSocial.endereco === endereco)
        return enderecoLocal
    }

    return (
        <>
            <Row>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Rede social
                        </label>
                        <Select2
                            onSelect={(e) => setTipo(e.target.value)}
                            options={{
                                placeholder: "Rede social..."
                            }}
                            value={tipo}
                            data={tiposRedesSociais}
                        />
                        <small class="text-danger">
                            {erros.tipo || ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Endereço
                        </label>
                        <Input
                            className="form-control"
                            placeholder="ex.: https://facebook.com.br/user_name"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.endereco || ''}
                        </small>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="float-right ">
                        <Button
                            className="ml-auto"
                            color="link"
                            data-dismiss="modal"
                            type="button"
                            onClick={() => close()}
                        >
                            Fechar
                          </Button>
                        <Button
                            color="primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {
                                saving &&
                                <Spinner
                                    size='sm'
                                    color='secondary'
                                    className='mr-2'
                                />
                            }
                            Salvar
                          </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
}
