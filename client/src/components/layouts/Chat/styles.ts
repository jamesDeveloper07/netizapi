import styled from 'styled-components';
import { Button } from "reactstrap";

export const Container = styled.div`
  
`;

export const SendButton = styled(Button)`
    border-radius: 50%;
`
export const ContentMessage = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 60px;
    padding: 2px 8px 2px 8px;
    align-items: center;
    border: 1px solid var(--lighter);
    border-radius: 8px;
    box-shadow: 0px 2px 11px 0px var(--lighter);

    input {
        color: var(--dark) !important;
    }
`

export const MessageContainer = styled.div`
    margin: 8px 8px 8px 8px;
`

export const ConersationContainer = styled.div`
    min-height: 100px;
    display: flex;
    flex-direction: column;
    max-height: 60vh;
    overflow: auto;
`
export const Header = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
`
export const ClienteDetailContainer = styled.div`
    display: flex;
    flex-direction: column;
`