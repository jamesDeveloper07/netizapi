import React from 'react';

// import { Container } from './styles';

export default () => {
    return (
        <>
            <div
                style={{
                    minHeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <div>
                    <p
                        style={{
                            color: '#ccc'
                        }}
                        class="fa-10x"
                    >
                        404
                    </p>
                </div>
                <p>
                    <h1 className="text-muted">Ops, parece que não foi possível encontrar a página que você está solicitando</h1>
                </p>

            </div>
        </>
    );
}
