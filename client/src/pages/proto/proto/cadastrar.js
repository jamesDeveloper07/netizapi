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
    Input,


} from "reactstrap";

class FormPublicacao extends React.Component {
    state = {
        tagsinput: []
    };
    handleTagsinput = tagsinput => {
        this.setState({ tagsinput });
        localStorage.tags = this.state.tagsinput
    };

    onNewClicked = async (e) => {
        e.preventDefault();
        this.props.history.push('/admin/proto/criterios')
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
                                    <Row>
                                        <Col lg="8" sm="12" md="8">
                                            <Input
                                                className="form-control-flush"
                                                placeholder="O que decidir..."
                                                type="text"
                                                name="titulo"
                                                onChange={e => { localStorage.nome = e.target.value }}
                                                style={{
                                                    fontSize: 22,
                                                    color: "black"
                                                }}
                                            />

                                        </Col>

                                    </Row>

                                </CardHeader>
                                <Form >
                                    <CardBody>
                                        <Row>
                                            <Col lg="6" sm="12" md="12">
                                                <FormGroup>
                                                    <label>Critérios:</label>
                                                    <TagsInput
                                                        className="bootstrap-tagsinput"
                                                        onChange={this.handleTagsinput}
                                                        tagProps={{ className: "tag badge mr-1" }}
                                                        value={this.state.tagsinput}
                                                        inputProps={{
                                                            className: "",
                                                            placeholder: ""
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
