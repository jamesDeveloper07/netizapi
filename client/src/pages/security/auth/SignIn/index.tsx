import React, { useContext, useState, useRef } from "react";
import AuthContext from '../../../../contexts/Auth'
import { useHistory } from "react-router-dom";
//Api
import api from "../../../../services/api";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Spinner
} from "reactstrap";

// core components
import AuthHeader from "../../../../components/Headers/AuthHeader.jsx";

const SignIn: React.FC = ({ }) => {

  let history = useHistory();

  const { signin } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordType, setPasswordType] = useState('password')

  const notificationRef = useRef<NotificationAlert>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (!email || !password) {
      setError("Preencha todos os campos para continuar")
    } else {
      try {
        // const response = await api.post("/sessions", { email, password });
        await signin(email, password)
        // login(response.data)
        history.push("/admin/");
      } catch (err) {
        console.log(err);
        notify('danger', 'Houve um problema com o login, verifique suas credenciais.');
      }
    }
    setLoading(false)
  }

  function handleChangePasswordType() {
    setPasswordType(passwordType === 'text' ? 'password' : 'text')
  }

  function handleForgotPassword() {
    history.push("/auth/forgot-password");
  }

  const notify = (type: string, msg: string) => {
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
    notificationRef?.current?.notificationAlert(options);
  };

  return (
    <>
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationRef} />
      </div>
      <AuthHeader
        title="Bem Vindo"
      />
      <Container
      >
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="bg-secondary border-0 mb-0">
              <CardBody className="px-lg-5 py-lg-5">
                <Form role="form" onSubmit={handleLogin}>
                  <FormGroup
                    className='mb-3'
                  >
                    <InputGroup className="input-group-merge input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-email-83" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Email"
                        type="email"
                        onChange={({ target }) => setEmail(target.value)}
                      />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup
                  >
                    <InputGroup className="input-group-merge input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-lock-circle-open" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Senha"
                        type={passwordType === 'password' ? 'password' : 'text'}
                        onChange={({ target }) => setPassword(target.value)}
                      />
                      <InputGroupAddon addonType="append">
                        <InputGroupText>
                          <Button
                            color='link'
                            size='xs'
                            className='m-0 p-0'
                            onClick={handleChangePasswordType}
                          >
                            {passwordType === 'password' ? 'mostrar' : 'esconder'}
                          </Button>
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                  <div className="text-center">
                    <Button
                      disabled={loading}
                      className="my-4"
                      color="primary"
                      type="submit">
                      {
                        loading &&
                        <Spinner className='mr-2' size='sm' />
                      }
                      Entrar
                      </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
            <Row className="mt-3">
              <Col xs="6">
                <a
                  className="text-light"
                  href="#"
                  onClick={handleForgotPassword}
                >
                  <small>Esqueceu a senha?</small>
                </a>
              </Col>

            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignIn;
