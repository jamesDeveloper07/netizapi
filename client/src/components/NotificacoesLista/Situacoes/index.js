import React, { useState, useEffect } from 'react';

import classnames from "classnames";
import {
    Button,
    ButtonGroup,
    Row,
    UncontrolledPopover,
    PopoverBody,
    Col,
    Modal,
} from "reactstrap";

function Situacoes({ value, onChange }) {

    const [situacoes] = useState([
        { id: '', text: 'Todas' },
        { id: 'lidas', text: 'Lidas' },
        { id: 'nao_lidas', text: 'Não Lidas' }
    ])


    return (
        <>
            <ButtonGroup className="btn-group-toggle" size='sm' data-toggle="buttons" style={{marginLeft: '15px'}}>
                {
                    situacoes.map((item, key) => (
                        <Button
                            className={classnames({ active: value == item.id })}
                            color="secondary"
                            onClick={() => onChange(item.id)}>
                            <input
                                autoComplete="off"
                                name="options"
                                type="radio"
                                value={value == item.id}
                            />
                            {item.text}
                        </Button>
                    ))
                }
            </ButtonGroup>
        </>
    )
}

export default Situacoes;