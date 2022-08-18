export const TOKEN_KEY = "@netiz-token";
export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;
export const getToken = () => JSON.parse(localStorage.getItem(TOKEN_KEY));
export const login = ({ auth, user }) => {
    localStorage.setItem('@netiz-user', JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, auth.token);
};
export const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
};