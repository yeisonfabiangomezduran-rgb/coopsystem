import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

export async function getLoans() {
  return getResponseData(await api.get("/loans"));
}

export async function getLoansByAssociateId(associateId) {
  return getResponseData(
    await api.get("/loans", {
      params: {
        associateId,
      },
    })
  );
}

export async function getLoanById(id) {
  return getResponseData(await api.get(`/loans/${id}`));
}

export async function getLoanByNumber(loanNumber) {
  return getResponseData(await api.get(`/loans/number/${loanNumber}`));
}

export async function createLoan(data) {
  return getResponseData(await api.post("/loans", data));
}

export async function approveLoan(id) {
  return getResponseData(await api.patch(`/loans/${id}/approve`));
}

export async function rejectLoan(id) {
  return getResponseData(await api.patch(`/loans/${id}/reject`));
}

export async function disburseLoan(id) {
  return getResponseData(await api.patch(`/loans/${id}/disburse`));
}

export async function getLoanInstallments(id) {
  return getResponseData(await api.get(`/loans/${id}/installments`));
}

export async function payLoanInstallment(id, data) {
  return getResponseData(await api.post(`/loans/${id}/payments`, data));
}