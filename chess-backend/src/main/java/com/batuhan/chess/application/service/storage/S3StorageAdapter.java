package com.batuhan.chess.application.service.storage;

import com.batuhan.chess.api.config.S3Properties;
import com.batuhan.chess.domain.repository.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageAdapter implements FileStoragePort {

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    @Override
    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        try {
            ensureBucketExists();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(s3Properties.getBucketName())
                .key(key)
                .contentType(contentType)
                .contentLength(contentLength)
                .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, contentLength));
            log.info("File successfully uploaded to S3 storage with key: {}", key);
            return key;
        } catch (Exception e) {
            log.error("Failed to upload file to S3 storage [{}]: {}", key, e.getMessage());
            throw new RuntimeException("Could not upload file: " + key, e);
        }
    }

    @Override
    public byte[] downloadFile(String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(s3Properties.getBucketName())
                .key(key)
                .build();

            byte[] data = s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
            log.debug("File successfully downloaded from S3 storage with key: {}", key);
            return data;
        } catch (NoSuchKeyException e) {
            log.warn("Requested file not found in S3 storage with key: {}", key);
            throw new RuntimeException("File not found: " + key, e);
        } catch (Exception e) {
            log.error("Failed to download file from S3 storage [{}]: {}", key, e.getMessage());
            throw new RuntimeException("Could not download file: " + key, e);
        }
    }

    @Override
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(s3Properties.getBucketName())
                .key(key)
                .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File successfully deleted from S3 storage with key: {}", key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3 storage [{}]: {}", key, e.getMessage());
            throw new RuntimeException("Could not delete file: " + key, e);
        }
    }

    @Override
    public boolean doesFileExist(String key) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(s3Properties.getBucketName())
                .key(key)
                .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            log.debug("File does not exist in S3 storage with key: {}", key);
            return false;
        } catch (Exception e) {
            log.error("Error occurred while checking file existence for key [{}]: {}", key, e.getMessage());
            return false;
        }
    }

    private void ensureBucketExists() {
        String bucketName = s3Properties.getBucketName();
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            log.info("Bucket '{}' not found. Creating it now...", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("Bucket '{}' created successfully.", bucketName);
        } catch (Exception e) {
            log.debug("Could not verify or create bucket '{}', proceeding with execution: {}", bucketName, e.getMessage());
        }
    }
}
