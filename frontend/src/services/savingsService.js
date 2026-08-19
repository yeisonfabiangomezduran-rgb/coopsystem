import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

export async function getSavingsAccounts() {
  return getResponseData(await api.get("/savings-accounts"));
}

export async function getSavingsAccountById(id) {
  return getResponseData(await api.get(`/savings-accounts/${id}`));
}

export async function getSavingsAccountByNumber(accountNumber) {
  return getResponseData(
    await api.get(`/savings-accounts/account/${accountNumber}`)
  );
}

export async function createSavingsAccount(data) {
  return getResponseData(await api.post("/savings-accounts", data));
}

export async function updateSavingsAccountStatus(id, status) {
  return getResponseData(
    await api.patch(`/savings-accounts/${id}/status`, { status })
  );
}
