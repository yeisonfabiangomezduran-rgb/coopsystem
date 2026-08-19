import api from "./api";

const authService = {
  async login(username, password) {
    const response = await api.post("/auth/login", { username, password });
    const loginData = response.data.data;

    localStorage.setItem("token", loginData.token);

    return loginData;
  },
};

export default authService;
