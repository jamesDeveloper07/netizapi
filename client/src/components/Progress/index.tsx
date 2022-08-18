import React from 'react';

import { Container } from './styles';
import {
    Spinner,
} from 'reactstrap';

interface IProgress {
    text?: string
}

const Progress: React.FC<IProgress> = ({ text }) => {
    return (
        <Container>
            <Spinner
                color='primary'
                size='xl'
            />
            {text}
        </Container>
    );
}

export default Progress;