import React from 'react';
import { SiteEmpresa } from '../../../../../entities/Common';
import { Anuncio } from '../../../../../entities/Marketing'

// import { Container } from './styles';

import Item from './Item'
import {
    ListGroup,
} from "reactstrap";

type Props = {
    sites: Array<SiteEmpresa>,
    afiliacoes: Array<Anuncio>
}

const List: React.FC<Props> = ({ sites, afiliacoes }) => {
    return (
        <ListGroup className="list" flush>
            {
                sites.map((site, key) => (
                    <Item
                        afiliacoes={afiliacoes}
                        site={site}
                        key={key}
                    />
                ))
            }
        </ListGroup>
    );

}

export default List;