import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

export async function getTransactionsByAccount(savingsAccountId) {
  return getResponseData(
    await api.get(`/transactions/account/${savingsAccountId}`)
  );
}

export async function deposit(savingsAccountId, amount) {
  return getResponseData(
    await api.post(`/transactions/deposit/${savingsAccountId}`, { amount })
  );
}

export async function withdraw(savingsAccountId, amount) {
  return getResponseData(
    await api.post(`/transactions/withdraw/${savingsAccountId}`, { amount })
  );
}
