package org.example.QuanLyMuaVu.Config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class NewImportDbSchemaTest {

    private static final List<String> MARKETPLACE_IDENTITY_TABLES = List.of(
            "marketplace_products",
            "marketplace_carts",
            "marketplace_cart_items",
            "marketplace_order_groups",
            "marketplace_orders",
            "marketplace_order_items",
            "marketplace_addresses",
            "marketplace_product_reviews");

    @Test
    void marketplaceIdentityPrimaryKeys_ShouldAutoIncrementInDemoImportSchema() throws IOException {
        String sql = Files.readString(Path.of("newimportdb.sql"));

        for (String tableName : MARKETPLACE_IDENTITY_TABLES) {
            Pattern tableHasAutoIncrementId = Pattern.compile(
                    "CREATE TABLE\\s+"
                            + Pattern.quote(tableName)
                            + "\\s*\\([\\s\\S]*?id\\s+BIGINT\\s+NOT\\s+NULL\\s+AUTO_INCREMENT\\s+PRIMARY\\s+KEY",
                    Pattern.CASE_INSENSITIVE);

            assertThat(tableHasAutoIncrementId.matcher(sql).find())
                    .as("%s.id should be AUTO_INCREMENT in newimportdb.sql", tableName)
                    .isTrue();
        }
    }
}
