import React from 'react';

import SimpleHeader from '../../../../components/Headers/SimpleHeader'
import Form from './Form'

const New: React.FC = () => {

  return (
    <>
      <SimpleHeader name="Alterar Termos de Uso" parentName="Termos de Uso" />
      <Form />
    </>
  )
}

export default New;