import React, { useState, useEffect, useContext } from 'react';
import EmpresaContext from '../../../../../../contexts/Empresa';
import api from "../../../../../../services/api";

//@ts-ignore
import Select2 from 'react-select2-wrapper';
import { usePersistedState } from '../../../../../../hooks'
import Filters from '../../../../../../components/Headers/Filters'
// import { Solicitacao } from '../../../../entities/Common';

import { hasPermission } from '../../../../../../utils';

import {
    Row,
    Col,
    Input,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "reactstrap";

import ReactDatetimeClass from 'react-datetime';
import moment from 'moment';
import InputMask from "react-input-mask";
import ReactDatetime from "react-datetime";
import Pacote from '../../../../../../entities/Common/Watch/Pacote';
import Ticket from '../../../../../../entities/Common/Watch/Ticket';

interface Props {
    title: React.ReactElement,
    data: Array<Ticket>
    notify(type: string, msg: string): void,
    load(filters: object): void
    search?: boolean
}

const FilterTickets: React.FC<Props> = ({ title, notify, load, ...props }) => {

    const { empresaSelecionada } = useContext(EmpresaContext)
    const [codigoIntegracao, setCodigoIntegracao] = usePersistedState('codigoIntegracao', null)
    // const [pesquisarByCodigoIntegracaoPadrao, setPesquisarByCodigoIntegracaoPadrao] = usePersistedState('pesquisarByCodigoIntegracaoPadrao', false)

    const [emailTicket, setEmailTicket] = usePersistedState('emailTicket', null)

    //Flag para desabilitar btn pesuisar 
    const [disableButtonSearch, setDisableButtonSearch] = useState(false)

    //Flag para definir tempo de execução
    const [runLoad, setRunLoad] = useState(true)

    const [monitorClearFilters, setMonitorClearFilters] = useState(undefined)

    useEffect(() => {
        if (monitorClearFilters) search()
    }, [monitorClearFilters])

    useEffect(() => {
        if (runLoad) {
            search()
            setRunLoad(false)
        }
    }, [runLoad])

    // useEffect(() => {        
    //     if (codigoIntegracao || emailTicket || pesquisarByCodigoIntegracaoPadrao) {
    //         setDisableButtonSearch(false)
    //     }else{
    //         setDisableButtonSearch(true)
    //     }
    // }, [emailTicket, codigoIntegracao, pesquisarByCodigoIntegracaoPadrao])

    // useEffect(() => {
    //     if (pesquisarByCodigoIntegracaoPadrao) {
    //         setCodigoIntegracao('');
    //     }
    // }, [pesquisarByCodigoIntegracaoPadrao])


    function throwError(text: string) {
        if (notify) notify('danger', text)
    }

    function search() {
        load({
            pAssinanteIDIntegracao: codigoIntegracao,
            pEmailUsuario: emailTicket,
            // notFixIdIntegracao: !pesquisarByCodigoIntegracaoPadrao,
        })
    }

    function handleClearFilter() {
        setEmailTicket('')
        setCodigoIntegracao('')
        // setPesquisarByCodigoIntegracaoPadrao(true)
    }

    function handleMultipleSelect(target: any, state: any) {
        const array = Array.from(target.selectedOptions)
        state(array.map((item: any) => item.value))
    }

    return (
        <>
            <Filters
                onSearch={search}
                // title={<h1>Tickets</h1>}
                title={title}
                clearFilters={handleClearFilter}       
                //@ts-ignore         
                onFiltersClead={setMonitorClearFilters}
                isLoading={undefined}
                disableButtonSearch={disableButtonSearch}                
                isOpen={undefined}
            >

                <Row style={{ paddingTop: 15 }}>
                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <label
                                className="form-control-label"
                            >
                                E-mail
                            </label>
                            <Input
                                placeholder='E-mail...'
                                className="form-control"
                                value={emailTicket}
                                onChange={e => setEmailTicket(e.target.value)}
                            />
                        </FormGroup>
                    </Col>

                    <Col xs="6" lg="6" sm="12" md="12">
                        <FormGroup>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flex: 1,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <label
                                    className="form-control-label"
                                >
                                    Código Integração
                                </label>
                                {/* <div className="custom-control custom-checkbox">
                                    <input
                                        className="custom-control-input"
                                        id="check-cod-integracao"
                                        type="checkbox"
                                        checked={pesquisarByCodigoIntegracaoPadrao}
                                        onChange={() => setPesquisarByCodigoIntegracaoPadrao(!pesquisarByCodigoIntegracaoPadrao)}
                                    />
                                    <label
                                        className="custom-control-label" htmlFor="check-cod-integracao">
                                        Código Padrão
                                    </label>
                                </div> */}
                            </div>
                            <Input
                                // disabled={pesquisarByCodigoIntegracaoPadrao}
                                placeholder='Código...'
                                className="form-control"
                                value={codigoIntegracao}
                                onChange={e => setCodigoIntegracao(e.target.value)}
                            />
                        </FormGroup>
                    </Col>
                </Row>

            </Filters>
        </>
    );
}

export default FilterTickets;