import React, { useState } from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, { PaginationProvider, } from "react-bootstrap-table2-paginator";
import overlayFactory from 'react-bootstrap-table2-overlay';
import { MenuComportamento } from '../../../components/Menus'


export default ({ empresas, pageProperties, notify, ...props }) => {

    const [columns, setColumns] = useState([
        {
            dataField: 'acoes',
            formatter: (cell, row) => acoesFormatter(cell, row, this)
        },
        {
            dataField: 'nome',
            text: 'Nome',
            sort: true,
        },
        {
            dataField: "cnpj",
            text: 'CNPJ',
        },
    ])

    const acoesFormatter = (cell, row, context) => {
        return (
            <MenuComportamento
                actions={[{
                    label: 'Alterar',
                    icons: 'far fa-edit',
                    onClick: () => goToEdit(row.id)
                }]}
            />
        )
    }

    const NoDataIndication = () => (
        <div className="spinner">
            <div className="rect1" />
            <div className="rect2" />
            <div className="rect3" />
            <div className="rect4" />
            <div className="rect5" />
        </div>
    );

    function goToEdit(id) {
        props.history.push(`/admin/empresas/${new Number(id)}/edit`)
    }

    const RemotePagination = ({ loading, data, page, sizePerPage, onTableChange, totalSize }) => (
        <div>
            <PaginationProvider
                pagination={
                    paginationFactory({
                        page,
                        sizePerPage,
                        totalSize,
                        alwaysShowAllBtns: true,
                        showTotal: true,
                        withFirstAndLast: true,
                        paginationTotalRenderer: (from, to, size) => {
                            const margin = {
                                paddingLeft: '4px'
                            }
                            return (
                                <span className="react-bootstrap-table-pagination-total" style={margin}>
                                    Exibindo {from} a {to} do total de {totalSize}.
                                </span>
                            )
                        },
                        sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
                            <div className="dataTables_length" id="datatable-basic_length">
                                <label>
                                    Exibir{" "}
                                    {
                                        <select
                                            name="datatable-basic_length"
                                            value={currSizePerPage}
                                            aria-controls="datatable-basic"
                                            className="form-control form-control-sm"
                                            onChange={e => onSizePerPageChange(e.target.value)}
                                        >
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                    }{" "}
                                    itens.
                          </label>
                            </div>
                        )
                    })
                }
            >
                {
                    ({
                        paginationProps,
                        paginationTableProps
                    }) => (
                            <div className="py-4 table-responsive">
                                <BootstrapTable
                                    remote
                                    loading={loading}
                                    keyField="id"
                                    noDataIndication={() => <NoDataIndication />}
                                    bootstrap4={true}
                                    bordered={false}
                                    data={data}
                                    columns={columns}
                                    noDataIndication="Nenhuma empresa encontrada"
                                    onTableChange={onTableChange}
                                    overlay={overlayFactory({
                                        spinner: true,
                                        styles: { overlay: (base) => ({ ...base, background: 'rgba(150, 150, 150, 0.5)' }) }
                                    })}
                                    {...paginationTableProps}
                                />
                            </div>
                        )
                }
            </PaginationProvider>
        </div>
    );

    return (
        <>
            {
                empresas && pageProperties &&
                <RemotePagination
                    data={empresas}
                    page={pageProperties.page}
                    sizePerPage={pageProperties.perPage}
                    totalSize={pageProperties.total}
                    onTableChange={props.onTableChange}
                    loading={pageProperties.loading}
                />
            }
        </>
    );
}
