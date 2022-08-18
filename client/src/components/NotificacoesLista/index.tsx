import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Button } from 'reactstrap';
import AuthContext from '../../contexts/Auth';
import { Notificacao } from '../../entities/Security';
import api from '../../services/api';
import Situacoes from './Situacoes';
import NotificacaoModal from './NotificacaoModal'

// import { Container } from './styles';

const NotificacoesLista: React.FC = () => {

  const history = useHistory();
  const { hasPermission, hasRole } = useContext(AuthContext)
  const authData = useContext(AuthContext)
  const [color, setColor] = useState('')
  const [totalNotificacoesNaoLidas, setTotalNotificacoesNaoLidas] = useState(0)
  const [notificacoes, setNotificacoes] = useState<Array<Notificacao>>([])
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState<Array<Notificacao>>([])
  const [situacao, setSituacao] = useState('nao_lidas')
  const [showNotificacaoModal, setShowNotificacaoModal] = useState(false)
  const [notificacao, setNotificacao] = useState<Notificacao>()

  const [isOpenDropDown, setIsOpenDropDown] = useState(false)

  const toggleDropDown = () => {
    setIsOpenDropDown(!isOpenDropDown);
  }

  useEffect(() => {
    getNotificacoes();
  }, [])

  useEffect(() => {
    getNotificacoes();
  }, [situacao])

  useEffect(() => {
  }, [notificacoesNaoLidas])

  useEffect(() => {
    setNotificacoesNaoLidas([]);
    var naoLidas = []
    for (var index in notificacoes) {
      if (!notificacoes[index].readed_at) {
        naoLidas.push(notificacoes[index])
      }
    }
    setNotificacoesNaoLidas(naoLidas);
  }, [notificacoes])

  function handleOnConferir() {
    setShowNotificacaoModal(false);
    //@ts-ignore
    handleSelectNotificacao(notificacao);
    marcarComoLida();
  }

  function handleOnMarcarLida() {
    marcarComoLida();
  }

  function goToNotificacoes() {
    setIsOpenDropDown(false)
    history.push(`/admin/notificacoes`)
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

  async function getNotificacoes() {
    try {
      var paramSituacao = situacao ? `?situacao=${situacao}` : ''
      var url = '/security/notificacoes/getByUsuarioLogado' + paramSituacao
      const response = await api.get(url);
      setNotificacoes(response.data.notificacoes);
      setTotalNotificacoesNaoLidas(response.data.totalNaoLidas)
    } catch (error) {
    }
  }

  async function marcarComoLida() {
    try {
      const response = await api.put(`/security/notificacoes/marcarComoLida/${notificacao?.id}`);
      //setNotificacoes(response.data);
      getNotificacoes();
      setShowNotificacaoModal(false);
    } catch (error) {
    }
  }

  return <>
    <NotificacaoModal
      notificacao={notificacao}
      show={showNotificacaoModal}
      onHidden={() => {
        setShowNotificacaoModal(false)
      }}

      onConferir={handleOnConferir}
      onMarcarComoLida={handleOnMarcarLida}
    />

    <UncontrolledDropdown inNavbar isOpen={isOpenDropDown} toggle={toggleDropDown}>
      <DropdownToggle nav caret color="secondary" style={{
        background: 'transparent',
        border: 'transparent',
        color: 'white',
        boxShadow: '0 0',
        padding: 0
      }}>
        <i className="fas fa-bell">
          <span style={{
            display: totalNotificacoesNaoLidas &&  totalNotificacoesNaoLidas > 0 ? 'block' : 'none',
            background: 'rgb(255 0 0 / 90%)',
            width: '25px',
            height: '25px',
            margin: '0',
            borderRadius: '50%',
            position: 'absolute',
            top: '-15px',
            right: '21px',
            paddingTop: '8px',
            fontFamily: 'Open Sans, sans-serif',
            fontSize: '11px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>{totalNotificacoesNaoLidas}</span>
        </i>

      </DropdownToggle>

      <DropdownMenu right style={{
        background: '#ffffff'
      }}>

        <div
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: -10
          }}
        >
          <DropdownItem header>
            {(!notificacoes || notificacoes.length == 0) ? 'Nenhuma notificação até o momento' :
              `Você tem ${notificacoes.length > 1 ? `${notificacoes.length} Notificações` : '1 Notificação'}`
            }
            <Situacoes
              value={situacao}
              onChange={setSituacao}
            />
          </DropdownItem>
        </div>

        <DropdownItem divider />

        {
          notificacoes.map((notificacao, key) => {
            if (key < 10) {
              return (
                <DropdownItem
                  key={notificacao.id}
                  onClick={
                    () => {
                      //handleSelectNotificacao(notificacao);
                      setNotificacao(notificacao)
                      setShowNotificacaoModal(true);
                    }
                  }
                  style={
                    {
                      color: "black",
                      textAlign: "left",
                    }
                  }

                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#8080800f'
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}

                  value={notificacao.id}>
                  <div style={{ width: '30px', display: 'inline-block', textAlign: 'center', color: !notificacao.readed_at ? 'red' : '' }}>
                    <i className={notificacao.icon_font}></i>
                  </div>
                  {notificacao.titulo}
                </DropdownItem>
              )
            }
          }
          )
        }

        {notificacoes && notificacoes.length > 10 &&
          <DropdownItem divider />
        }

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            style={{ paddingTop: 0, paddingBottom: 0, color: '#0847d6' }}
            color="link"
            type="button"
            onClick={() => { goToNotificacoes() }}
          >
            Ver Mais
          </Button>
        </div>

      </DropdownMenu>

    </UncontrolledDropdown>


  </>
}

export default NotificacoesLista;