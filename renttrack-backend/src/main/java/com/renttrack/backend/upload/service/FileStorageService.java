package com.renttrack.backend.upload.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    // ✅ MUST match docker volume path
    private static final String UPLOAD_DIR = "/app/uploads";

    public String store(MultipartFile file) {

        try {
            // ✅ create folder if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            // ✅ unique filename
            String filename =
                    UUID.randomUUID() + "_" + file.getOriginalFilename();

            // ✅ final file path
            Path filePath = uploadPath.resolve(filename);

            // ✅ copy file
            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            /*
             ✅ VERY IMPORTANT
             This is the URL that frontend will load directly
             Spring serves this via WebConfig
            */
            return "/uploads/" + filename;

        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
    }
}
