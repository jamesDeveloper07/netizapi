import React from 'react';

import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

export default ({ pageProperties = {
    total: "0",
    perPage: 10,
    page: 1,
    lastPage: 1,
}, load }) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <label size="sm">{`Página ${pageProperties.page} de ${pageProperties.lastPage < 1 ? 1 : pageProperties.lastPage}`}</label>
            <nav aria-label="Page navigation example">
                <Pagination
                    className="pagination justify-content-center"
                    listClassName="justify-content-center"
                >
                    <PaginationItem className={pageProperties.page == 1 ? "disabled" : ''} >
                        <PaginationLink
                            onClick={e => load({
                                ...pageProperties,
                                page: 1
                            })}
                            tabIndex="-1"
                        >
                            <i className="fa fa-angle-double-left" />
                            <span className="sr-only">First Page</span>
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className={pageProperties.page == 1 ? "disabled" : ''} >
                        <PaginationLink
                            onClick={e => load({
                                ...pageProperties,
                                page: pageProperties.page - 1
                            })}
                            tabIndex="-1"
                        >
                            <i className="fa fa-angle-left" />
                            <span className="sr-only">Previous</span>
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem
                        className={(pageProperties.lastPage == pageProperties.page) || pageProperties.lastPage == 0 ? "disabled" : ''}
                    >
                        <PaginationLink
                            onClick={e => load({
                                ...pageProperties,
                                page: pageProperties.page + 1
                            })}
                        >
                            <i className="fa fa-angle-right" />
                            <span className="sr-only">Next</span>
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem
                        className={(pageProperties.lastPage == pageProperties.page) || pageProperties.lastPage == 0 ? "disabled" : ''}
                    >
                        <PaginationLink
                            onClick={e => load({
                                ...pageProperties,
                                page: pageProperties.lastPage
                            })}
                        >
                            <i className="fa fa-angle-double-right" />
                            <span className="sr-only">Last Page</span>
                        </PaginationLink>
                    </PaginationItem>
                </Pagination>
            </nav>
        </div>
    );
}
