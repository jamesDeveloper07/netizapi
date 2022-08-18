import React from "react";
import NotificationAlert from "react-notification-alert";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app
import api from "../../../services/api";
import ReactQuill from "react-quill";
import AttachMarcacao from "../marcacoes/Attach";
import ReactBSAlert from "react-bootstrap-sweetalert";
import classnames from "classnames";
// reactstrap components
import {
    CardFooter,
    Button,
    FormGroup,
    UncontrolledTooltip,
    Badge,
    Card,
    CardBody,
    CardHeader,
    Container,
    Row,
    Col,
    Form,

    DropdownItem,
    Modal,
    CardTitle,
    CardText,

} from "reactstrap";

class FormPublicacao extends React.Component {
    state = {
        formatos: [],
        trafegos: [],
        pilares: [],
        veiculacoes: [],
        situacoes: [],
        linkInput: { value: "" },
        formControls: {
            id: {
                value: null
            },
            veiculacoes_id: {
                value: [],
                valid: true,
                message: ""
            },
            titulo: {
                value: "",
                valid: true,
                message: ""
            },
            created_at: {
                value: new Date(),
                valid: true,
                message: ""
            },
            corpo_texto: {
                value: "",
                valid: true,
                message: ""
            },
            fase_atual_id: {
                value: "",
                valid: true,
                message: ""
            },
            texto_imagem: {
                value: "",
                valid: true,
                message: ""
            },
            data_postagem: {
                value: new Date(),
                valid: true,
                message: ""
            },
            imagens: {
                value: "",
                valid: true,
                message: ""
            },
            formato_id: {
                value: "",
                valid: true,
                message: ""
            },
            trafego_id: {
                value: "",
                valid: true,
                message: ""
            },
            valor: {
                value: "",
                valid: true,
                message: "",
                disabled: true
            },
            sugestao: {
                value: "",
                valid: true,
                message: ""
            },
            marcacoes: {
                value: "",
                valid: true,
                message: ""
            },
            situacao: {
                value: "A",
                valid: true,
                message: ""
            },
            pilar_id: {
                value: "",
                valid: true,
                message: ""
            },
            imagens: {
                value: []
            }
        },
        ponderacaoModal: false,
        novasPonderacaoModal: false,
        ponderacao: {
            value: "",
            valid: true,
            message: "",
        },
        ponderacoes: [],
    };

    hideAlert = () => {
        console.log(this.state)
        this.setState({
            ...this.state,
            alert: null
        });
        console.log(this.state)

    };

    setDefaultState(publicacao) {
        const fields = [
            "created_at",
            "titulo",
            "pilar_id",
            "formato_id",
            "formato_id",
            "trafego_id",
            "sugestao",
            "valor",
            "link",
            "corpo_texto",
            "texto_imagem",
            "marcacoes",
            "data_postagem",
            "situacao",
            "fase_atual_id"
        ];
        for (let f in fields) {
            this.setState({
                ...this.state,
                formControls: {
                    ...this.state.formControls,
                    [f]: {
                        value: publicacao ? publicacao[f] : "",
                        valid: true,
                        message: ""
                    }
                }
            });
        }
    }

