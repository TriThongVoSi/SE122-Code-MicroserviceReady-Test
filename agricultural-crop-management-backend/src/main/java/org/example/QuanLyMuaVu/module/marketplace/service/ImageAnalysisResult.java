package org.example.QuanLyMuaVu.module.marketplace.service;

import java.util.List;

public record ImageAnalysisResult(
        String description,
        String ocrText,
        Entities entities,
        String searchQuery,
        List<String> alternativeQueries,
        Double confidence) {

    public ImageAnalysisResult {
        entities = entities == null ? Entities.empty() : entities;
        alternativeQueries = alternativeQueries == null ? List.of() : List.copyOf(alternativeQueries);
    }

    public record Entities(
            List<String> products,
            List<String> brands,
            List<String> colors,
            List<String> objects,
            List<String> codes) {

        public Entities {
            products = products == null ? List.of() : List.copyOf(products);
            brands = brands == null ? List.of() : List.copyOf(brands);
            colors = colors == null ? List.of() : List.copyOf(colors);
            objects = objects == null ? List.of() : List.copyOf(objects);
            codes = codes == null ? List.of() : List.copyOf(codes);
        }

        public static Entities empty() {
            return new Entities(List.of(), List.of(), List.of(), List.of(), List.of());
        }
    }
}
