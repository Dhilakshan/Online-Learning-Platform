const getToken = () => {
    return localStorage.getItem("token") || null;
}

const getUser = () => {
    const token = getToken();
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

const getUserRole = () => {
    const token = getToken();
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split(".")[1])).role;
    } catch {
        return null;
    }
}

const getRefreshToken = () => {
    const user = localStorage.getItem("user") || null;
    
    if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.refreshToken;
    } else {
        return null;
    }
}

export {
    getToken,
    getUserRole,getUser,
    getRefreshToken
}