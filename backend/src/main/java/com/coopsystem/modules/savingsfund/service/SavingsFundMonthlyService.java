package com.coopsystem.modules.savingsfund.service;

import com.coopsystem.modules.savingsfund.entity.SavingsFundMonthly;
import com.coopsystem.modules.savingsfund.repository.SavingsFundMonthlyRepository;
import com.coopsystem.modules.transaction.entity.TransactionType;
import com.coopsystem.modules.transaction.repository.TransactionRepository;
import com.coopsystem.shared.exception.BusinessException;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SavingsFundMonthlyService {

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private final SavingsFundMonthlyRepository savingsFundRepository;
    private final TransactionRepository transactionRepository;

    public SavingsFundMonthlyService(
            SavingsFundMonthlyRepository savingsFundRepository,
            TransactionRepository transactionRepository) {

        this.savingsFundRepository = savingsFundRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Obtiene el fondo correspondiente a un año y mes.
     *
     * Si el mes todavía no existe, se crea y se guarda
     * automáticamente en la base de datos.
     */
    @Transactional
    public SavingsFundMonthly getMonthlyFund(
            Integer year,
            Integer month) {

        validateMonth(month);

        return savingsFundRepository
                .findByYearAndMonth(year, month)
                .orElseGet(() ->
                        savingsFundRepository.save(
                                createInitialMonthlyFund(
                                        year,
                                        month
                                )
                        )
                );
    }

    /**
     * Crea o configura el fondo de un mes.
     *
     * El porcentaje de préstamos y el porcentaje
     * de devoluciones deben sumar exactamente 100%.
     */
    @Transactional
    public SavingsFundMonthly configureMonthlyFund(
            Integer year,
            Integer month,
            BigDecimal loanPercentage) {

        validateMonth(month);
        validatePercentage(loanPercentage);

        BigDecimal returnsPercentage =
                ONE_HUNDRED.subtract(loanPercentage);

        SavingsFundMonthly fund =
                savingsFundRepository
                        .findByYearAndMonth(year, month)
                        .orElseGet(() ->
                                createInitialMonthlyFund(
                                        year,
                                        month
                                )
                        );

        if ("CLOSED".equals(fund.getStatus())) {
            throw new IllegalStateException(
                    "El corte mensual ya está cerrado"
            );
        }

        fund.setLoanPercentage(loanPercentage);
        fund.setReturnsPercentage(returnsPercentage);

        recalculateFund(fund);

        return savingsFundRepository.save(fund);
    }

    /**
     * Recalcula los valores del fondo utilizando únicamente
     * depósitos de ahorro registrados durante el mes.
     */
    @Transactional
    public SavingsFundMonthly recalculateMonthlyFund(
            Integer year,
            Integer month) {

        validateMonth(month);

        SavingsFundMonthly fund =
                savingsFundRepository
                        .findByYearAndMonth(year, month)
                        .orElseGet(() ->
                                createInitialMonthlyFund(
                                        year,
                                        month
                                )
                        );

        if ("CLOSED".equals(fund.getStatus())) {
            throw new IllegalStateException(
                    "El corte mensual ya está cerrado"
            );
        }

        recalculateFund(fund);

        return savingsFundRepository.save(fund);
    }

    /**
     * Cierra definitivamente el corte mensual.
     *
     * El saldo disponible para préstamos se conservará
     * como saldo inicial del siguiente mes.
     */
    @Transactional
    public SavingsFundMonthly closeMonthlyFund(
            Integer year,
            Integer month) {

        validateMonth(month);

        SavingsFundMonthly fund =
                savingsFundRepository
                        .findByYearAndMonth(year, month)
                        .orElseGet(() ->
                                createInitialMonthlyFund(
                                        year,
                                        month
                                )
                        );

        if ("CLOSED".equals(fund.getStatus())) {
            throw new IllegalStateException(
                    "El corte mensual ya está cerrado"
            );
        }

        recalculateFund(fund);

        fund.setStatus("CLOSED");
        fund.setClosedAt(LocalDateTime.now());

        return savingsFundRepository.save(fund);
    }

    /**
     * Registra un desembolso de préstamo en el fondo
     * correspondiente al mes actual.
     *
     * El desembolso reduce el saldo disponible del
     * Fondo de Préstamos y queda acumulado en el
     * corte mensual.
     */
    @Transactional
    public SavingsFundMonthly registerLoanDisbursement(
            BigDecimal amount) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "El valor del desembolso debe ser mayor que cero"
            );
        }

        LocalDate now = LocalDate.now();

        SavingsFundMonthly fund =
                getMonthlyFund(
                        now.getYear(),
                        now.getMonthValue()
                );

        if ("CLOSED".equals(fund.getStatus())) {
            throw new IllegalStateException(
                    "El corte mensual ya está cerrado"
            );
        }

        /*
         * Actualiza primero los depósitos y la asignación
         * del mes para conocer el disponible real.
         */
        recalculateFund(fund);

        BigDecimal available =
                fund.getLoanFundAvailable() != null
                        ? fund.getLoanFundAvailable()
                        : BigDecimal.ZERO;

        /*
         * No permite desembolsar más dinero del
         * disponible en el Fondo de Préstamos.
         */
        if (amount.compareTo(available) > 0) {
            throw new BusinessException(
                    "El Fondo de Préstamos no tiene saldo disponible suficiente"
            );
        }

        BigDecimal currentDisbursements =
                fund.getLoanDisbursements() != null
                        ? fund.getLoanDisbursements()
                        : BigDecimal.ZERO;

        fund.setLoanDisbursements(
                currentDisbursements.add(amount)
        );

        fund.setLoanFundAvailable(
                available.subtract(amount)
        );

        return savingsFundRepository.save(fund);
    }

    /**
     * Obtiene el histórico de fondos mensuales.
     */
    @Transactional
    public List<SavingsFundMonthly> getHistory() {

        return savingsFundRepository.findAll()
                .stream()
                .sorted((a, b) -> {

                    int yearComparison =
                            b.getYear().compareTo(
                                    a.getYear()
                            );

                    if (yearComparison != 0) {
                        return yearComparison;
                    }

                    return b.getMonth().compareTo(
                            a.getMonth()
                    );
                })
                .toList();
    }

    /**
     * Recalcula todos los valores financieros del mes.
     *
     * IMPORTANTE:
     * Solo TransactionType.DEPOSIT alimenta el fondo.
     */
    private void recalculateFund(
            SavingsFundMonthly fund) {

        LocalDate startDate =
                LocalDate.of(
                        fund.getYear(),
                        fund.getMonth(),
                        1
                );

        LocalDate endDate =
                startDate.plusMonths(1);

        LocalDateTime startDateTime =
                startDate.atStartOfDay();

        LocalDateTime endDateTime =
                endDate.atStartOfDay();

        /*
         * El Fondo de Ahorros se alimenta
         * EXCLUSIVAMENTE de depósitos.
         *
         * No se incluyen:
         * - retiros
         * - pagos de préstamos
         * - desembolsos
         * - transferencias
         * - otros movimientos
         */
        BigDecimal totalSavingsDeposits =
                transactionRepository
                        .sumAmountByTypeBetweenDates(
                                TransactionType.DEPOSIT.name(),
                                startDateTime,
                                endDateTime
                        );

        if (totalSavingsDeposits == null) {
            totalSavingsDeposits =
                    BigDecimal.ZERO;
        }

        totalSavingsDeposits =
                totalSavingsDeposits.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        fund.setTotalSavingsDeposits(
                totalSavingsDeposits
        );

        /*
         * Configuración inicial 70/30.
         */
        if (fund.getLoanPercentage() == null) {
            fund.setLoanPercentage(
                    new BigDecimal("70.00")
            );
        }

        if (fund.getReturnsPercentage() == null) {
            fund.setReturnsPercentage(
                    new BigDecimal("30.00")
            );
        }

        /*
         * Fondo destinado a préstamos.
         */
        BigDecimal loanFundAmount =
                totalSavingsDeposits
                        .multiply(
                                fund.getLoanPercentage()
                        )
                        .divide(
                                ONE_HUNDRED,
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Reserva para devoluciones.
         */
        BigDecimal returnsReserveAmount =
                totalSavingsDeposits
                        .multiply(
                                fund.getReturnsPercentage()
                        )
                        .divide(
                                ONE_HUNDRED,
                                2,
                                RoundingMode.HALF_UP
                        );

        fund.setLoanFundAmount(
                loanFundAmount
        );

        fund.setReturnsReserveAmount(
                returnsReserveAmount
        );

        /*
         * Los desembolsos ya registrados en el fondo
         * se conservan.
         */
        BigDecimal loanDisbursements =
                fund.getLoanDisbursements();

        if (loanDisbursements == null) {
            loanDisbursements =
                    BigDecimal.ZERO;
        }

        fund.setLoanDisbursements(
                loanDisbursements
        );

        /*
         * IMPORTANTE:
         *
         * Si el fondo está abierto, volvemos a consultar
         * el saldo disponible del mes anterior.
         *
         * Esto permite corregir automáticamente un mes
         * que fue creado antes de que el mes anterior
         * tuviera su saldo definitivo.
         *
         * Ejemplo:
         *
         * Septiembre disponible = 35.770.000
         * Octubre anterior      = 0
         *
         * Al recalcular octubre:
         *
         * previousMonthBalance = 35.770.000
         */
        if (!"CLOSED".equals(fund.getStatus())) {

            BigDecimal latestPreviousBalance =
                    findPreviousMonthBalance(
                            fund.getYear(),
                            fund.getMonth()
                    );

            fund.setPreviousMonthBalance(
                    latestPreviousBalance
            );
        }

        /*
         * Disponible para préstamos:
         *
         * saldo heredado del mes anterior
         * +
         * asignación del mes
         * -
         * desembolsos
         */
        BigDecimal previousBalance =
                fund.getPreviousMonthBalance();

        if (previousBalance == null) {
            previousBalance =
                    BigDecimal.ZERO;
        }

        BigDecimal loanFundAvailable =
                previousBalance
                        .add(loanFundAmount)
                        .subtract(loanDisbursements);

        /*
         * Nunca permitimos un disponible negativo.
         */
        if (loanFundAvailable.compareTo(
                BigDecimal.ZERO
        ) < 0) {

            loanFundAvailable =
                    BigDecimal.ZERO;
        }

        fund.setLoanFundAvailable(
                loanFundAvailable.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );
    }

    /**
     * Crea el fondo inicial para un mes.
     *
     * El saldo disponible del mes anterior
     * pasa automáticamente como saldo inicial.
     */
    private SavingsFundMonthly createInitialMonthlyFund(
            Integer year,
            Integer month) {

        SavingsFundMonthly fund =
                new SavingsFundMonthly();

        fund.setYear(year);
        fund.setMonth(month);

        /*
         * Configuración inicial.
         */
        fund.setLoanPercentage(
                new BigDecimal("70.00")
        );

        fund.setReturnsPercentage(
                new BigDecimal("30.00")
        );

        /*
         * Valores iniciales.
         */
        fund.setTotalSavingsDeposits(
                BigDecimal.ZERO
        );

        fund.setLoanFundAmount(
                BigDecimal.ZERO
        );

        fund.setReturnsReserveAmount(
                BigDecimal.ZERO
        );

        fund.setLoanDisbursements(
                BigDecimal.ZERO
        );

        /*
         * El saldo disponible del mes anterior
         * pasa automáticamente al nuevo mes.
         */
        BigDecimal previousBalance =
                findPreviousMonthBalance(
                        year,
                        month
                );

        fund.setPreviousMonthBalance(
                previousBalance
        );

        fund.setLoanFundAvailable(
                previousBalance
        );

        fund.setStatus("OPEN");

        return fund;
    }

    /**
     * Busca el saldo disponible del mes inmediatamente anterior.
     *
     * Ese saldo pasa automáticamente al nuevo mes.
     */
    private BigDecimal findPreviousMonthBalance(
            Integer year,
            Integer month) {

        LocalDate currentMonth =
                LocalDate.of(
                        year,
                        month,
                        1
                );

        LocalDate previousMonth =
                currentMonth.minusMonths(1);

        return savingsFundRepository
                .findByYearAndMonth(
                        previousMonth.getYear(),
                        previousMonth.getMonthValue()
                )
                .map(
                        SavingsFundMonthly::getLoanFundAvailable
                )
                .orElse(
                        BigDecimal.ZERO
                );
    }

    /**
     * Valida el mes.
     */
    private void validateMonth(
            Integer month) {

        if (month == null
                || month < 1
                || month > 12) {

            throw new IllegalArgumentException(
                    "El mes debe estar entre 1 y 12"
            );
        }
    }

    /**
     * Valida el porcentaje destinado
     * al fondo de préstamos.
     *
     * El porcentaje de devoluciones se calcula
     * automáticamente como 100 - porcentaje de préstamos.
     */
    private void validatePercentage(
            BigDecimal loanPercentage) {

        if (loanPercentage == null) {
            throw new IllegalArgumentException(
                    "El porcentaje para préstamos es obligatorio"
            );
        }

        if (loanPercentage.compareTo(
                BigDecimal.ZERO
        ) < 0) {

            throw new IllegalArgumentException(
                    "El porcentaje para préstamos no puede ser negativo"
            );
        }

        if (loanPercentage.compareTo(
                ONE_HUNDRED
        ) > 0) {

            throw new IllegalArgumentException(
                    "El porcentaje para préstamos no puede superar 100"
            );
        }
    }
}