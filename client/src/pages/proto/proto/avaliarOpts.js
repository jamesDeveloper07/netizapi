import React from "react";
import NotificationAlert from "react-notification-alert";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app
import SimpleHeader from '../../../components/Headers/SimpleHeader'
import Select2 from "react-select2-wrapper";

// reactstrap components
import {

    CardFooter,
    Button,
    FormGroup,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Form,
} from "reactstrap";

class FormPublicacao extends React.Component {
    state = {
        tagsinput: [],
        optAtual: 0,
        cri0: { valor: '' },
        cri1: { valor: '' },
        cri2: { valor: '' },
        cri3: { valor: '' },
        cri4: { valor: '' },

    };
    handleTagsinput = tagsinput => {
        this.setState({ tagsinput });
        localStorage.tags = this.state.tagsinput
    };

    carregarCriterios = (tags = localStorage.tags.split(',')) => {
        return tags.map((e, i) => {
            const id = "customRadio" + i
            return (
                <>
                    <div className="custom-control custom-checkbox">
                        <input
                            className="custom-control-input"
                            id={id}
                            name="customRadio"
                            type="checkbox"
                        />
                        <label className="custom-control-label" htmlFor={id}>
                            {e}
                        </label>
                    </div>
                </>
            )
        })

    }
    clear() {
        console.log(this.state)
        this.setState({
            cri0: {
                nome: '',
                valor: ''
            },
            cri1: {
                nome: '',
                valor: ''
            },
            cri2: {
                nome: '',
                valor: ''
            },
            cri3: {
                nome: '',
                valor: ''
            },
            cri4: {
                nome: '',
                valor: ''
            },
        })
    }
    changeCriterio(state, e) {
        const name = e.target.name
        const value = e.target.value
        this.setState({
            [state]: {
                nome: name,
                valor: value
            }
        })
        localStorage.avaliacoes = this.state[state]

    }

    componentDidMount() {
        localStorage.results = []
    }

    onNewClicked = async (e) => {
        e.preventDefault();

        this.props.history.push('/admin/proto/contato')
    }
    changeOptAtual() {
        window.scrollTo(0, 0)
        this.setState({
            optAtual: this.state.optAtual + 1
        })
        const results = Array.from(localStorage.results).push(localStorage.avaliacoes)
        localStorage.results = results
        this.clear()

    }
    montarAvaliacao(criterios = localStorage.criteriosImportantes.split(',')) {
        const avaliacoes = ["Péssimo", 'Ruim', 'Razoável', 'Bom', 'Muito bom', 'Perfeito']

        const opcoes = localStorage.criteriosImportantes.split(',')
        return (

            <>
                <Card>
                    <CardHeader
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            border: "1 solid",
                            boxShadow: "0px 2px #f5f5f5"
                        }}
                    >

                        <h3>{localStorage.nome}</h3>

                    </CardHeader>
                    <Form >
                        <CardBody>
                            <Form >
                                <Row>
                                    <Col className="col-12">
                                        <h2>{opcoes[this.state.optAtual].toUpperCase()}</h2>
                                    </Col>
                                    {criterios.map((criterio, i) => {
                                        return (
                                            <>

                                                <Col className="col-12">
                                                    <FormGroup>
                                                        <label htmlFor={1}>{criterio}</label>
                                                        <Select2
                                                            className="form-control"
                                                            options={{
                                                                placeholder: "Avaliar..."
                                                            }}
                                                            value={this.state["cri" + i].valor}
                                                            name={criterio}
                                                            onSelect={e => this.changeCriterio("cri" + i, e)}
                                                            data={avaliacoes}
                                                        />

                                                    </FormGroup>
                                                </Col>
                                            </>
                                        )
                                    })}

                                </Row>
                            </Form>
                        </CardBody>
                        <CardFooter
                            className=""
                            style={{
                                position: "sticky",
                                bottom: 0,
                                border: "2 solid",
                                boxShadow: "0px 0px 2px 2px #f5f5f5"
                            }}
                        >
                            <Row>
                                <Col>
                                    <div className="float-right ">
                                        <Button
                                            className="ml-auto"
                                            color="link"
                                            data-dismiss="modal"
                                            type="button"
                                            onClick={() => this.props.history.goBack()}
                                        >
                                            Voltar
                                         </Button>
                                        {opcoes[this.state.optAtual + 1] ? <Button color="primary" type="button" onClick={e => this.changeOptAtual()}>
                                            Próximo
                                        </Button> : <Button color="primary" type="button" onClick={e => this.onNewClicked(e)}>
                                                Próximo
                                        </Button>}



                                    </div>
                                </Col>
                            </Row>
                        </CardFooter>
                    </Form>
                </Card>

            </>
        )
    }

    render() {
        return (
            <>
                <SimpleHeader name="Cadastro de clientes" parentName="Clientes" {...this.props} />

                <Container className="mt--6" fluid>
                    <Row>
                        <Col>
                            {this.montarAvaliacao()}
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default FormPublicacao;
