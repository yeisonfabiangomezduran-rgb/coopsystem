package com.coopsystem.modules.associate.repository;

import com.coopsystem.modules.associate.entity.Associate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssociateRepository extends JpaRepository<Associate, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    boolean existsByDocumentNumber(String documentNumber);

    boolean existsByDocumentNumberAndIdNot(String documentNumber, Long id);

    @Query("""
            SELECT a
            FROM Associate a
            WHERE LOWER(a.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(COALESCE(a.code, '')) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(COALESCE(a.documentNumber, '')) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<Associate> searchByText(
            @Param("query") String query,
            Pageable pageable);
}
