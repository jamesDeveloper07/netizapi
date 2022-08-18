import React, { useState, useContext } from 'react';
import AuthContext from '../../../contexts/Auth';
import { useHistory } from "react-router-dom";

import { Badge, UncontrolledTooltip } from "reactstrap";
import Table from '../../../components/Table'
import { MenuComportamento } from '../../../components/Menus'
import { Notificacao } from '../../../entities/Security';
import NotificacaoModal from '../../../components/NotificacoesLista/NotificacaoModal'
import api from '../../../services/api';
import moment from 'moment'

// import { Container } from './styles';
interface Props {
  notificacoes: Array<Notificacao>,
  pageProperties: any,
  onTableChange(type: string, sortProperties: { page: number, sizePerPage: number, sortField: string, sortOrder: string }): Promise<void>,
  notify(type: string, msg: string): void,
  loading: boolean,
  reload(): Promise<void>,
}

const TableNotificacoes: React.FC<Props> = ({ notificacoes, pageProperties, onTableChange, notify, loading, reload, ...props }) => {
  const history = useHistory()

  const [notificacao, setNotificacao] = useState<Notificacao>()
  const [showNotificacaoModal, setShowNotificacaoModal] = useState(false)
  const { hasPermission, hasRole } = useContext(AuthContext)

  const [columns] = useState([
    {
      dataField: 'acoes',
      formatter: (cell: any, row: any) => acoesFormatter(cell, row)
    },
    {
      dataField: "titulo",
      text: 'Título',
      formatter: (cell: any, row: any) => tituloFormatter(cell, row)
    },
    {
      dataField: "sended_at",
      text: 'Enviada em',
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: "readed_at",
      text: 'Lida em',
      formatter: (cell: any, row: any) => dataFormatter(cell, row)
    },
    {
      dataField: "modulo_nome",
      text: 'Módulo',
      formatter: (cell: any, row: any) => moduloFormatter(cell, row)
    }

  ])

  function goToEdit(notificacao: Notificacao) {
    // history.push(`/admin/politicas-privacidade/${id}/edit`)
    setNotificacao(notificacao)
    setShowNotificacaoModal(true)
  }

  const tituloFormatter = (cell: any, row: any) => {
    return (
      <>
        <span id={`notificacao-${row.id}`}>
          <div style={{ width: '30px', display: 'inline-block', textAlign: 'center', color: !row.readed_at ? 'red' : '' }}>
            <i className={row.icon_font}></i>
          </div>
          {row.titulo}
        </span>
        <UncontrolledTooltip
          target={`notificacao-${row.id}`}
          placement='top'
        >
          {row.mensagem}
        </UncontrolledTooltip>
      </>
    )
  }

  const moduloFormatter = (cell: any, row: any) => {
    return (
      <>
        <span id={`modulo-${row.id}`}>
          {row.modulo_nome}
        </span>
        <UncontrolledTooltip
          target={`modulo-${row.id}`}
          placement='top'
        >
          {row.submodulo_nome}
        </UncontrolledTooltip>
      </>
    )
  }

  const dataFormatter = (cell: any, row: any) => {
    let data = ''
    if (cell) {
      data = moment(cell).format('D MMM YYYY HH:mm')
    }
    return (
      <>
        {data}
      </>
    )
  }

  const acoesFormatter = (cell: any, row: any) => {
    return (
      <MenuComportamento
        actions={[{
          label: 'COnferir',
          icon: 'far fa-edit',
          onClick: () => goToEdit(row)
        }]}
      />
    )
  }

  function handleOnConferir() {
    setShowNotificacaoModal(false);
    //@ts-ignore
    handleSelectNotificacao(notificacao);
    marcarComoLida();
  }

  function handleSelectNotificacao(notificacao: Notificacao) {
    var acao_clique_url = notificacao.acao_clique_url;

    if (acao_clique_url?.includes('http://localhost:3000')) {
      console.log('LocalHost');
      acao_clique_url = acao_clique_url.replace('http://localhost:3000', '');
    } else {
      if (acao_clique_url?.includes('http://netiz.com.br') || acao_clique_url?.includes('https://netiz.com.br')
        || acao_clique_url?.includes('http://app.netiz.com.br') || acao_clique_url?.includes('https://app.netiz.com.br')
        || acao_clique_url?.includes('http://app.netiz.com') || acao_clique_url?.includes('https://app.netiz.com')
        || acao_clique_url?.includes('http://hml.netiz.com.br') || acao_clique_url?.includes('https://hml.netiz.com.br')) {
        console.log('Ambiente Servidor');
        acao_clique_url = acao_clique_url.replace('http://netiz.com.br', '');
        acao_clique_url = acao_clique_url.replace('https://netiz.com.br', '');
        acao_clique_url = acao_clique_url.replace('http://app.netiz.com.br', '');
        acao_clique_url = acao_clique_url.replace('https://app.netiz.com.br', '');
        acao_clique_url = acao_clique_url.replace('http://app.netiz.com', '');
        acao_clique_url = acao_clique_url.replace('https://app.netiz.com', '');
        acao_clique_url = acao_clique_url.replace('http://hml.netiz.com.br', '');
        acao_clique_url = acao_clique_url.replace('https://hml.netiz.com.br', '');
      }
    }

    //console.log(acao_clique_url);

    if (acao_clique_url?.includes('http://') || acao_clique_url?.includes('https://')) {
      //console.log('Link Externo');
      window.open(acao_clique_url, '_blank');
    } else {
      if (acao_clique_url) {
        //console.log('Link Local');

        if (!acao_clique_url?.includes('/oportunidades/') && acao_clique_url?.includes('/oportunidades')) {
          //console.log('Validação Restrição');
          if (hasRole('comercial_restritivo')) {
            //console.log('Área Restrita');
            acao_clique_url = acao_clique_url.replace('/oportunidades', '/oportunidades-readonly')
          }
        }

        //console.log('Acessando Link');
        history.push(acao_clique_url)
      } else {
        console.log('KD O LINK???');
      }
    }

  }

  function handleOnMarcarLida() {
    marcarComoLida();
  }

  async function marcarComoLida() {
    try {
      const response = await api.put(`/security/notificacoes/marcarComoLida/${notificacao?.id}`);
      //setNotificacoes(response.data);
      //getNotificacoes();
      //onTableChange
      setShowNotificacaoModal(false);
      reload();
    } catch (error) {
    }
  }


  return (
    <>
      <NotificacaoModal
        notificacao={notificacao}
        show={showNotificacaoModal}
        onHidden={() => {
          setShowNotificacaoModal(false)
        }}

        onConferir={handleOnConferir}
        onMarcarComoLida={handleOnMarcarLida}
      />
      <Table
        columns={columns}
        data={notificacoes}
        pageProperties={pageProperties}
        onTableChange={onTableChange}
        notify={notify}
        rowEvents={undefined} />
    </>
  );
}

export default TableNotificacoes;