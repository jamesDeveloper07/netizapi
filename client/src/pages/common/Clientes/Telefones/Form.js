import React, { useState, useContext } from 'react';
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
} from "reactstrap";

export default ({ notify, close, onSuccess, telefonesAdicionados = [], clienteId }, ...props) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [tiposTelefones] = useState([
        { id: 'celular', text: 'Celular' },
        { id: 'residencial', text: 'Residencial' },
        { id: 'comercial', text: 'Comercial' }
    ])
    const [ddd, setDdd] = useState(null)
    const [numero, setNumero] = useState(null)
    const [tipoTelefone, setTipoTelefone] = useState('celular')

    const [erros, setErros] = useState({})

    async function insert() {
        try {
            await api.post(`/common/empresas/${empresaSelecionada?.id}/clientes/${clienteId}/telefones`, {
                ddd: ddd.replace(/[^\d]/, ''),
                tipo_telefone: tipoTelefone,
                numero: numero.replace(/[^\d]/, '')
            })
            updateErros(null)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            if (notify) notify('danger', 'Não foi possível adicionar telefone')
            if (error.response) updateErros(error.response.data)
        }
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

    function handleSave() {
        if (clienteId) {
            insert()
        } else {
            if (valid()) {
                onSuccess({ ddd: ddd.replace(/[^\d]/, ''), tipo_telefone: tipoTelefone, numero: numero.replace(/[^\d]/, '') })
            }
        }
    }

    function valid() {
        const error = {}
        if (!ddd || ddd <= 0) {
            error['ddd'] = 'Selecione o ddd'
        }
        if (!numero || numero <= 0) {
            error['numero'] = 'Selecione o número'
        }
        if (!tipoTelefone) {
            error['tipo_telefone'] = 'Selecione o tipo de telefone'
        }
        if (alreadyExist()) {
            error['numero'] = 'Você já adicionou este númere'
        }
        setErros(error)
        return !error.ddd && !error.numero && !error.tipo_telefone
    }

    function alreadyExist() {
        const numeroLocal = telefonesAdicionados.find(telefone => (telefone.ddd == ddd && telefone.numero == numero))
        return numeroLocal
    }

    return (
        <>
            <Row>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Tipo do telefone
                        </label>
                        <Select2
                            defaultValue="celular"
                            onSelect={(e) => setTipoTelefone(e.target.value)}
                            options={{
                                placeholder: "Tipo do telefone..."
                            }}
                            value={tipoTelefone}
                            data={tiposTelefones}
                        />
                        <small class="text-danger">
                            {erros.tipo_telefone || ''}
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
                            DDD
                        </label>
                        <InputMask
                            mask="99"
                            maskPlaceholder={null}
                            className="form-control"
                            placeholder="DDD..."
                            value={ddd}
                            onChange={e => setDdd(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.ddd || ''}
                        </small>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <label
                            className="form-control-label"
                        >
                            Número
                        </label>
                        <Input
                            maxlength="10"
                            className="form-control"
                            type="number"
                            placeholder="Número..."
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                        />
                        <small class="text-danger">
                            {erros.numero || ''}
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
                        >
                            Salvar
                          </Button>
                    </div>
                </Col>
            </Row>
        </>
    );
}
