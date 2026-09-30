package com.coopsystem.modules.report.controller;

import com.coopsystem.modules.report.dto.DashboardReportResponse;
import com.coopsystem.modules.report.service.ReportService;
import com.coopsystem.shared.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.coopsystem.modules.report.dto.AssociateReportResponse;
import com.coopsystem.modules.report.dto.SavingsReportResponse;
import com.coopsystem.modules.report.dto.LoanReportResponse;
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Obtiene los indicadores generales del sistema.
     */
    @GetMapping("/dashboard")
    public ApiResponse<DashboardReportResponse> getDashboard() {

        return ApiResponse.success(
                "Indicadores obtenidos correctamente",
                reportService.getDashboard()
        );
    }

    @GetMapping("/associates")
public ApiResponse<java.util.List<AssociateReportResponse>> getAssociatesReport() {

    return ApiResponse.success(
            "Reporte de asociados obtenido correctamente",
            reportService.getAssociatesReport()
    );
}

@GetMapping("/savings")
public ApiResponse<java.util.List<SavingsReportResponse>> getSavingsReport() {

    return ApiResponse.success(
            "Reporte de ahorros obtenido correctamente",
            reportService.getSavingsReport()
    );
}

@GetMapping("/loans")
public ApiResponse<java.util.List<LoanReportResponse>> getLoansReport() {
    return ApiResponse.success(
            "Reporte de préstamos obtenido correctamente",
            reportService.getLoansReport()
    );
}

}