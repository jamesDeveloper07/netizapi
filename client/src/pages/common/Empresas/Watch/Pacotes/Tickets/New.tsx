import React, { useEffect } from 'react';

import SimpleHeader from '../../../../../../components/Headers/SimpleHeader'
import Form from '../../Pacotes/Tickets/Form'

const New: React.FC = () => {
  return (
    <>
      <SimpleHeader name="Novo Ticket" parentName="Tickets" />
      <Form tipo='New' />
    </>
  )
}

export default New;