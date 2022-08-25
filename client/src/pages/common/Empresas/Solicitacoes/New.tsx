import React, { useEffect } from 'react';

import SimpleHeader from '../../../../components/Headers/SimpleHeader'
import Form from './Form'

const New: React.FC = () => {
  return (
    <>
      <SimpleHeader name="Nova Solicitação" parentName="Solicitações" />
      <Form />
    </>
  )
}

export default New;