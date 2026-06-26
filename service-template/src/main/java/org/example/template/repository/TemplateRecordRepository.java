package org.example.template.repository;

import org.example.template.entity.TemplateRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRecordRepository extends JpaRepository<TemplateRecord, String> {
}
