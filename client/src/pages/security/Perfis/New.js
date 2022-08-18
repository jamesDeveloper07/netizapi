import React from 'react';
import Form from "./Form"

// core components
import SimpleHeader from '../../../components/Headers/SimpleHeader'

export default ({ ...props }) => {

  return (
    <>
      <SimpleHeader
        name="Novo Perfil"
        parentName="Perfis"
        {...props} />
      <Form
        {...props}
      />
    </>
  )


}
