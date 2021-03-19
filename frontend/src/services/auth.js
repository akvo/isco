import request from "../lib/request";

const login = async data => {
    return await getUser();
};

const logout = async () => {
    await request().get("sanctum/csrf-cookie");
    await request().post("/logout");
};

const getUser = async (u, token) => {
  console.log('api user', u, token);
  try {
    const { data } = await request(token).get("/api/me");
        return data;
    } catch {}
    return false;
};

const register = async data => {
// TODO: double check    await request().get("sanctum/csrf-cookie");
    return await request().post("/public-api/register", data);
};

const forgotPassword = async data => {
// TODO: double check    await request().get("sanctum/csrf-cookie");
    return await request().post("/api/auth/forgot-password", data);
};

const resetPassword = async data => {
    // await request().get("sanctum/csrf-cookie");
    return await request().post("/api/auth/reset-password", data);
};

const resendVerificationEmail = async () => {
    await request().get("sanctum/csrf-cookie");
    return await request().post("/email/verification-notification");
};

const updatePassword = async data => {
    await request().get("sanctum/csrf-cookie");
    return await request().post("/api/user/update", data);
};

const getOrganizations = async data => {
    return await request().get("/public-api/organizations");
};

export default {
    login,
    logout,
    getUser,
    register,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    updatePassword,
    getOrganizations
};
