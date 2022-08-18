import React from "react";
// plugin that creates slider
import Slider from "nouislider";
// reactstrap components
import {
    FormGroup, Form, Input, Row, Col, Card,
    CardBody,
    CardHeader,
    CardFooter,
    Container,
    Button,
    Badge,
} from "reactstrap";
import SimpleHeader from '../../../components/Headers/SimpleHeader'

class Range extends React.Component {
    state = {
        slider1Value: "",
        slider2Values: ["200.00", "400.00"],
        indice: 0,
        indiceIn: 1,
        index: 0,
        criterios: localStorage.criteriosImportantes.split(',')
    };
    componentDidMount() {
        var slider2 = this.refs.slider2;
        Slider.create(slider2, {
            start: [50],
            step: 1,
            range: { min: 0, max: 100 }
        }).on(
            "update",
            function (values, handle) {
                let v0 = values[0]
                this.setState({
                    slider2Values: [100 - v0, v0 * 1]
                });
            }.bind(this)
        );
    }
    comparar() {
        if (this.state.index != 8) {
            if (this.state.indiceIn == this.state.criterios.length - 1) {
                this.setState({
                    indice: this.state.indice + 1,
                    indiceIn: this.state.indice + 2
                })

            } else {
                this.setState({
                    indiceIn: this.state.indiceIn + 1
                })
            }
            this.setState({
                index: this.state.index + 1
            })
            var slider2 = this.refs.slider2;

            slider2.noUiSlider.set(50);
        }

    }
    onNewClicked(e) {
        e.preventDefault();
        this.props.history.push('/admin/proto/opcoes')
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
                                    Comparação binária

                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <Row>
                                            <Col>
                                                <FormGroup>

                                                    <div className="mt-5">
                                                        <div className="text-center"><h5>Arraste</h5></div>
                                                        <div ref="slider2" />
                                                        <Row>
                                                            <Col xs="6">
                                                                <span className="range-slider-value value-low">
                                                                    {this.state.slider2Values[0]}
                                                                </span>
                                                            </Col>
                                                            <Col className="text-right" xs="6">
                                                                <span className="range-slider-value value-high">
                                                                    {this.state.slider2Values[1]}
                                                                </span>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row className="text-center " >
                                            <Col className="col-5 p-0">
                                                <Button color="primary" type="button" style={{ textAlign: "center", width: "100%" }}>
                                                    <div>{this.state.criterios[this.state.indice]}</div> <br />
                                                    <Badge color="primary" className="badge-lg" style={{ fontSize: "1rem" }}>
                                                        {this.state.slider2Values[0]}
                                                    </Badge>
                                                </Button>
                                            </Col>
                                            <Col className="col-2 p-0 " style={{ textAlign: "center", alignSelf: "center" }}>X</Col>
                                            <Col className="col-5 p-0 ">
                                                <Button color="primary" type="button" style={{ textAlign: "center", width: "100%" }}>
                                                    <div>{this.state.criterios[this.state.indiceIn]}</div> <br />
                                                    <Badge color="primary" className="badge-lg" style={{ fontSize: "1rem" }}>
                                                        {this.state.slider2Values[1]}
                                                    </Badge>
                                                </Button>
                                            </Col>
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
                                                {this.state.index != 8 ? <Button color="primary" type="button"
                                                    onClick={e => this.comparar(e)}
                                                >
                                                    Comparar
                                                    </Button> : <Button color="primary" type="button"
                                                        onClick={e => this.onNewClicked(e)}
                                                    >
                                                        Próximo
                                                    </Button>}


                                            </div>
                                        </Col>
                                    </Row>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        );
    }
}

export default Range;