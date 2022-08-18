import React, { useState, useEffect } from 'react';

import Select2 from "react-select2-wrapper";
import Filters from '../../../components/Headers/Filters'

import {
    Row,
    Col,
    Input,
    FormGroup,
    InputGroup,
} from "reactstrap";

export default ({ title, notify, load, ...props }) => {

    const [nome, setNome] = useState(null)
    const [cpfCnpj, setCpfCnpj] = useState(null)
    const [tipoPessoa, setTipoPessoa] = useState(['F'])
    const [sexo, setSexo] = useState(null)


    const [tiposPessoas] = useState([
        { id: 'F', text: 'Pessoa Física' },
        { id: 'J', text: 'Pessoa Jurídica' }
    ])
    const [sexos] = useState([
        { id: 'F', text: 'Feminino' },
        { id: 'M', text: 'Masculino' },
        { id: 'O', text: 'Outro' }])

    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(props.search ? props.search : true)

    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])


    function throwError(text) {
        if (notify) notify('danger', text)
    }


    function search() {
        load({
            nome,
            tipoPessoa,
            sexo,
            cpfCnpj
        })
    }

    function handleMultipleSelect(target, state) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={search}
                title={<h1>Clientes</h1>}
            >
                <Row className="py-4">
                    <Col >
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                Nome
                                    </label>
                            <Input
                                className="form-control-alternative"
                                placeholder="Nome do cliente..."
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                    <Col >
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Tipo da pessoa
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    onSelect={(e) => handleMultipleSelect(e.target, setTipoPessoa)}
                                    onUnselect={(e) => handleMultipleSelect(e.target, setTipoPessoa)}
                                    options={{
                                        placeholder: "Selecione tipos de pessoas..."
                                    }}
                                    value={tipoPessoa}
                                    data={tiposPessoas}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                    <Col >
                        <FormGroup>
                            <label
                                className="form-control-label"
                                htmlFor="example-number-input"
                            >
                                Sexo
                            </label>
                            <InputGroup className="input-group-alternative">
                                <Select2
                                    multiple
                                    onSelect={(e) => handleMultipleSelect(e.target, setSexo)}
                                    onUnselect={(e) => handleMultipleSelect(e.target, setSexo)}
                                    options={{
                                        placeholder: "Selecione sexo..."
                                    }}
                                    value={sexo}
                                    data={sexos}
                                />
                            </InputGroup>
                        </FormGroup>
                    </Col>
                </Row>
            </Filters>
        </>
    );
}
