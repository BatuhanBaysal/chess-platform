package com.batuhan.chess.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "chess.storage.s3")
public class S3Properties {

    private String endpoint;
    private String region = "us-east-1";
    private String accessKey;
    private String secretKey;
    private String bucketName = "chess-storage";
    private boolean pathStyleAccessEnabled = true;
}
