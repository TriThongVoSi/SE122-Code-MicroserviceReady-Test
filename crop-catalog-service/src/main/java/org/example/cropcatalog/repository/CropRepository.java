package org.example.cropcatalog.repository;

import java.util.List;
import org.example.cropcatalog.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CropRepository extends JpaRepository<Crop, Integer> {
    List<Crop> findByCropNameContainingIgnoreCase(String name);

    boolean existsByCropNameIgnoreCase(String cropName);
}
