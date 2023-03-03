import React, { useState, useEffect } from 'react';

import {
    Collapse,
    Button,
    CardBody,
    Row,
} from "reactstrap";

export default ({
    title,
    displayMode = () => { },
    presets = () => { },
    onSearch,
    isLoading,    
    children,
    clearFilters,
    isOpen,
    monitorLoadPreset = false,
    onFiltersClead = () => { },
    onCollapsed = () => { },
    visibleButtonInfo = false,
    disableButtonSearch = false,
    viewInfo = () => { },

    ...props }) => {

    const [collapsed, setCollapsed] = useState(isOpen)

    useEffect(() => {
        onCollapsed(collapsed)
    }, [collapsed])

    useEffect(() => {
        if (monitorLoadPreset) {
            setCollapsed(false)
        }
    }, [monitorLoadPreset])

    async function handleClearFilter() {
        if (clearFilters) await clearFilters()
        setCollapsed(false)
        onFiltersClead(new Date())
    }

    function handleInfo() {
        console.log('HANDLE INFO Filter Pai')
        viewInfo()
    }

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div>
                        {
                            title
                        }
                    </div>
                    <div>
                        {
                            displayMode()
                        }
                    </div>

                </div>
                <div>
                    <div>
                        {
                            presets()
                        }
                        {visibleButtonInfo &&
                            <Button
                                color="secondary"
                                outline
                                size="sm"
                                style={{
                                    height: '32px',
                                }}
                                onClick={handleInfo}
                            >
                                <span className="btn-inner--icon">
                                    <i className="fas fa-info-circle" />
                                </span>
                                <span className="btn-inner--text"> Info</span>
                            </Button>
                        }

                        <Button
                            color="secondary"
                            outline
                            size="sm"
                            style={{
                                height: '32px'
                            }}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <span className="btn-inner--icon">
                                <i className="fa fa-filter" />
                            </span>
                            <span className="btn-inner--text"> Filtros</span>
                        </Button>
                        <Button
                            color="secondary"
                            outline
                            size="sm"
                            style={{
                                height: '32px',
                            }}
                            onClick={handleClearFilter}
                        >
                            <span className="btn-inner--icon">
                                <i className="fa fa-trash" />
                            </span>
                            <span className="btn-inner--text"> Limpar Filtros</span>
                        </Button>
                    </div>
                </div>
            </div>
            <Collapse isOpen={collapsed}>
                <CardBody>
                    {children}
                    <Row>
                        <Button
                            color="secondary"
                            style={{
                                marginBottom: '8px'
                            }}
                            disabled={isLoading || disableButtonSearch}
                            onClick={() => {
                                onSearch()
                                setCollapsed(false)
                            }}
                            outline
                            size="sm"
                            href="#">
                            <span className="btn-inner--icon">
                                <i className="fa fa-search" />
                            </span>
                            <span className="btn-inner--text"> Pesquisar</span>
                        </Button>
                        <Button
                            color="secondary"
                            style={{
                                marginBottom: '8px'
                            }}
                            onClick={() => handleClearFilter()}
                            outline
                            size="sm"
                            href="#">
                            <span className="btn-inner--icon">
                                <i className="far fa-trash-alt" />
                            </span>
                            <span className="btn-inner--text"> Limpar</span>
                        </Button>
                    </Row>
                </CardBody>
            </Collapse>
        </>
    );
}
