import React from "react";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app
import SimpleHeader from '../../../components/Headers/SimpleHeader'
import TagsInput from "react-tagsinput";

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
        tagsinput: []
    };
    handleTagsinput = tagsinput => {
        this.setState({ tagsinput });
        localStorage.opcoes = this.state.tagsinput
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
    onNewClicked = async (e) => {
        e.preventDefault();
        this.props.history.push('/admin/proto/avaliarOpts')
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
                                    Quais opções você tem para tomar sua decisão?

                                </CardHeader>
                                <Form >
                                    <CardBody>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <TagsInput

                                                        className="bootstrap-tagsinput"
                                                        onChange={this.handleTagsinput}
                                                        tagProps={{ className: "tag badge mr-1" }}
                                                        value={this.state.tagsinput}
                                                        inputProps={{
                                                            className: "secondary",
                                                            placeholder: "Opções...",
                                                            textTransform: "uppercase",
                                                            style: {
                                                            
                                                            }
                                                        }}
                                                    />

                                                </FormGroup>
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
                                                    <Button color="primary" type="button"
                                                        onClick={e => this.onNewClicked(e)}
                                                    >
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
