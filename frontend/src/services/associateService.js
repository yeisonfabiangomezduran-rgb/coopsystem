import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

const associateService = {
  async getAll() {
    return getResponseData(await api.get("/associates"));
  },

  async search(query, limit = 5) {
    const response = await api.get("/associates", {
      params: {
        q: query,
        limit,
      },
    });

    return getResponseData(response);
  },

  async getById(id) {
    return getResponseData(await api.get(`/associates/${id}`));
  },

  async create(payload) {
    return getResponseData(await api.post("/associates", payload));
  },

  async update(id, payload) {
    return getResponseData(await api.put(`/associates/${id}`, payload));
  },

  async delete(id) {
    return getResponseData(await api.delete(`/associates/${id}`));
  },
};

export default associateService;