import React, { Component } from 'react'

import {
    Container,
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    Button
} from "reactstrap";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true
        }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ hasError: true })
    }

    render() {
        if (this.state.hasError) {
            // Você pode renderizar qualquer UI alternativa
            return <Container >
                <Row className="justify-content-center">
                    <Col lg="5" md="7">
                        <Card className='border-0 mb-0 mt-7'>
                            <CardBody>
                                <CardTitle>
                                    <h1>
                                    😮 Ops...
                                    </h1>
                                    <p>
                                        Isso é vergonhoso, mas nós detectamos um problema.<br />
                                    </p>
                                </CardTitle>
                                <Button
                                color='primary'
                                onClick={() => document.location.reload(true)}
                                >
                                    Voltar
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

            </Container>

        }

        return this.props.children;
    }
}
export default ErrorBoundary