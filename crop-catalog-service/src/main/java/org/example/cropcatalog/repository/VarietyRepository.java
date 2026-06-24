package org.example.cropcatalog.repository;

import java.util.List;
import org.example.cropcatalog.entity.Crop;
import org.example.cropcatalog.entity.Variety;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VarietyRepository extends JpaRepository<Variety, Integer> {

    List<Variety> findAllByCrop(Crop crop);
}
