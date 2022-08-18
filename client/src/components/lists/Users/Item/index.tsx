import React from 'react';
import { User } from '../../../../entities/Security';

// import { Container } from './styles';
import Avatar from "../../../Avatar";
import {
    Badge,
    Button,
    ListGroupItem,
    ListGroup,
    Progress,
    Row,
    Col,
    UncontrolledTooltip
} from "reactstrap";

type Props = {
    user: User,
    handleDelete(item: User): void,
    loading?: boolean
}

const Item: React.FC<Props> = ({ user, handleDelete, loading }) => {

    return (
        <ListGroupItem className=" py-4 px-4 ">
            <Row className={`align-items-center `}>
                <div className="col-2">
                    <Avatar
                        user={user}
                        className={''}
                    />
                </div>
                <Col
                    className="col-8"
                    
                >
                    <h4
                        className="mb-0"
                    >
                        <a href="#" onClick={e => e.preventDefault()}>
                            {user.name}
                        </a>
                    </h4>
                    <small
                    >
                        {user.email}
                    </small>
                </Col>
                <Col
                    className="col-2 d-flex justify-content-flex-end"

                >
                    <Button
                        className="btn-sm"
                        disabled={loading}
                        color="danger"
                        onClick={() => handleDelete(user)}
                    >
                        <i className="fas fa-trash"></i>
                    </Button>
                </Col>
            </Row>

        </ListGroupItem>
    );
}

export default Item;