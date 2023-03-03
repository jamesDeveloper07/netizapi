import React from 'react';

import SimpleHeader from '../../../../../components/Headers/SimpleHeader'
import Form from './Form'

const Edit: React.FC = () => {

  return (
    <>
      <SimpleHeader name="Alterar Solicitação" parentName="Solicitações" />
      <Form tipo='Edit'/>
    </>
  )
}

export default Edit;