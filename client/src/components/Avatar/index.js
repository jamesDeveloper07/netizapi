import React, { useState } from 'react';
import { setUser } from '../../utils';

export default ({ user = {}, className, ...props }) => {
    const [error, setError] = useState(false)

    function returnUserName() {
        let nome = user.name ? user.name : (user.nome ? user.nome : null);

        if (nome) {
            let nomes = nome.trim().split(' ')
            if (nomes.length > 2) nomes = nomes.slice(0, 2)
            return <strong>
                {nomes.map(item => item[0].toUpperCase()).reduce((total, atual) => total + atual)}
            </strong>
        } else {
            return <></>
        }
    }


    function Preview() {
        if (error) return returnUserName()
        if (user && user.avatar) {
            //comentado para realizar um teste de fluxo de imagens no AWS
            // return (
            //     <img
            //         style={{ height:'100%', objectFit:'cover', objectPosition:'center' }}                     
            //         alt='avatar'
            //         src={`${user.avatar_url}`}
            //         onError={() => setError(true)}
            //     />
            // )
            if (user && (user.name || user.nome)) {
                return returnUserName()
            }

        } else {
            if (user && (user.name || user.nome)) {
                return returnUserName()
            }
        }
        return <></>
    }

    return (
        <a
            className={` avatar rounded-circle ${className}`}
            style={{
                color: '#fff',
                ...props.style
            }}
            href="#"
            onClick={e => e.preventDefault()}
            {...props}
        >
            <Preview />
            {
                props.children
            }
        </a>
    );
}
