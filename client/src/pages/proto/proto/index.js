import React from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import api from "../../../services/api";
import Select2 from "react-select2-wrapper";
import NotificationAlert from "react-notification-alert";



// reactstrap components
import {
    Button,
    UncontrolledTooltip,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    FormGroup,
    Input,
    ListGroupItem,
    ListGroup,
} from "reactstrap";
// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'
const { SearchBar } = Search;
const pagination = paginationFactory({
    page: 1,
    alwaysShowAllBtns: true,
    showTotal: true,
    withFirstAndLast: false,
    paginationTotalRenderer: (from, to, size) => {
        const margin = {
            paddingLeft: '4px'
        }
        return (
            <span className="react-bootstrap-table-pagination-total" style={margin}>
                Exibindo {from} de {to} do total de {size}.
            </span>
        )
    },
    sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
        <div className="dataTables_length" id="datatable-basic_length">
            <label>
                Exibir{" "}
                {
                    <select
                        name="datatable-basic_length"
                        aria-controls="datatable-basic"
                        className="form-control form-control-sm"
                        onChange={e => onSizePerPageChange(e.target.value)}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                }{" "}
                itens.
      </label>
        </div>
    )
});



class Publicacoes extends React.Component {


    state = {
        edit: null,
        alert: null,
        clientes: this.createDataTable([]),
        localStorageEmpresaAnterior: 0,
        filtrosModal: false,
        tipoPessoa: ["Pessoa Física", "Pessoa Jurídica"],
        filtros: [
            { value: 'nome', text: "Nome" },
            { value: 'cpf_cnpj', text: "CPF ou CNPJ" },
            { value: 'tipo_pessoa', text: "Tipo de pessoa" },
            { value: 'dt_cadastro', text: "Data de cadastro" }],
        filtrosForm: {
            filtros_selecionados: {
                value: ["nome"],
                valid: true,
                message: ""
            },
            nome: {
                value: "",
                valid: true,
                message: ""
            },
            cpf_cnpj: {
                value: "",
                valid: true,
                message: ""
            },
            dt_inicio: {
                value: "",
                valid: true,
                message: ""
            },
            dt_fim: {
                value: "",
                valid: true,
                message: ""
            },
            tipo_pessoa: {
                value: "",
                valid: true,
                message: ""
            },
            dt_cadastro: {
                value: "",
                valid: true,
                message: ""
            }
        }
    }

