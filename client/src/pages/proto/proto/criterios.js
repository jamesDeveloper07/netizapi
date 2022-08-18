import React from "react";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app
import SimpleHeader from '../../../components/Headers/SimpleHeader'

// reactstrap components
import {

    CardFooter,
    Button,
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
        tagsinput: []
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
                            name={e}
                            value={e}
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

    onNewClicked = async (e) => {
        e.preventDefault();
        const inps = []
        document.querySelectorAll("input").forEach(e => {
            if (e.checked) inps.push(e.value)
        })
        localStorage.setItem('criteriosImportantes', inps)
        this.props.history.push('/admin/proto/comparar')
    }

    render() {
        return (
            <>
                <SimpleHeader name="Cadastro de clientes" parentName="Clientes" {...this.props} />

                <Container className="mt--6" fluid>
                    <Row>
                        <Col>
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
                                    <h4>Selecione os cinco criterios mais importantes</h4>

                                        <Row>
                                            <Col lg="6" sm="12" md="12">
                                                <Form >
                                                    {this.carregarCriterios()}
                                                </Form>
                                            </Col>
                                        </Row>
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
                                                    <Button color="primary" type="button" onClick={e => this.onNewClicked(e)}>
                                                        Salvar
                                                    </Button>
                                                    <Button
                                                        className="ml-auto"
                                                        color="link"
                                                        data-dismiss="modal"
                                                        type="button"
                                                        onClick={() => this.props.history.goBack()}
                                                    >
                                                        Voltar
                                 </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardFooter>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default FormPublicacao;
