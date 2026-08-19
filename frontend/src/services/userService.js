import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

const userService = {
  async getAll() {
    return getResponseData(await api.get("/users"));
  },

  async getById(id) {
    return getResponseData(await api.get(`/users/${id}`));
  },

  async create(payload) {
    return getResponseData(await api.post("/users", payload));
  },

  async update(id, payload) {
    return getResponseData(await api.put(`/users/${id}`, payload));
  },

  async delete(id) {
    return getResponseData(await api.delete(`/users/${id}`));
  },
};

export default userService;
