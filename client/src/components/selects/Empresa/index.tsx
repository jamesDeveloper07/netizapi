import React, { useState, useContext, useEffect, SyntheticEvent } from 'react';

import { Empresa } from '../../../entities/Common'
// import { Container } from './styles';

//@ts-ignore
import Select2 from "react-select2-wrapper";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Modal,
    Row,
    Col
} from "reactstrap";

interface ISelectEmpresa {
    show: boolean,
    onSelectEmpresa(empresa: Empresa): void
    empresas: Array<Empresa>
}

const SelectEmpresa: React.FC<ISelectEmpresa> = ({ show, onSelectEmpresa, empresas }) => {

    const [empresa, setEmpresa] = useState<number | undefined>(undefined)

    function handleSelectEmpresa(event: React.SyntheticEvent) {
        let target = event.target as HTMLInputElement;
        const value = target.value
        setEmpresa(value ? parseInt(value) : undefined)
    }
    function hanldeConfirmEmpresa() {
        if (empresa) {
            const find = empresas.find(item => item.id == empresa)
            onSelectEmpresa(find as Empresa)
        }
    }

    return (
        <>
            <Modal
                className="modal-dialog-centered modal-info"
                contentClassName="bg-gradient-info"
                isOpen={show}
            >
                <div className="modal-header">
                    <h6 className="modal-title" id="modal-title-notification">

                    </h6>
                </div>
                <div className="modal-body">
                    <div className="py-3 text-center">
                        <i className="ni ni-bell-55 ni-3x" />
                        <h4 className="heading mt-4">Selecione um empresa</h4>
                        <p>
                            Precisamos que uma empresa seja selecionada para o sistema poder carregar as informações corretas em tela
                  </p>
                        <Select2
                            defaultValue="-1"
                            onSelect={handleSelectEmpresa}
                            options={{
                                placeholder: "Selecione uma empresa..."
                            }}
                            value={empresa}
                            data={empresas.map(it => ({ id: it.id, text: it.nome }))}
                        />
                    </div>
                </div>
                <div className="modal-footer">

                    <Button
                        onClick={hanldeConfirmEmpresa}
                        className="btn-white" color="default" type="button">
                        Continuar
                </Button>
                </div>
            </Modal>
        </>
    )
}

export default SelectEmpresa;