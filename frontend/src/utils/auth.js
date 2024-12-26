export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        return payload.exp * 1000 > Date.now(); // Ensure token is not expired
    } catch {
        return false; // Invalid token format
    }
};
