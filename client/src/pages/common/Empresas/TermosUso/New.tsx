import React, { useEffect } from 'react';

import SimpleHeader from '../../../../components/Headers/SimpleHeader'
import Form from './Form'

const New: React.FC = () => {
  return (
    <>
      <SimpleHeader name="Novos Termos de Uso" parentName="Termos de Uso" />
      <Form />
    </>
  )
}

export default New;