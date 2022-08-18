import React, { useEffect } from 'react';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, { PaginationProvider, } from "react-bootstrap-table2-paginator";
import overlayFactory from 'react-bootstrap-table2-overlay';

export default ({ data,
    pageProperties,
    notify,
    columns,
    rowEvents,
    ...props }) => {

    const NoDataIndication = () => (
        <div className="spinner">
            <div className="rect1" />
            <div className="rect2" />
            <div className="rect3" />
            <div className="rect4" />
            <div className="rect5" />
        </div>
    );

    const RemotePagination = ({ loading, data, page, sizePerPage, onTableChange, totalSize, showSizePerPage = true}) => (
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
                                    Exibindo {to == 0 ? 0 : from} a {to} do total de {totalSize}.
                                </span>
                            )
                        },
                        sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => {
                            if(!showSizePerPage) return null 

                            return (

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
                        }
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
                                noDataIndication="Nenhum item encontrado"
                                onTableChange={onTableChange}
                                rowEvents={rowEvents}                                
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
                data && pageProperties &&
                <RemotePagination
                    data={data}
                    page={pageProperties.page}
                    sizePerPage={pageProperties.perPage}
                    totalSize={parseInt(pageProperties.total)}
                    onTableChange={props.onTableChange}
                    loading={pageProperties.loading}
                    showSizePerPage={pageProperties.showSizePerPage}
                />
            }
        </>
    );
}