    formartDate(dt) {
        var options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dt).toLocaleDateString("pt-br", options);
    }

    //Carrega dados defaults para uma nova publicacao
    loadToNewPublicacao() {
        this.loadFaseAtual();
    }

    async loadFaseAtual() {
        try {
            const response = await api.get("/common/fluxos/vigente");
            const fluxo = response.data;
            this.setFaseInicial(fluxo.faseInicial);
        } catch (err) {
            console.error(err);
            this.notify(
                "danger",
                "Não foi possível carregar a fase inicial da publicação."
            );
        }
    }

    async loadVeiculacoes() {
        try {
            const json = localStorage.getItem('@netiz-empresa')
            const empresaSelecionada = JSON.parse(json)
            const response = await api.get("/marketing/veiculacoes/" + empresaSelecionada?.id)
            let veiculacoes = response.data;
            this.setState({
                ...this.state,
                veiculacoes
            });
        } catch (err) {
            this.notify("danger", "Não foi possível carregar as veiculacoes.");
        }
    }


    async loadSituacoes() {
        try {
            const response = await api.get("/marketing/situacoes/publicacoes");
            let situacoes = response.data;
            this.setState({
                ...this.state,
                situacoes
            });
        } catch (err) {
            this.notify("danger", "Não foi possível carregar situações.");
        }
    }

    async loadPilares() {
        try {
            const response = await api.get("/marketing/pilares");
            let pilares = [];
            response.data.forEach(item => {
                pilares.push({ id: item.id, text: item.nome });
            });
            this.setState({
                ...this.state,
                pilares
            });
        } catch (err) {
            this.notify("danger", "Não foi possível carregar os pilares.");
        }
    }

    async loadFormatos() {
        try {
            const response = await api.get("/marketing/formatos");
            let formatos = [];
            response.data.forEach(item => {
                formatos.push({ id: item.id, text: item.nome });
            });
            this.setState({
                ...this.state,
                formatos
            });
        } catch (err) {
            console.error(err);
            this.notify("danger", "Não foi possível carregar formatos.");
        }
    }

    async loadTrafegos() {
        try {
            const response = await api.get("/marketing/trafegos");
            let trafegos = [];
            response.data.forEach(item => {
                trafegos.push({ id: item.id, text: item.nome });
            });
            this.setState({
                ...this.state,
                trafegos
            });
        } catch (err) {
            console.error(err);
            this.notify("danger", "Não foi possível carregar trafegos.");
        }
    }

    setFaseInicial(faseInicial) {
        this.setState({
            ...this.state,
            formControls: {
                ...this.state.formControls,
                fase_atual_id: {
                    value: faseInicial.id,
                    valid: true,
                    message: faseInicial.nome
                }
            }
        });
    }

    notify = (type, title, msg) => {
        let options = {
            place: "tc",
            message: (
                <div className="alert-text">
                    <span className="alert-title" data-notify="title">
                        {title}
                    </span>
                    <span data-notify="message">{msg}</span>
                </div>
            ),
            type: type,
            icon: "ni ni-bell-55",
            autoDismiss: 7
        };
        this.refs.notificationAlert.notificationAlert(options);
    };

    componentWillMount() {

    }

    isNew() {
        const current_page = this.props.location.pathname;
        return current_page.includes("new");
    }

    componentDidMount() {
        this.setPublicacao(this.props.publicacao);
        this.hideModal("ponderacaoModal");


    }
    componentDidUpdate() {
        this.createBtnFaseAntecessora()
        this.createBtnFaseAtual()
        this.createBtnFaseSucessora()
        this.createBtnPonderar()


    }

    nomeformatoSelecionado = () => {
        const { value } = this.state.formControls.formato_id
        for (let formato of this.state.formatos) {
            if (formato.id == value) {
                return formato.text.toLowerCase()
            }
        }
        return 'corpo'
    }

    setPublicacao(publicacao) {
        this.setDefaultState(publicacao);
    }

    getPublicacaoId() {
        const {
            match: { params }
        } = this.props;
        const { id } = params;
        return id;
    }
    getFaseAtualId() {
        const {
            match: { params }
        } = this.props;
        const { fase_atual_id } = params;
        return fase_atual_id;
    }

    async loadPublicacao() {
        try {
            const id = this.getPublicacaoId();
            const response = await api.get(`marketing/publicacoes/${id}`);
            const publicacao = response.data;
            const formControls = {};
            //Percorre os fields da publicacao...
            for (let field in publicacao) {
                let value = publicacao[field];
                //Adiciona o valor ao formControls...
                formControls[field] = {
                    value,
                    valid: true,
                    message: ""
                };
            }
            this.setState({ ...this.state, formControls });
        } catch (err) {
            console.error(err);
            this.notify("danger", "Não foi possível carregar publicacao.");
        }
    }

    handleTrafegoSelected(event) {
        const target = event.target;
        this.setState({
            ...this.state,
            formControls: {
                ...this.state.formControls,
                valor: {
                    ...this.state.formControls.valor,
                    disabled: target.value != 1
                },
                trafego_id: {
                    ...this.state.formControls.trafego_id,
                    value: target.value
                }
            }
        });
        this.changeHandler(event);
    }

    changeQuillHandler = (value, name) => {
        this.fireFakeEvent(value, name);
    };

    fireFakeEvent(value, name) {
        const eventFake = { target: { name: name, value: value } };
        this.changeHandler(eventFake);
    }

    changeHandler = event => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            formControls: {
                ...this.state.formControls,
                [name]: {
                    ...this.state.formControls[name],
                    value: value,
                    valid: true,
                    message: ""
                }
            }
        });
        console.log(this.state.formControls[name].value)
    };

    handleDateChange(value, name) {
        this.fireFakeEvent(value, name);
    }
    handlePonderacao(texto) {
        this.state.ponderacao = {
            value: texto
        }
    }



    submitPonderacaoHandler = async event => {
        const dados = {
            publicacao_id: this.state.formControls.id.value,
            texto: this.state.ponderacao.value,
            tipo: "ponderação",
            id_fase: 3,
            situacao: "P",
        }
        try {
            const response = await api.post(`/common/ponderar`, dados);
            this.successAlert("Ponderações enviadas");
        } catch (error) {
            this.notify("danger", "Não foi possível enviar essa ponderação.");
        }
    }

    submitComentarioHandler = async props => {
        const dados = {
            publicacao_id: this.state.formControls.id.value,
            texto: this.state.ponderacao.value,
            tipo: "atividade",
        }
        try {
            let response = await api.post(`/common/comentarios`, dados);
            this.loadPonderacoes()


        } catch (error) {
            this.notify("danger", "Não foi possível enviar essa ponderação.");
        }
    }

    removerSituacaoAtivo() {
        const situTipo = this.state.formControls.situacao.value;
        const idFase = this.state.formControls.faseAtual.value.id
        let situacoes = this.state.situacoes

        if (situTipo == "P") {
            situacoes = situacoes.filter(e => {
                if (!(e.id == "A")) return e
            })
        } else if (situTipo != "P") {
            situacoes = situacoes.filter(e => {
                if (!(e.id == "P")) return e
            })
        }
        this.setState({
            ...this.state,
            situacoes
        });
    }

    submitFormHandler = async event => {
        event.preventDefault();
        const formData = {};
        //Constroi o body do request...
        for (let formElementId in this.state.formControls) {
            formData[formElementId] = this.state.formControls[formElementId].value;
        }
        formData.empresaId = localStorage.empresaId

        try {
            let response;
            if (this.isNew()) {
                //Se for uma nova publicação...

                response = await api.post("/marketing/publicacoes/" + localStorage.empresaId, formData);
                this.beforeUploadImagens(response.data);
            } else {
                //Se for para alterar...
                const id = this.state.formControls.id.value;
                response = await api.put(`/marketing/publicacoes/${id}`, formData);
                this.successAlert("Publicação salva");
            }
        } catch (err) {
            this.notify("danger", "Não foi possível salvar publicação.");

            const messages = err.response.data;
            for (let msg in messages) {
                let obj = messages[msg];

                this.setState({
                    formControls: {
                        ...this.state.formControls,
                        [obj.field]: {
                            value: this.state.formControls[obj.field] ? this.state.formControls[obj.field] : "",
                            valid: false,
                            message: obj.message
                        }
                    }
                });
            }
        }
    };

    beforeUploadImagens({ id }) {
        //Seta o novo id no state
        this.setState({
            ...this.state,
            formControls: {
                ...this.state.formControls,
                id: {
                    value: id
                }
            }
        });
    }

    uploadWhenNew(dropzone) {
        const id = this.state.formControls.id.value;
        //Controi a nova url para upload
        const postUrl = `${api.defaults.baseURL}/marketing/publicacoes/${id}/imagens`;
        dropzone.options["url"] = postUrl;

        if (dropzone.files.length == 0) {
            this.successAlert('Publicação salva')
            return
        }
        dropzone.processQueue();
    }

    redirectBack = () => {
        this.props.history.push("/marketing/publicacoes");
    };

    handleVeiculacoes(event) {
        let veiculacoesId = this.state.formControls.veiculacoes_id.value;
        let { id } = event.target;
        id = parseInt(id.replace(/[^0-9]/g, ""));
        const exists = this.hasVeiculo(id);
        if (exists) {
            veiculacoesId = veiculacoesId.filter(item => {
                return item != id;
            });
        } else {
            veiculacoesId.push(id);
        }
        this.setState({
            ...this.state,
            formControls: {
                ...this.state.formControls,
                veiculacoes_id: {
                    ...this.state.formControls.veiculacoes_id,
                    value: veiculacoesId
                }
            }
        });
    }

    hasVeiculo(id) {
        if (!this.state.formControls.veiculacoes_id) return false;
        const veiculacoes = this.state.formControls.veiculacoes_id.value;
        const exists = veiculacoes.includes(id);
        return exists;
    }

    createVeiculacoes = () => {
        let veiculacoesIn = [];
        for (let veiculo of this.state.veiculacoes) {
            const hasVeiculo = this.hasVeiculo(veiculo.id);
            let i = 0;
            if (veiculo.is_story) {
                veiculacoesIn.push(
                    <>
                        <Button
                            className={classnames({
                                active: hasVeiculo,
                                "btn-icon-only rounded-circle btn btn-dribbble": true
                            })}
                            style={{
                                border: "2px solid #dd38fb",
                            }}
                            color="secondary"
                            tag="label"
                            id={`btn_veiculo_${veiculo.id}`}
                        >
                            <input
                                id={`veiculo_${veiculo.id}`}
                                autoComplete="off"
                                type="checkbox"
                                value={hasVeiculo}
                                onClick={e => this.handleVeiculacoes(e)}
                            />
                            <span
                                className="btn-inner--icon"
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    "justify-content": "center",
                                    flex: 1,
                                    "align-items": "center",
                                    "border-radius": "50%",
                                    border: "2px solid rgba(245, 191, 255, 0.45)"
                                }}
                            >
                                <i id={`veiculoIcon_${veiculo.id}`} class={veiculo.icone} />
                            </span>
                        </Button>
                        <UncontrolledTooltip
                            delay={0}
                            placement="top"
                            target={`btn_veiculo_${veiculo.id}`}
                        >
                            {veiculo.nome}
                        </UncontrolledTooltip>
                    </>
                );
            } else {
                veiculacoesIn.push(
                    <>
                        <Button
                            className={classnames({
                                active: hasVeiculo,
                                "btn-icon-only rounded-circle btn btn-dribbble": true
                            })}
                            color="secondary"
                            tag="label"
                            id={`btn_veiculo_${veiculo.id}`}
                            style={{
                                border: "1px solid"
                            }}
                        >
                            <input
                                id={`veiculo_${veiculo.id}`}
                                autoComplete="off"
                                type="checkbox"
                                value={hasVeiculo}
                                onClick={e => this.handleVeiculacoes(e)}
                            />
                            <span
                                className="btn-inner--icon"
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    "justify-content": "center",
                                    flex: 1,
                                    "align-items": "center",
                                }}
                            >
                                <i id={`veiculoIcon_${veiculo.id}`} class={veiculo.icone} />
                            </span>
                        </Button>
                        <UncontrolledTooltip
                            delay={0}
                            placement="top"
                            target={`btn_veiculo_${veiculo.id}`}
                        >
                            {veiculo.nome}
                        </UncontrolledTooltip>
                    </>
                );
            }
        }
        return veiculacoesIn;
    };


    createBtnFaseAtual = () => {
        const faseAtualNome = this.state.formControls.faseAtual ? this.state.formControls.faseAtual.value.nome : ""
        let btn = null;

        if (!this.isNew()) {
            btn =
                <>
                    <Button
                        style={{
                            "pointer-events": "none"
                        }}
                        id={`fase_atual_${
                            this.state.formControls.fase_atual_id.value
                            }`}
                        variant="primary"
                        size="sm"
                        active
                    >{
                            faseAtualNome
                        }
                    </Button>
                </>
        } else {

            btn =
                <>
                    <Button
                        style={{
                            "pointer-events": "none"
                        }}
                        id={`fase_atual_${
                            this.state.formControls.fase_atual_id.value
                            }`}
                        variant="primary"
                        size="sm"
                        active
                    >{
                            this.state.formControls.fase_atual_id.message
                        }
                    </Button>
                </>
        }

        return btn
    }

    createBtnFaseAntecessora = () => {
        const faseAntecessora = this.state.formControls.faseAntecessora ? this.state.formControls.faseAntecessora.value : ""
        const esta = this.changeFase.bind(this)
        if (faseAntecessora && faseAntecessora.id != undefined) {
            const btn =
                <>
                    <Button
                        variant="outline-secondary"
                        size="lg"
                        id={`fase_ancessora_${
                            faseAntecessora.id
                            }`}
                        onClick={e =>
                            this.confirmAlertUpdateFase("Atualizar fase",
                                "Deseja realmente voltar para a fase de " + faseAntecessora.nome + "?",
                                () => { esta('voltar-fase') },
                                "Sim",
                                "primary"
                            )
                        }
                    ><i class="fas fa-caret-left mr-2"></i>{faseAntecessora.nome}</Button>
                </>
            return btn

        }


    }
    createBtnFaseSucessora = () => {
        const faseSucessora = this.state.formControls.faseSucessora ? this.state.formControls.faseSucessora.value : ""
        const esta = this.changeFase.bind(this)

        if (faseSucessora && faseSucessora.id != undefined) {
            const btn =
                <>
                    <Button
                        variant="outline-secondary"
                        size="lg"
                        id={`fase_sucessora_${
                            faseSucessora.id
                            }`}
                        onClick={e =>
                            this.confirmAlertUpdateFase("Atualizar fase",
                                "Deseja realmente avancar para a fase de " + faseSucessora.nome + "?",
                                () => { esta('avancar-fase') },
                                "Sim",
                                "primary"
                            )
                        }
                    >{faseSucessora.nome}<i class="fas fa-caret-right ml-2"></i></Button>
                </>
            return btn
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



    createBtnPonderar() {
        const faseAtualId = this.state.formControls.faseAtual ? this.state.formControls.faseAtual.value.id : ""
        const submitPond = this.submitPonderacaoHandler.bind(this)

        if (faseAtualId == 4) {
            const modal =
                <>
                    <Row>
                        <Col md="4">
                            <div className="float-left ">
                                <Button
                                    block
                                    color="warning"
                                    type="button"
                                    onClick={() => this.showModal("ponderacaoModal")}>
                                    Ponderar
          </Button>
                            </div>

                            <Modal
                                className="modal-dialog-centered"
                                size="sm"
                                isOpen={this.state.ponderacaoModal}
                                toggle={() => this.hideModal("ponderacaoModal")}
                            >
                                <div className="modal-body p-0">
                                    <Card className="bg-secondary shadow border-0">
                                        <CardHeader className="bg-transparent p-2">
                                            <div className="text-muted text-center mt-1 mb-1">
                                                <large><b>Adicione suas ponderações</b></large>
                                            </div>

                                        </CardHeader>
                                        <CardBody className="">

                                            <Form role="form">
                                                <FormGroup>
                                                    <ReactQuill
                                                        theme="snow"
                                                        modules={{
                                                            toolbar: [
                                                                ["bold", "italic"],
                                                                ["link", "blockquote"],
                                                                [
                                                                    {
                                                                        list: "ordered"
                                                                    },
                                                                    {
                                                                        list: "bullet"
                                                                    }
                                                                ]
                                                            ]
                                                        }}
                                                        // value={this.state.ponderacaoModal.value}
                                                        onChange={e => this.handlePonderacao(e)}

                                                    />
                                                    <small className="text-muted   my-2">
                                                        A fase será alterada retornando para a de <b>crição</b><br></br>
                                                        Essa ponderação será apresentado no corpo da publicação...
                          </small>
                                                    <br />
                                                    <small class="text-danger">
                                                        {this.state.formControls.corpo_texto.message}
                                                    </small>
                                                </FormGroup>

                                                <div className="text-center">
                                                    <Button
                                                        className="my-2"
                                                        color="primary"
                                                        type="button"
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            this.confirmAlertUpdateFase("Confirmar ponderação",
                                                                "Ao confirmar a publicação retornará para a fase de CRIAÇÂO?",
                                                                () => { submitPond() },
                                                                "Sim",
                                                                "primary"
                                                            )
                                                        }}
                                                    >
                                                        Salvar ponderações
                      </Button>
                                                </div>
                                            </Form>
                                        </CardBody>
                                    </Card>
                                </div>
                            </Modal>
                        </Col>
                    </Row >
                </>
            return modal
        }
    }

    async loadPonderacoes() {
        try {
            const response = await api.get(`common/ponderar/${this.getPublicacaoId()}`);
            const ponderacoes = response.data
            this.setState({
                ...this.state,
                ponderacoes: {
                    ...this.state.ponderacoes,
                    value: ponderacoes
                }
            })
        } catch (err) {
            this.notify("danger", "Não foi possível carregar as ponderações.");
        }
    }

    montarComentariosForm() {
        const faseAtualId = this.state.formControls.faseAtual ? this.state.formControls.faseAtual.value.id : ""
        const submitPond = this.submitPonderacaoHandler.bind(this)
        const form =
            <>
                <Card className="bg-secondary shadow border-0">
                    <CardHeader className="bg-transparent ">
                        <div className="text-muted text-center ">
                            <large><b>Comentários</b></large>
                        </div>
                    </CardHeader>
                </Card>
                <Form role="form" className="shadow" onSubmit={e => { e.preventDefault() }}>
                    <FormGroup>
                        <ReactQuill
                            theme="snow"
                            modules={{
                                toolbar: [
                                    ["bold", "italic"],
                                    ["link", "blockquote"],
                                    [
                                        {
                                            list: "ordered"
                                        },
                                        {
                                            list: "bullet"
                                        }
                                    ]
                                ]
                            }}
                            // value={this.state.ponderacaoModal.value}
                            onChange={e => this.handlePonderacao(e)}
                        />
                        <small class="text-danger">
                            teste
            </small>
                    </FormGroup>

                    <div className="text-center">
                        <Button
                            className=""
                            color="primary"
                            type="button"

                            onClick={e => {
                                this.submitComentarioHandler(e)
                            }}
                        >
                            Enviar</Button>
                    </div>
                </Form>
                <hr></hr>
            </>
        return form
    }

    montarComentariosCard() {

        if (this.state.ponderacoes.value != undefined) {
            let ponderacoes = [];
            for (let ponderacao of this.state.ponderacoes.value) {
                let txt = ponderacao.texto
                let rand = Math.floor(Math.random() * 100)
                let id = `popover666` + rand
                const tipoComent = {
                    color: "",
                    valor: ""
                }

                let tipo;

                if (ponderacao.tipo == "ponderação") {
                    tipoComent.color = "warning"
                    tipoComent.valor = "P"
                    tipo = "Ponderação"

                } else if (ponderacao.tipo == "atividade") {
                    tipoComent.color = "primary"
                    tipoComent.valor = "A"
                    tipo = "Atividade"

                }
                const dica =
                    <>
                        <UncontrolledTooltip
                            delay={0}
                            placement="top"
                            target={id}
                        >
                            {tipo}
                        </UncontrolledTooltip>
                    </>
                ponderacoes.push(<>

                    <Card className="shadow">
                        <CardBody>
                            <CardTitle >{ponderacao.name}
                                <Badge id={id} style={{ float: "right", cursor: 'context-menu' }} color={tipoComent.color} className="badge-md badge-circle badge-floating border-white">{tipoComent.valor}
                                </Badge>
                                {dica}
                                <small
                                    style={{ float: "right" }}
                                    className="text-muted"
                                    size="sm">
                                    {ponderacao.created_at}

                                </small>

                            </CardTitle>

                            <CardText dangerouslySetInnerHTML={{ __html: txt }} />
                        </CardBody>

                    </Card>
                </>)
            }
            return ponderacoes
        }

    }

    createBtnNNewPonderacoes() {
        if (!this.isNew()) {

            const btn =
                <>
                    <Button color="default" size="sm"
                        onClick={(e) => this.showModal("novasPonderacaoModal")}>
                        <span>Comentários</span>
                        <Badge color="primary">{this.state.ponderacoes.value != undefined ? this.state.ponderacoes.value.length : 0}</Badge>
                    </Button>
                    <Modal
                        className="modal-dialog-centered"
                        size="sm"
                        isOpen={this.state.novasPonderacaoModal}
                        toggle={() => this.hideModal("novasPonderacaoModal")}
                    >
                        <div className="modal-body p-0">
                            {this.montarComentariosForm()}
                            {this.montarComentariosCard()}
                        </div>
                    </Modal>
                </>

            return btn;
        }
    }

    async changeSituacao(toSituacao) {
        try {
            await api.put(`/marketing/situacoes/publicacoes/${this.getPublicacaoId()}/${toSituacao.id}`);
            this.setState({
                ...this.state,
                formControls: {
                    ...this.state.formControls,
                    situacao: {
                        ...this.state.formControls.situacao,
                        value: toSituacao.id
                    }
                }
            })

            this.setState({
                alert: (
                    <ReactBSAlert
                        success
                        style={{ display: "block", marginTop: "-100px" }}
                        title={toSituacao.label}
                        onConfirm={() => this.hideAlert()}
                        onCancel={() => this.hideAlert()}
                        confirmBtnBsStyle="primary"
                        confirmBtnText="Ok"
                        btnSize=""
                    >
                    </ReactBSAlert>
                )
            });
        } catch (err) {
            this.hideAlert()
            this.notify('danger', 'Não foi possível alterar situação')
        }
    }

    async changeFase(acao) {
        try {
            ///:publicacao_id/avancar-fase
            const response = await api.put(`common/fases/${this.getPublicacaoId()}/${acao}`);
            const publicacao = response.data

            this.setState({
                ...this.state,
                formControls: {
                    ...this.state.formControls,
                    fase_atual_id: {
                        ...this.state.formControls.fase_atual_id,
                        value: publicacao.fase_atual_id
                    },
                    faseAntecessora: {
                        ...this.state.formControls.faseAntecessora,
                        value: publicacao.faseAntecessora
                    },
                    faseSucessora: {
                        ...this.state.formControls.faseSucessora,
                        value: publicacao.faseSucessora
                    },
                    faseAtual: {
                        ...this.state.formControls.faseAtual,
                        value: publicacao.faseAtual
                    },
                    situacao: {
                        ...this.state.formControls.situacao,
                        value: publicacao.situacao
                    }


                }
            })
            this.loadSituacoes();


            this.setState({
                alert: (
                    <ReactBSAlert
                        success
                        style={{ display: "block", marginTop: "-100px" }}
                        title="A fase da publicação foi alterada!"
                        onConfirm={() => this.hideAlert()}
                        onCancel={() => this.hideAlert()}
                        confirmBtnBsStyle="primary"
                        confirmBtnText="Ok"
                        btnSize=""
                    >
                    </ReactBSAlert>
                )
            });
            this.hideModal("ponderacaoModal")
        } catch (err) {
            this.hideAlert()
            this.notify('danger', 'Não foi possível alterar situação')
        }
    }

    createChangeSituacaoParameters(situacao) {
        const changeSituacao = this.changeSituacao.bind(this)
        let situ = situacao.id;
        switch (situ) {
            case 'A':
                situ = 'primary'
                break;
            case 'S':
                situ = 'warning'
                break;
            case 'C':
                situ = 'danger'
                break;

        }
        return {
            title: situacao.value,
            msg: `Deseja realmente ${situacao.value} essa publicação?`,
            confirmFunction: () => changeSituacao(situacao),
            confirmButtonLabel: 'Sim',

            confirmButtonColor: situ
        }
    }


    createListSituacoes = () => {
        let situacoesDropdown = [];
        for (let situacao of this.state.situacoes) {
            if (situacao.id == this.state.formControls.situacao.value) {
                continue;
            }
            const changeSituacaoParameters = this.createChangeSituacaoParameters(situacao);
            situacoesDropdown.push(
                <>
                    <DropdownItem
                        href="#"
                        onClick={e =>
                            this.confirmAlert(
                                changeSituacaoParameters.title,
                                changeSituacaoParameters.msg,
                                changeSituacaoParameters.confirmFunction,
                                changeSituacaoParameters.confirmButtonLabel,
                                changeSituacaoParameters.confirmButtonColor
                            )
                        }
                    >
                        {situacao.value}
                    </DropdownItem>
                </>
            );
        }
        return situacoesDropdown;
    };



    buttonSiuacaoColor = () => {
        const situacao = this.state.formControls.situacao.value;
        for (let s of this.state.situacoes) {
            if (s.id == situacao) {
                return s.color;
            }
        }

        return "";
    };

    labelSituacao = () => {
        const situacao = this.state.formControls.situacao.value;
        for (let s of this.state.situacoes) {
            if (s.id == situacao) {
                return s.label;
            }
        }

        return "";
    };

    successAlert = msg => {
        this.setState({
            alert: (
                <ReactBSAlert
                    success
                    style={{ display: "block", marginTop: "-100px", maxWidth: "500px" }}
                    title={msg}
                    onConfirm={() => this.redirectBack()}
                    confirmBtnBsStyle="success"
                    showConfirm={false}
                    btnSize=""
                />
            )
        });
        setTimeout(this.redirectBack, 2000);
    };

    confirmAlert = (
        title,
        msg,
        confirmFunction,
        confirmButtonLabel = "Sim",
        confirmButtonColor = "primary"
    ) => {
        this.setState({
            alert: (
                <ReactBSAlert
                    warning
                    closeOnClickOutside={false}
                    style={{ display: "block", marginTop: "-100px" }}
                    title={title}
                    onConfirm={() => this.hideAlert()}
                    onCancel={confirmFunction}
                    showCancel
                    confirmBtnBsStyle="secondary"
                    confirmBtnText="Cancelar"
                    cancelBtnBsStyle={confirmButtonColor}
                    cancelBtnText={confirmButtonLabel}
                    btnSize=""
                >
                    {msg}
                </ReactBSAlert>
            )
        });
    };
    confirmAlertUpdateFase = (
        title,
        msg,
        confirmFunction,
        confirmButtonLabel = "Ok",
        confirmButtonColor = "primary"
    ) => {
        this.setState({
            alert: (
                <ReactBSAlert
                    warning
                    closeOnClickOutside={false}
                    style={{ display: "block", marginTop: "-100px" }}
                    title={title}
                    onConfirm={() => this.hideAlert()}
                    onCancel={confirmFunction}
                    showCancel
                    confirmBtnBsStyle="secondary"
                    confirmBtnText="Cancelar"
                    cancelBtnBsStyle={confirmButtonColor}
                    cancelBtnText={confirmButtonLabel}
                    btnSize=""
                >
                    {msg}
                </ReactBSAlert>
            )
        });
    };

    render() {
        const successWhenNew = this.successAlert.bind(this);
        return (
            <>
                {this.state.alert}
                <div className="rna-wrapper">
                    <NotificationAlert ref="notificationAlert" />
                </div>
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


                                </CardHeader>
                                <Form onSubmit={this.submitFormHandler}>
                                    <CardBody>

                                        <Row>
                                            <Col lg="6" sm="12" md="12">
                                                <FormGroup>
                                                    <label>Marcações:</label>
                                                    <AttachMarcacao
                                                        onChange={this.changeHandler}
                                                        marcacoes={
                                                            this.state.formControls.marcacoes.value
                                                        }
                                                    />
                                                    <small class="text-danger">
                                                        {this.state.formControls.marcacoes.message}
                                                    </small>
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
                                                    <Button color="primary" type="submit">
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
