import React from 'react';

import SimpleHeader from '../../../../components/Headers/SimpleHeader'
import Form from './Form'

const New: React.FC = () => {

  return (
    <>
      <SimpleHeader name="Alterar Solicitação" parentName="Solicitações" />
      <Form />
    </>
  )
}

export default New;