    notify = (type, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span data-notify="message">
                        {msg}
                    </span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 7
        };
        this.refs.notificationAlert.notificationAlert(options);
    };

    onNewClicked = async (e) => {
        e.preventDefault();
        this.props.history.push('/admin/proto/cadastrar')
    }

    dataNascimentoFormatter(cell, row) {
        const dt = new Date(row.data_nascimento)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return (
            <>
                {dt.toLocaleDateString('pt-br', options)}
            </>
        )
    }
    dataCadastroFormatter(cell, row) {
        const dt = new Date(row.created_at)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return (
            <>
                {dt.toLocaleDateString('pt-br', options)}
            </>
        )
    }

    acoesFormatter(cell, row, context) {
        return (
            <>
                <div class="btn-group" role="group" aria-label="Basic example">
                    <UncontrolledTooltip
                        delay={0}
                        placement="top"
                        target={"btn_edit_" + row.id}
                    >
                        Alterar
                    </UncontrolledTooltip>
                    <Button
                        key={row.id}
                        className="btn-sm"
                        color="secondary"
                        onClick={() => context.goToEdit(row.id)}
                        id={"btn_edit_" + row.id}
                        outline>
                        <i class="far fa-edit"></i>
                    </Button>
                </div>
            </>
        )
    }

    //Vai para a tela de edição
    goToEdit(id) {
        this.props.history.push(`/admin/publicacoes/${new Number(id)}/edit`)
    }

    valorFormatter(cell, row) {
        return (
            <>
                {Number(row.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </>
        )
    }



    sexoFormatter(cell, row) {
        console.log(row.sexo)
        let sexo = row.sexo
        if (sexo == "M") sexo = "Masculino"
        if (sexo == "F") sexo = "Feminino"
        if (sexo == "O") sexo = "Outro"
        return (
            <>
                {sexo}
            </>
        )
    }
    tipoPessoaFormatter(cell, row) {
        let tp = row.tipo_pessoa == "PF" ? "Pessoa Física" : "Pessoa Jurídica"

        return (
            <>
                <span>{tp}</span>
            </>
        )
    }



    createDataTable(data) {

        return (
            <ToolkitProvider
                data={data}
                keyField='id'
                columns={[
                    {
                        dataField: "nome",
                        text: 'Nome',
                        sort: true,
                    },
                    {
                        dataField: "cpf_cnpj",
                        text: 'CPF ou CNPJ',
                        sort: true,
                    },
                    {
                        dataField: "tipo_pessoa",
                        text: 'Tipo Pessoa',
                        formatter: this.tipoPessoaFormatter,
                        sort: true,
                    },
                    {
                        dataField: "empresa",
                        text: 'Empresa',
                        sort: true,
                    },
                    {
                        dataField: "created_at",
                        text: 'Data Cadastro',
                        formatter: this.dataCadastroFormatter,
                        sort: true,
                    },
                    {
                        dataField: "sexo",
                        text: 'Sexo',
                        formatter: this.sexoFormatter,
                        sort: true,
                    },

                    {
                        dataField: "data_nascimento",
                        text: 'Data Nascimento',
                        formatter: this.dataNascimentoFormatter,
                        sort: true,
                    },


                ]}
                search={{ searchFormatted: true }}

            >
                {props => (
                    <div className="py-4 table-responsive">
                        <div
                            id="datatable-basic_filter"
                            className="dataTables_filter float-right"
                        >
                            <label>
                                <SearchBar
                                    className="form-control-sm"
                                    placeholder="Pesquisar..."
                                    {...props.searchProps}
                                />
                            </label>
                        </div>
                        <BootstrapTable
                            {...props.baseProps}
                            bootstrap4={true}
                            pagination={pagination}
                            bordered={false}
                            rowEvents={{
                                onMouseEnter: (e) => {
                                    e.target.parentNode.style = "background: #ececec; cursor:pointer"
                                },
                                onMouseLeave: (e) => e.target.parentNode.style = "background: #fff",
                                onClick: (e, row, rowIndex) => {
                                    // this.goToEdit(row.id)
                                }
                            }
                            }
                        />
                    </div>
                )}
            </ToolkitProvider>
        )
    }


    setClientes(data) {
        this.setState({
            clientes: this.createDataTable(data)
        })
    }

    async loadClientes() {
        try {
            const response = await api.get('common/clientes/' + localStorage.empresaId)
            this.setClientes(response.data)


            if (response.data[0]) {
            }

        } catch (err) {
            this.notify('danger', 'Houve um problema ao carregar as publicações.');
        }

    }
    hideModal = state => {
        this.setState({
            [state]: false
        });
    };
    showModal = state => {
        this.setState({
            [state]: true
        });
    };

    createBtnFiltros = e => {
        return (
            <>
                <ListGroup className="mt-3">
                    <ListGroupItem
                        className="list-group-item-action "
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tag="a"
                    >
                        <span className="text-success">●</span>   Comprara apartamento
                    </ListGroupItem>
                    <ListGroupItem
                        className="list-group-item-action"
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tag="a"
                    >
                        <span className="text-success">●</span> Casar ou não casar
                    </ListGroupItem>
                    <ListGroupItem
                        className="list-group-item-action"
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tag="a"
                    >
                        <span className="text-success">●</span> Comprar uma bicicleta
                    </ListGroupItem>
                    <ListGroupItem
                        className="list-group-item-action"
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tag="a"
                    >
                        <span className="text-success">●</span> Mudar de emprego
                    </ListGroupItem>
                    <ListGroupItem
                        className="list-group-item-action "
                        href="#pablo"
                        onClick={e => e.preventDefault()}
                        tag="a"
                    >
                        <span className="text-success">●</span>
                        Ter outro filho
                    </ListGroupItem>
                </ListGroup>
            </>
        )
    }
    submitFormHandler = async event => {
        event.preventDefault();
        // const tels = this.state.filtrosForm.telefones.value.map(e => {
        //     return {
        //         ddd: parseInt(e.slice(1, 3)),
        //         numero: parseInt(e.slice(4, e.length).replace(/\D/g, ""))
        //     }
        // })

        let tpPessoa = ""

        if (this.state.filtrosForm.tipo_pessoa.value == "Pessoa Física") {
            tpPessoa = "PF"
        } else if (this.state.filtrosForm.tipo_pessoa.value == "Pessoa Jurídica") {
            tpPessoa = "PJ"
        }

        let formData = {}

        for (let formElementId in this.state.filtrosForm) {
            formData[formElementId] = this.state.filtrosForm[formElementId].value;
        }

        if (formData.tipo_pessoa) formData.tipo_pessoa = tpPessoa
        if (formData.cpf_cnpj) formData.cpf_cnpj = parseInt(formData.cpf_cnpj)



        try {
            const response = await api.post(`/common/clientes/${localStorage.empresaId}`, formData);
            this.hideModal("filtrosModal")
            this.setClientes(response.data)
            this.notify('success', response.data.length ? response.data.length + ' resultados encontrados!' : 0 + ' resultados encontrados!');

        } catch (err) {
            this.notify('danger', 'Houve um problema ao carregar as publicações.');
        }

    }

    changeHandler = event => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            filtrosForm: {
                ...this.state.filtrosForm,
                [name]: {
                    ...this.state.filtrosForm[name],
                    value: value,
                    valid: true,
                    message: ""
                },
            }
        });
        console.log(this.state.filtrosForm)


    }
    changeHandlerArr = e => {
        const arr = Array.from(e.target.children)
        let filtrosSelecionados = []
        arr.forEach(el => {
            const v = el.value
            if (el.selected) filtrosSelecionados.push(v)
        });

        const name = "filtros_selecionados";
        this.setState({
            filtrosForm: {
                ...this.state.filtrosForm,
                [name]: {
                    ...this.state.filtrosForm[name],
                    value: filtrosSelecionados,
                    valid: true,
                    message: ""
                },
            }
        });
        console.log(this.state.filtrosForm[name])


    }

    createFildsFiltrosSelecionados = e => {
        if (this.state.filtrosForm) {
            const campos = this.state.filtrosForm.filtros_selecionados.value
            let htmlCampos = []
            if (campos.indexOf("nome") > -1) {
                htmlCampos.push(
                    <>

                        <FormGroup className="mb-3">
                            <label htmlFor="nome">Nome</label>
                            <Input
                                value={this.state.filtrosForm ? this.state.filtrosForm.nome.value : ""}
                                id="nome"
                                onChange={this.changeHandler.bind(this)}
                                name="nome"
                                placeholder="Nome a ser procurado..."
                                type="text" />
                        </FormGroup>
                    </>
                )
            }
            if (campos.indexOf("cpf_cnpj") > -1) {
                htmlCampos.push(
                    <>
                        <FormGroup>
                            <label htmlFor="cpf_cnpj">CPF ou CNPJ</label>
                            <Input
                                value={this.state.filtrosForm ? this.state.filtrosForm.cpf_cnpj.value : ""}
                                onChange={this.changeHandler.bind(this)}
                                name="cpf_cnpj"
                                id="cpf_cnpj" placeholder="CPF ou CNPJ a ser procurado..." type="text" />
                        </FormGroup>
                    </>
                )
            }
            if (campos.indexOf("tipo_pessoa") > -1) {
                htmlCampos.push(
                    <>
                        <FormGroup>
                            <label htmlFor="tipo_pessoa">Tipo de Pessoa</label>
                            <Select2
                                className="form-control"
                                options={{
                                    placeholder: "Selecione um tipo de pessoa..."
                                }}
                                name="tipo_pessoa"
                                value={this.state.filtrosForm ? this.state.filtrosForm.tipo_pessoa.value : ""}
                                data={this.state.tipoPessoa}
                                onSelect={e => { this.changeHandler(e) }}
                                onUnselect={e => { this.changeHandler(e) }}
                            />
                        </FormGroup>
                    </>
                )
            }
            if (campos.indexOf("dt_cadastro") > -1) {
                htmlCampos.push(
                    <>
                        <FormGroup className="text-center">

                            <label htmlFor="dt_cadastro">Data de cadastro</label>
                            <Input
                                value={this.state.filtrosForm ? this.state.filtrosForm.dt_cadastro.value : ""}
                                onChange={this.changeHandler.bind(this)}
                                name="dt_cadastro"
                                id="dt_cadastro" type="date" />
                        </FormGroup>
                    </>
                )
            }
            if (campos.indexOf("intervalo_cadastro") > -1) {

                htmlCampos.push(
                    <><span >
                        <h3 className="text-center">Data cadastro</h3>
                        <FormGroup className="text-center">
                            <Col sm="6" style={{
                                padding: '0',
                                display: 'inline-block',
                            }}>
                                <label htmlFor="dtInicio">Data início</label>
                                <Input
                                    value={this.state.filtrosForm ? this.state.filtrosForm.dt_inicio.value : ""}
                                    onChange={this.changeHandler.bind(this)}
                                    name="dt_inicio"
                                    id="dtInicio" type="date" />
                            </Col>
                            <Col sm="6" style={{
                                padding: '0',
                                display: 'inline-block',
                            }}>
                                <label htmlFor="dtFim">Data fim</label>
                                <Input
                                    value={this.state.filtrosForm ? this.state.filtrosForm.dt_fim.value : ""}
                                    onChange={this.changeHandler.bind(this)}
                                    name="dt_fim"
                                    id="dtFim" type="date" />
                            </Col>

                        </FormGroup>
                    </span>
                    </>
                )
            }
            if (htmlCampos[0]) htmlCampos.push(
                <>
                    <div className="text-center">
                        <Button
                            className=""
                            color="default"
                            type="submit"
                        >
                            Filtrar    <i class="fas fa-search"></i>
                        </Button>
                    </div>
                </>

            )
            return htmlCampos
        }
    }

    render() {

        return (
            <>
                {this.state.alert}
                <div className="rna-wrapper">
                    <NotificationAlert ref="notificationAlert" />
                </div>
                <SimpleHeader name="Cadastro de clientes" parentName="Clientes" {...this.props} />
                <Container className="mt--6" fluid>
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader
                                    style={{
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                    }}>
                                    <h1>Minhas Decisões</h1>
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <Col xs='12' className="text-right">
                                            <span >
                                                <Button
                                                    id="tooltip0983764373524743"
                                                    disabled={localStorage.empresaId == 0 ? true : false}
                                                    color="primary"
                                                    type="button"
                                                    onClick={e => this.onNewClicked(e)}
                                                    size="sm">
                                                    <span className="btn-inner--icon">
                                                        <i className="ni ni-fat-add" />
                                                    </span>
                                                    Inserir nova decisão
                                                </Button>

                                            </span>

                                        </Col>
                                        <Col xs='12'>

                                            {this.createBtnFiltros()}
                                        </Col>

                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </>
        );
    }


}

export default Publicacoes;