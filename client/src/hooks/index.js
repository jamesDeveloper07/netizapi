import React, { useEffect } from 'react'

export function usePersistedState(key, defaultValue) {
    key = `${window.location.href}-${key}`
    const [state, setState] = React.useState(
        () => JSON.parse(sessionStorage.getItem(key)) || defaultValue
    );
    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
}


export function appendScript(scriptToAppend, onLoad) {
    const allSuspects = document.getElementsByTagName('script');
    let doAppend = true;
    if (allSuspects && allSuspects.length > 0) {
        for (let i = allSuspects.length - 1; i >= 0; i--) {
            if (allSuspects[i] && allSuspects[i].getAttribute('src') !== null
                && allSuspects[i].getAttribute('src').indexOf(`${scriptToAppend}`) !== -1) {
                doAppend = false;
            }
        }
    }

    if (doAppend) {
        const script = document.createElement('script');
        script.src = scriptToAppend;
        script.async = false;
        script.onload = () => onLoad();
        document.body.appendChild(script);
    }
}

export function removeScript(scriptToRemove) {
    const allSuspects = document.getElementsByTagName('script');
    for (let i = allSuspects.length - 1; i >= 0; i--) {
        if (allSuspects[i] && allSuspects[i].getAttribute('src') !== null
            && allSuspects[i].getAttribute('src').indexOf(`${scriptToRemove}`) !== -1) {
            allSuspects[i].parentNode.removeChild(allSuspects[i]);
        }
    }
}