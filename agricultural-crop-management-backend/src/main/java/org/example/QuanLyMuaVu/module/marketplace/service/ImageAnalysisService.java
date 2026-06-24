package org.example.QuanLyMuaVu.module.marketplace.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageAnalysisService {

    ImageAnalysisResult analyze(MultipartFile image);
}
