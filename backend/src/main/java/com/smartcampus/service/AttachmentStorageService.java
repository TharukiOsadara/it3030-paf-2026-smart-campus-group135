package com.smartcampus.service;

import com.smartcampus.exception.InvalidAttachmentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class AttachmentStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path uploadRoot;

    public AttachmentStorageService(@Value("${file.upload-dir:uploads/}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException ex) {
            throw new InvalidAttachmentException("Could not initialize attachment storage directory");
        }
    }

    public StoredAttachment store(String ticketId, MultipartFile file) {
        validate(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String safeFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : ("." + extension));

        Path ticketDir = uploadRoot.resolve("tickets").resolve(ticketId).normalize();
        Path targetPath = ticketDir.resolve(safeFileName).normalize();

        if (!targetPath.startsWith(ticketDir)) {
            throw new InvalidAttachmentException("Invalid attachment path");
        }

        try {
            Files.createDirectories(ticketDir);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return new StoredAttachment(safeFileName, originalFileName, file.getContentType(), file.getSize());
        } catch (IOException ex) {
            throw new InvalidAttachmentException("Failed to store attachment");
        }
    }

    public Resource load(String ticketId, String storedFileName) {
        try {
            Path filePath = uploadRoot.resolve("tickets").resolve(ticketId).resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new InvalidAttachmentException("Attachment file not found");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new InvalidAttachmentException("Attachment file path is invalid");
        }
    }

    public void delete(String ticketId, String storedFileName) {
        Path filePath = uploadRoot.resolve("tickets").resolve(ticketId).resolve(storedFileName).normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new InvalidAttachmentException("Failed to delete attachment from disk");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAttachmentException("Attachment file is required");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new InvalidAttachmentException("Attachment exceeds 10MB size limit");
        }

        String type = file.getContentType();
        if (type == null || !ALLOWED_TYPES.contains(type.toLowerCase())) {
            throw new InvalidAttachmentException("Only image attachments are allowed (jpg, png, webp, gif)");
        }
    }

    private String extractExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        if (index <= 0 || index == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(index + 1).replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public record StoredAttachment(String storedFileName, String originalFileName, String contentType, long sizeBytes) {}
}
