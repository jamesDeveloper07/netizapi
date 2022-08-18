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
                <img
                    style={{
                        width: '30%',
                    }}
                    alt='Netiz'
                    src={require("../assets/img/brand/full_logo_ligth.svg")} />

            </div>
        </>
    );
}
