import React from 'react';
import { List as ListType } from "../index";
import { User } from "../../../entities/Security";

// import { Container } from './styles';
import Item from "./Item";
import {
    Badge,
    Button,
    ListGroupItem,
    ListGroup,
    Progress,
    Row,
    Col
} from "reactstrap";

type Props = ListType<User> & {
    handleDelete(user: User): void,
    loading?: boolean
}

const Users: React.FC<Props> = ({ itens, handleDelete, loading }) => {

    return (
        <ListGroup className="list" flush>
            {
                itens?.map((user, key) => (
                    <Item
                        user={user}
                        key={key}
                        loading={loading}
                        handleDelete={handleDelete}
                    />
                ))
            }
        </ListGroup>
    );
}

export default Users;