import React from 'react';

// import { Container } from './styles';

import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";

import { Direction } from "reactstrap/lib/Dropdown";

interface IAction {
    label: string,
    icon?: string,
    onClick(): void
}

interface IComportamento {
    icon?: string,
    direction?: Direction,
    actions: Array<IAction>
}

const Comportamento: React.FC<IComportamento> = ({
    icon = 'fas fa-ellipsis-v',
    direction,
    actions
}) => {

    function handleDropdownClick(event: React.MouseEvent) {
        event.preventDefault()
        if (actions.length === 1) actions[0].onClick()
    }

    return (
        <UncontrolledDropdown
            direction={direction}
        >
            <DropdownToggle
                className="btn-icon-only text-primary"
                href="#"
                role="link"
                size="sm"
                color=""
                onClick={handleDropdownClick}
            >
                <i className={icon} />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
                {
                    actions.map((action, key) => (
                        <DropdownItem
                            key={key}
                            href="#"
                            onClick={e => { e.preventDefault(); action.onClick() }}
                        >
                            <i className={action.icon}></i>
                            {action.label}
                        </DropdownItem>
                    ))
                }
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default Comportamento;