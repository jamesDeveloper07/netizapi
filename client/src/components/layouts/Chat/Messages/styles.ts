import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow: auto;
`;

export const BalaoContainer = styled.div<{ origem: 'in' | 'out' }>`
    display: flex;
    flex: 1;
    width: 100%;
    flex-direction: ${props => props.origem === 'out' ? 'row-reverse' : 'row'};
    align-items: center;
`

export const BalaoMensagem = styled.div<{ origem: 'in' | 'out' }>`
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    min-height: 60px;
    padding: 16px 16px 16px 16px;
    min-width: 50%;
    max-width: 80%;
    justify-content: center;
    background-color: var(${props => props.origem === 'out' ? '--primary' : '--lighter'});
    color: ${props => props.origem === 'out' ? '#fff' : '#000'};
    align-self: ${props => props.origem === 'out' ? 'flex-end' : 'flex-start'};
    border-radius: 40px;
    border-bottom-right-radius: ${props => props.origem === 'out' ? '0' : '40px'};
    border-bottom-left-radius: ${props => props.origem === 'out' ? '40px' : '0'};
    align-items: ${props => props.origem === 'out' ? 'flex-end' : 'flex-start'};
`

export const BalaoMensagemRow = styled.div`
   display: flex;
   flex-direction: row;
`

export const BalaoMensagemCol = styled.div`
   display: flex;
   flex-direction: column;
   flex: 1;
`

export const BalaoMensagemOut = styled(BalaoMensagem)`

`

export const BalaoMensagemIn = styled(BalaoMensagem)`

`