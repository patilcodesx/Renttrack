package com.renttrack.backend.upload.controller;

import com.renttrack.backend.upload.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin
public class UploadController {

    private final FileStorageService storage;

    @PostMapping("/property")
    public Map<String, String> upload(@RequestParam MultipartFile file) {
        String path = storage.store(file);
        return Map.of("url", path);
    }
}
