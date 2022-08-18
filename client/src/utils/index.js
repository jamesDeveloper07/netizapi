export const userStorageKey = '@netiz-user'
export const authStorageKey = '@netiz-token'
export const empresaStorageKey = '@netiz-empresa'

export const user = JSON.parse(localStorage.getItem(userStorageKey))

export const setUser = (user) => {
    localStorage.setItem(userStorageKey, JSON.stringify(user))
}

export const hasPermission = (permission) => {
    if (!user) return false
    let permissions = user
        .roles
        .map(item => item.permissions)
        .map(item => item.find(it => it.slug == permission))
    for (let p of permissions) {
        if (p && p.slug) return true
    }
    return false
}

export const bindErrors = (error) => {
    if (error && error instanceof Array) {
        const errors = {}
        for (let e of error) {
            errors[e.field] = e.message
        }
        return errors
    } else if (error.message) {
        return error.message
    } else {
        return "Não foi possível realizar solicitação"
    }
}

export const getContrastYIQ = (hexcolor) => {
    var r = parseInt(hexcolor.substr(1, 2), 16);
    var g = parseInt(hexcolor.substr(3, 2), 16);
    var b = parseInt(hexcolor.substr(5, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    var color = (yiq >= 128) ? 'black' : 'white';

    return color
}