import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Plus, ReceiptText } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import {
  getTransactionFilters,
  getTransactionStatusVariant,
  getTransactionSummaryCards,
  getTransactionTypeVariant,
  getTransactions,
} from "../../services/transactionService";

function renderSummaryIcon(iconName) {
  switch (iconName) {
    case "ArrowUpRight":
      return <ArrowUpRight size={28} />;
    case "ArrowDownLeft":
      return <ArrowDownLeft size={28} />;
    case "ReceiptText":
      return <ReceiptText size={28} />;
    case "CircleDollarSign":
      return <CircleDollarSign size={28} />;
    default:
      return null;
  }
}

export default function Transactions() {
  const transactions = getTransactions();
  const summaryCards = getTransactionSummaryCards().map((card) => ({
    ...card,
    icon: renderSummaryIcon(card.icon),
  }));
  const transactionFilters = getTransactionFilters();
  const statusVariant = getTransactionStatusVariant();
  const typeVariant = getTransactionTypeVariant();

  return (
    <PageContainer>
      <PageHeader
        action={
          <Button>
            <Plus size={18} strokeWidth={2.5} />
            Nueva transacción
          </Button>
        }
        eyebrow="Gestión de transacciones"
        subtitle="Consulta, filtra y revisa los movimientos registrados en la cooperativa."
        title="Transacciones"
      />

      <SummaryCards items={summaryCards} />

      <DataSection
        action={<div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">+12% vs. semana anterior</div>}
        className="p-6"
        description="Resumen consolidado de los movimientos registrados esta semana."
        headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        title="Resumen de operaciones"
        titleClassName="text-lg font-extrabold tracking-tight text-slate-900"
      >
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-emerald-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-emerald-700">Total ingresos</p>
              <ArrowUpRight size={20} className="text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">$12,8 M</p>
            <p className="mt-2 text-sm font-semibold text-emerald-700">24 movimientos confirmados</p>
          </div>
          <div className="rounded-xl bg-violet-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-violet-700">Total egresos</p>
              <ArrowDownLeft size={20} className="text-violet-600" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">$9,4 M</p>
            <p className="mt-2 text-sm font-semibold text-violet-700">11 movimientos confirmados</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-700">Última revisión</p>
              <ReceiptText size={20} className="text-slate-600" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">10:24 a. m.</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">Revisión diaria cerrada</p>
          </div>
        </div>
      </DataSection>

      <FilterBar
        filters={transactionFilters}
        gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(11rem,0.7fr)_minmax(10rem,0.7fr)_auto]"
        idPrefix="transactions"
        searchAriaLabel="Buscar transacción"
        searchLabel="Buscar transacción"
        searchPlaceholder="Código o concepto"
      />

      <DataSection
        className="overflow-hidden p-0"
        description={`${transactions.length} transacciones registradas.`}
        headerClassName="border-b border-slate-200 px-6 py-5"
        title="Historial de movimientos"
      >
        {transactions.length === 0 ? (
          <EmptyState
            action={
              <Button>
                <Plus size={18} strokeWidth={2.5} />
                Nueva transacción
              </Button>
            }
            description="Cuando registres una transacción, su información aparecerá en este listado."
            icon={<ReceiptText size={24} />}
            title="Aún no hay transacciones registradas"
          />
        ) : (
          <Table className="min-w-[360px]">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Asociado</th>
                <th className="px-6 py-4">Concepto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((transaction) => (
                <tr className="transition hover:bg-slate-50/70" key={transaction.id}>
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{transaction.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{transaction.associate}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{transaction.concept}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${typeVariant[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{transaction.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[transaction.status]}>{transaction.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <ActionMenu label={transaction.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
