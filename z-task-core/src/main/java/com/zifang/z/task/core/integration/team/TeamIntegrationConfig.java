package com.zifang.z.task.core.integration.team;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * 跨域能力调用（z-task → z-team）的 HTTP 基础设施。
 *
 * <p>2026-11-02 随待办前端搬迁新增：待办详情里的笔记 / 个人 Agent / 员工搜索 /
 * 群聊场景 / 图片上传 5 类能力归属 z-team，z-task 通过
 * {@link RemoteTeamClient} 反向调用它们。
 *
 * <p>⚠ 超时必须设：z-team 不可达时，若不设超时，本线程会一直挂着，
 * 待办详情页的跨域列就永远转圈 —— 一个跨域能力能把整个详情抽屉拖死。
 *
 * @author z-task
 * @since 1.0.0
 */
@Configuration
public class TeamIntegrationConfig {

    @Bean
    public RestTemplate teamRestTemplate(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // 连接超时 3s：z-team 网络不通时快速失败，而不是等到默认的无限等待
        factory.setConnectTimeout(Duration.ofSeconds(3));
        // 读超时 15s：图片上传可能稍慢，但不该无限等
        factory.setReadTimeout(Duration.ofSeconds(15));
        return builder.requestFactory(() -> factory).build();
    }
}
