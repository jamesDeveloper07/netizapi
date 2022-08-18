import React, { useState, useContext, useEffect } from 'react';
import EmpresaContext from "../../../../../contexts/Empresa";
import api from "../../../../../services/api";
//@ts-ignore
import Select2 from "react-select2-wrapper";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Modal,
    Row,
    Col,
    Spinner
} from "reactstrap";
import { Campanha } from '../../../../../entities/Marketing';

// import { Container } from './styles';

type Props = {
    show: boolean,
    hidde(): void,
    cliente_id: number,
    onSucess(): void
}

const Form: React.FC<Props> = ({ show, hidde, cliente_id, onSucess }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [campanha, setCampanha] = useState<number | undefined>(undefined)
    const [campanhas, setCampanhas] = useState(new Array<Campanha>())
    const [erros, setErros] = useState<{ campanha_id?: string }>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadCampanhas()
    }, [])

    useEffect(() => {
        setCampanha(undefined)
    }, [show])

    async function loadCampanhas() {
        try {

            const response = await api.get(`common/empresas/${empresaSelecionada?.id}/campanhas`, {
                params: {
                    afiliacao: true
                }
            })
            setCampanhas(response.data)
        } catch (error) {
            console.error(error)

        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            setErros({})
            await api.post(`common/empresas/${empresaSelecionada?.id}/clientes/${cliente_id}/afiliados`, {
                campanha_id: campanha
            })
            hidde()
            onSucess()
        } catch (error) {
            console.error(error)
            if (error.response && error.response.status == 400) {
                const erro = {}
                const data = error.response.data
                for (let err of data) {
                    //@ts-ignore
                    erro[err.field] = err.message
                }
                setErros(erro)
            }
        }
        setSaving(false)
    }

    return (
        <Modal
            className="modal-dialog-centered"
            isOpen={show}
            size='md'
            toggle={hidde}
        >
            <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                    Novo Link de Anúncio
            </h5>
            </div>
            <div className="modal-body">

                <FormGroup>
                    <legend className="w-auto" style={{ margin: 0 }}>
                        <label className="form-control-label" >
                            Selecione uma campanha
                                        </label>
                    </legend>
                    <Select2
                        className="form-control"
                        //@ts-ignore
                        onSelect={(e) => setCampanha(e.target.value)}
                        value={campanha}
                        data={campanhas.map(item => ({
                            id: item.id,
                            text: item.nome
                        })
                        )}
                    />
                    <small className="text-danger">
                        {erros.campanha_id || ""}
                    </small>
                </FormGroup>

            </div>
            <div className="modal-footer">
                <Button
                    color="link"
                    data-dismiss="modal"
                    type="button"
                    onClick={hidde}
                >
                    Fechar
            </Button>
                <Button
                    color="primary"
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {
                        saving &&
                        <Spinner
                            className="mr-2"
                            size="sm"
                            color="secondary"
                        />
                    }
                    Gerar Link
            </Button>
            </div>
        </Modal>
    );

}

export default Form;