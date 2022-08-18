import React, { useRef } from 'react';
import SiteEmpresa from '../../../../../../entities/Common/SiteEmpresa'
import Anuncio from '../../../../../../entities/Marketing/Anuncio'


// import { Container } from './styles';
//@ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";
//@ts-ignore
import NotificationAlert from "react-notification-alert";
import {
    Badge,
    Button,
    ListGroupItem,
    ListGroup,
    Progress,
    Row,
    Col,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    UncontrolledTooltip
} from "reactstrap";

type Props = {
    site: SiteEmpresa,
    afiliacoes: Array<Anuncio>
}

const Item: React.FC<Props> = ({ site, afiliacoes }) => {

    const notificationRef = useRef<NotificationAlert>(null)

    function notify(type: string, msg: string) {
        let options = {
            place: 'tc',
            message: (
                <div className="alert-text m-auto">
                    {msg}
                </div>
            ),
            type,
            closeButton: false,
            icon: undefined,
            autoDismiss: 7
        };
        notificationRef.current.notificationAlert(options);
    }

    return (
        <>
            <div className="rna-wrapper">
                <NotificationAlert
                    ref={notificationRef}
                />
            </div>
            <ListGroupItem className="px-0">
                <Row className="align-items-center">
                    <Col className="col-auto">
                    </Col>
                    <div className="col ml--2">
                        <h4 className="mb-0">
                            <a href="#pablo" onClick={e => e.preventDefault()}>
                                {site.nome}
                            </a>
                        </h4>
                        <small>{site.path}</small>
                    </div>
                    <Col className="col-auto">
                        <UncontrolledDropdown group>
                            <DropdownToggle
                                caret
                                id={"tolltipidcopy" + site.id}
                                color="primary"
                                size="sm"
                            >
                                Copiar Link
                        </DropdownToggle>

                            <DropdownMenu>
                                {
                                    afiliacoes.map((item) => (
                                        <CopyToClipboard
                                            text={`${site.path}?anuncio_id=${item.id}`}
                                            onCopy={() => notify('success', 'Copiado')}
                                        >
                                            <DropdownItem
                                                href="#"
                                            >
                                                {item.campanha?.nome}
                                            </DropdownItem>
                                        </CopyToClipboard>
                                    ))
                                }
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                </Row>
            </ListGroupItem>
        </>
    );
}

export default Item;