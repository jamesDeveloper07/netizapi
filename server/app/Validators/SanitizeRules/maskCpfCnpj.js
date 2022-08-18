const { sanitizor } = use('Validator');

const only = /^[\d\.\-\/]+$/; // digit, dot or dash only

sanitizor.maskCpfCnpj = (value) => {
  if (!value) {
    return undefined;
  }


  if (only.test(value)) { //is cpf or cnpj
    value = value.replace(/[^\d]/g, ""); // only digit

    if (value.length === 11) { // cpf
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      value = value;

    } else { // cnpj
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      value = value;
    }
  }

  return value;
}