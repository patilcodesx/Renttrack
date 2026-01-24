package com.renttrack.backend.upload.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String BASE_DIR = "uploads/property";

    public String store(MultipartFile file) {
        try {
            File dir = new File(BASE_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filename =
                    UUID.randomUUID() + "_" + file.getOriginalFilename();

            File target = new File(dir, filename);
            Files.copy(file.getInputStream(), target.toPath());

            // 👇 stored in DB
            return "/uploads/property/" + filename;

        } catch (Exception e) {
            throw new RuntimeException("File upload failed");
        }
    }
}
