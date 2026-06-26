package org.example.QuanLyMuaVu.Architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.junit.jupiter.api.Test;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

public class ArchitectureBaselineTest {

    private static final JavaClasses IMPORTED_CLASSES = new ClassFileImporter()
            .withImportOption(new ImportOption.DoNotIncludeTests())
            .withImportOption(new ImportOption.DoNotIncludeJars())
            .importPackages("org.example.QuanLyMuaVu");

    @Test
    void servicesShouldNotDependOnControllers() {
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..Service..", "..service..")
                .should().dependOnClassesThat().resideInAnyPackage("..Controller..", "..controller..");
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void repositoriesShouldNotDependOnServiceOrControllerLayers() {
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..Repository..", "..repository..")
                .should().dependOnClassesThat().resideInAnyPackage("..Service..", "..service..", "..Controller..", "..controller..");
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void controllersShouldNotDependOnRepositories() {
        ArchRule rule = noClasses()
                .that().resideInAnyPackage("..Controller..", "..controller..")
                .should().dependOnClassesThat().resideInAnyPackage("..Repository..", "..repository..");
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void modulesShouldNotDependOnOtherModulesEntitiesOrRepositories() {
        ArchRule rule = classes()
                .that().resideInAnyPackage("..module..")
                .should(notDependOnOtherModuleEntitiesOrRepositories());
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void nonModulePackagesShouldNotIntroduceNewDependenciesToBusinessModules() {
        ArchRule baselineRule = noClasses()
                .that().resideOutsideOfPackage("..module..")
                .and().resideOutsideOfPackage("..firebase..")
                .should().dependOnClassesThat().resideInAnyPackage("..module..");
        baselineRule.check(IMPORTED_CLASSES);
    }

    @Test
    void restControllersShouldResideInControllerPackage() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(RestController.class)
                .should().resideInAnyPackage("..Controller..", "..controller..", "..firebase..");
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void serviceBeansShouldResideInServicePackage() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(Service.class)
                .should().resideInAnyPackage("..Service..", "..service..", "..firebase..");
        rule.check(IMPORTED_CLASSES);
    }

    @Test
    void repositoryBeansShouldResideInRepositoryPackage() {
        ArchRule rule = classes()
                .that().areAnnotatedWith(Repository.class)
                .should().resideInAnyPackage("..Repository..", "..repository..");
        rule.check(IMPORTED_CLASSES);
    }

    private static final java.util.Set<String> ALLOWLIST = new java.util.HashSet<>();

    static {
        try {
            java.io.InputStream is = ArchitectureBaselineTest.class.getClassLoader()
                    .getResourceAsStream("archunit_baseline.txt");
            if (is != null) {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(is, java.nio.charset.StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (!line.isEmpty() && !line.startsWith("#")) {
                            ALLOWLIST.add(line);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private ArchCondition<JavaClass> notDependOnOtherModuleEntitiesOrRepositories() {
        return new ArchCondition<>("not depend on entity/repository packages of another module") {
            @Override
            public void check(JavaClass item, ConditionEvents events) {
                String sourceModule = extractModuleName(item.getPackageName());
                if (sourceModule == null) {
                    return;
                }

                for (Dependency dependency : item.getDirectDependenciesFromSelf()) {
                    String targetPackage = dependency.getTargetClass().getPackageName();
                    String targetModule = extractModuleName(targetPackage);

                    if (targetModule == null || sourceModule.equals(targetModule)) {
                        continue;
                    }
                    if (!isModuleEntityOrRepositoryPackage(targetPackage)) {
                        continue;
                    }

                    // Check if violation is allowlisted in baseline
                    String violationKey = String.format("%s -> %s", item.getFullName(), dependency.getTargetClass().getFullName());
                    if (ALLOWLIST.contains(violationKey)) {
                        continue;
                    }

                    String message = String.format(
                            "%s depends on %s from another module",
                            item.getFullName(),
                            dependency.getTargetClass().getFullName());
                    events.add(SimpleConditionEvent.violated(dependency, message));
                }
            }
        };
    }

    private String extractModuleName(String packageName) {
        String marker = ".module.";
        int moduleMarkerIndex = packageName.indexOf(marker);
        if (moduleMarkerIndex < 0) {
            return null;
        }

        String afterModule = packageName.substring(moduleMarkerIndex + marker.length());
        int nextDot = afterModule.indexOf('.');
        return nextDot >= 0 ? afterModule.substring(0, nextDot) : afterModule;
    }

    private boolean isModuleEntityOrRepositoryPackage(String packageName) {
        if (!packageName.contains(".module.")) {
            return false;
        }
        String[] segments = packageName.split("\\.");
        for (String segment : segments) {
            if ("entity".equals(segment) || "repository".equals(segment)) {
                return true;
            }
        }
        return false;
    }
}
