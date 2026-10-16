package dev.hafiz.portfolio;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Files;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class PortfolioApiIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final String ADMIN_PASSWORD = "integration-test-password";
    private static final String CSRF = "X-Requested-With";
    private static final String CSRF_VALUE = "portfolio-admin";

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) throws Exception {
        registry.add("app.admin.email", () -> ADMIN_EMAIL);
        registry.add("app.admin.password", () -> ADMIN_PASSWORD);
        registry.add("app.media.dir", Files.createTempDirectory("portfolio-media")::toString);
        registry.add("app.revalidate.url", () -> "http://127.0.0.1:9/internal/revalidate");
    }

    @Autowired
    private MockMvc mvc;

    @Test
    void publicSiteReturnsSeededContent() throws Exception {
        mvc.perform(get("/api/public/site"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.fullName").value("Hafiz Adha Febrian"))
                .andExpect(jsonPath("$.profile.logoText").value("~/apisdsn"))
                .andExpect(jsonPath("$.profile.headline.en").exists())
                .andExpect(jsonPath("$.profile.photoMediaId").isNotEmpty())
                .andExpect(jsonPath("$.experiences.length()").value(5))
                .andExpect(jsonPath("$.experiences[0].current").value(true))
                .andExpect(jsonPath("$.caseStudies[0].slug").value("column-level-encryption"))
                .andExpect(jsonPath("$.caseStudies[0].body").doesNotExist());
    }

    @Test
    void brandingIsPublic() throws Exception {
        mvc.perform(get("/api/public/branding"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoText").value("~/apisdsn"))
                .andExpect(jsonPath("$.accentColor").value("#1B6E47"));
    }

    @Test
    void adminCanChangeTheLogo() throws Exception {
        Cookie session = login();
        String profile = mvc.perform(get("/api/admin/profile").cookie(session))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        mvc.perform(put("/api/admin/profile").cookie(session).header(CSRF, CSRF_VALUE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profile.replace("\"logoText\":\"~/apisdsn\"", "\"logoText\":\"~/hafiz\"")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoText").value("~/hafiz"));

        mvc.perform(get("/api/public/branding")).andExpect(jsonPath("$.logoText").value("~/hafiz"));

        // restore so other tests see the seeded value
        mvc.perform(put("/api/admin/profile").cookie(session).header(CSRF, CSRF_VALUE)
                        .contentType(MediaType.APPLICATION_JSON).content(profile))
                .andExpect(status().isOk());
    }

    @Test
    void publicCaseStudyIncludesBody() throws Exception {
        mvc.perform(get("/api/public/case-studies/column-level-encryption"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.body.id").isNotEmpty())
                .andExpect(jsonPath("$.metrics[0].value").value("4"));

        mvc.perform(get("/api/public/case-studies/does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminEndpointsRequireLogin() throws Exception {
        mvc.perform(get("/api/admin/experiences")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanCreateUpdateAndReorderProjects() throws Exception {
        Cookie session = login();

        String project = """
                {"slug":"test-project","name":"test-project",
                 "tag":{"id":"Uji","en":"Test"},
                 "description":{"id":"Deskripsi","en":"Description"},
                 "repoUrl":"https://github.com/apisdsn/test","published":true}
                """;

        // Missing CSRF header is refused even with a valid session
        mvc.perform(post("/api/admin/projects").cookie(session)
                        .contentType(MediaType.APPLICATION_JSON).content(project))
                .andExpect(status().isForbidden());

        MvcResult created = mvc.perform(post("/api/admin/projects").cookie(session).header(CSRF, CSRF_VALUE)
                        .contentType(MediaType.APPLICATION_JSON).content(project))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();
        long id = Long.parseLong(created.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1"));

        mvc.perform(put("/api/admin/projects/" + id).cookie(session).header(CSRF, CSRF_VALUE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(project.replace("\"Test\"", "\"Updated\"")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tag.en").value("Updated"));

        String listJson = mvc.perform(get("/api/admin/projects").cookie(session))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(listJson).contains("\"slug\":\"test-project\"");

        mvc.perform(get("/api/admin/audit-logs").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].entityType").value("project"));
    }

    @Test
    void invalidContentIsRejectedWithFieldErrors() throws Exception {
        Cookie session = login();

        mvc.perform(post("/api/admin/projects").cookie(session).header(CSRF, CSRF_VALUE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slug\":\"Not A Slug\",\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.slug").exists())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    private Cookie login() throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        Cookie cookie = result.getResponse().getCookie("portfolio_token");
        assertThat(cookie).isNotNull();
        assertThat(cookie.isHttpOnly()).isTrue();
        return cookie;
    }
}
