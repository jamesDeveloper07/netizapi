import React from 'react';
import { Empresa, SiteEmpresa } from '../../../../../entities/Common';
import Item from './Item'

import {
    Button,
    ListGroupItem,
    ListGroup,
    Row,
} from "reactstrap";

// import { Container } from './styles';

// Propriedades do meu componente
type Props = {
    // Lista de sites
    sites: Array<SiteEmpresa>,
    empresa: Empresa,
    // Método para passar notificações para o usuário
    notify(type: string, msg: string): void,
    reLoad(): void
}
// Adicionando as propriedades criadas acima
const List: React.FC<Props> = ({
    sites,
    empresa,
    notify,
    reLoad
}) => {




    return (
        <ListGroup
            className="mt-4"
        >
            {
                //"map" percorre cada item da lista de sites
                sites.map((item, index) => (
                    <Item
                        empresa={empresa}
                        site={item}
                        notify={notify}
                        onDeleted={reLoad}
                    />
                ))
            }
        </ListGroup>
    );
}

export default List;