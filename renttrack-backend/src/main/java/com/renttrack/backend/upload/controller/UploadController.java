package com.renttrack.backend.upload.controller;

import com.renttrack.backend.upload.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@CrossOrigin
public class UploadController {

    private final FileStorageService storage;

    @PostMapping("/property")
    public Map<String, String> uploadProperty(
            @RequestParam("file") MultipartFile file
    ) {
        String url = storage.store(file);
        return Map.of("url", url);
    }
}
