package org.example.QuanLyMuaVu.module.marketplace.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.example.QuanLyMuaVu.Config.AppProperties;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.admin.service.AuditLogService;
import org.example.QuanLyMuaVu.module.farm.repository.FarmRepository;
import org.example.QuanLyMuaVu.module.inventory.repository.ProductWarehouseLotRepository;
import org.example.QuanLyMuaVu.module.identity.entity.User;
import org.example.QuanLyMuaVu.module.incident.service.NotificationService;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceCreateOrderRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceFarmerProductUpsertRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceMergeCartRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceUpdateOrderStatusRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceUpdateProductStatusRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceCartResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceCreateOrderResultResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceProductDetailResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceOrderResponse;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceCart;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceCartItem;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceOrder;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceOrderGroup;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceOrderItem;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceProduct;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplacePaymentMethod;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceAddressRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceCartItemRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceCartRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderGroupRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductReviewRepository;
import org.example.QuanLyMuaVu.module.season.repository.SeasonRepository;
import org.example.QuanLyMuaVu.module.shared.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MarketplaceServiceTest {

    @Mock
    private MarketplaceProductRepository marketplaceProductRepository;

    @Mock
    private MarketplaceCartRepository marketplaceCartRepository;

    @Mock
    private MarketplaceCartItemRepository marketplaceCartItemRepository;

    @Mock
    private MarketplaceOrderGroupRepository marketplaceOrderGroupRepository;

    @Mock
    private MarketplaceOrderRepository marketplaceOrderRepository;

    @Mock
    private MarketplaceAddressRepository marketplaceAddressRepository;

    @Mock
    private MarketplaceProductReviewRepository marketplaceProductReviewRepository;

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private ProductWarehouseLotRepository productWarehouseLotRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private AppProperties appProperties;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MarketplaceService marketplaceService;

    private User buyer;
    private MarketplaceCart cart;
    private MarketplaceProduct product;

    @BeforeEach
    void setUp() {
        buyer = User.builder()
                .id(10L)
                .username("market-user")
                .fullName("Market User")
                .build();

        cart = MarketplaceCart.builder()
                .id(100L)
                .user(buyer)
                .build();

        product = MarketplaceProduct.builder()
                .id(200L)
                .slug("rice-bag")
                .name("Rice Bag")
                .price(new BigDecimal("100000"))
                .stockQuantity(10)
                .status(MarketplaceProductStatus.PUBLISHED)
                .traceable(false)
                .farmerUser(User.builder().id(20L).username("farmer-1").build())
                .build();

        lenient().when(marketplaceProductReviewRepository.findByOrder_IdAndBuyerUser_Id(anyLong(), anyLong()))
                .thenReturn(List.of());
    }

    @Nested
    @DisplayName("createOrder()")
    class CreateOrderTests {

        @Test
        @DisplayName("Throws MARKETPLACE_IDEMPOTENCY_KEY_REQUIRED when missing in both header and payload")
        void createOrder_MissingIdempotencyKey_ThrowsException() {
            when(currentUserService.getCurrentUser()).thenReturn(buyer);

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    null);

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.createOrder(request, null));
            assertEquals(ErrorCode.MARKETPLACE_IDEMPOTENCY_KEY_REQUIRED, ex.getErrorCode());
        }

        @Test
        @DisplayName("Throws MARKETPLACE_IDEMPOTENCY_CONFLICT when existing idempotency key has different fingerprint")
        void createOrder_IdempotencyConflict_ThrowsException() throws Exception {
            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));

            MarketplaceCartItem cartItem = MarketplaceCartItem.builder()
                    .id(1000L)
                    .cart(cart)
                    .product(product)
                    .quantity(2)
                    .unitPriceSnapshot(product.getPrice())
                    .build();
            when(marketplaceCartItemRepository.findByCartIdWithProductForUpdate(100L)).thenReturn(List.of(cartItem));

            when(marketplaceOrderGroupRepository.findByBuyerUser_IdAndIdempotencyKey(10L, "idem-123"))
                    .thenReturn(Optional.of(MarketplaceOrderGroup.builder()
                            .id(1L)
                            .groupCode("MOG-OLD")
                            .buyerUser(buyer)
                            .idempotencyKey("idem-123")
                            .requestFingerprint("fingerprint-old")
                            .build()));
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"k\":\"v\"}");

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    "idem-123");

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.createOrder(request, null));
            assertEquals(ErrorCode.MARKETPLACE_IDEMPOTENCY_CONFLICT, ex.getErrorCode());
        }

        @Test
        @DisplayName("Throws MARKETPLACE_CART_EMPTY when cart has no items")
        void createOrder_CartEmpty_ThrowsException() {
            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceCartItemRepository.findByCartIdWithProductForUpdate(100L)).thenReturn(List.of());

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    "idem-empty");

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.createOrder(request, null));
            assertEquals(ErrorCode.MARKETPLACE_CART_EMPTY, ex.getErrorCode());
        }

        @Test
        @DisplayName("Throws MARKETPLACE_STOCK_CONFLICT when stock is insufficient after lock")
        void createOrder_InsufficientStock_ThrowsException() throws Exception {
            MarketplaceProduct lowStockProduct = MarketplaceProduct.builder()
                    .id(200L)
                    .slug("rice-bag")
                    .name("Rice Bag")
                    .price(new BigDecimal("100000"))
                    .stockQuantity(1)
                    .status(MarketplaceProductStatus.PUBLISHED)
                    .traceable(false)
                    .farmerUser(User.builder().id(20L).username("farmer-1").build())
                    .build();

            MarketplaceCartItem cartItem = MarketplaceCartItem.builder()
                    .id(1000L)
                    .cart(cart)
                    .product(lowStockProduct)
                    .quantity(2)
                    .unitPriceSnapshot(lowStockProduct.getPrice())
                    .build();

            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceCartItemRepository.findByCartIdWithProductForUpdate(100L)).thenReturn(List.of(cartItem));
            when(marketplaceOrderGroupRepository.findByBuyerUser_IdAndIdempotencyKey(10L, "idem-stock"))
                    .thenReturn(Optional.empty());
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"k\":\"v\"}");
            when(marketplaceProductRepository.findAllByIdInForUpdate(List.of(200L))).thenReturn(List.of(lowStockProduct));

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    "idem-stock");

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.createOrder(request, null));
            assertEquals(ErrorCode.MARKETPLACE_STOCK_CONFLICT, ex.getErrorCode());
        }

        @Test
        @DisplayName("Splits order deterministically by farmer when cart has multi-farmer items")
        void createOrder_MultiFarmerSplit_Success() throws Exception {
            User farmer1 = User.builder().id(20L).username("farmer-1").build();
            User farmer2 = User.builder().id(21L).username("farmer-2").build();

            MarketplaceProduct productA = MarketplaceProduct.builder()
                    .id(200L)
                    .slug("rice-bag")
                    .name("Rice Bag")
                    .price(new BigDecimal("100000"))
                    .stockQuantity(10)
                    .status(MarketplaceProductStatus.PUBLISHED)
                    .traceable(false)
                    .farmerUser(farmer1)
                    .build();

            MarketplaceProduct productB = MarketplaceProduct.builder()
                    .id(201L)
                    .slug("tomato")
                    .name("Tomato")
                    .price(new BigDecimal("50000"))
                    .stockQuantity(20)
                    .status(MarketplaceProductStatus.PUBLISHED)
                    .traceable(false)
                    .farmerUser(farmer2)
                    .build();

            MarketplaceCartItem itemA = MarketplaceCartItem.builder()
                    .id(1L)
                    .cart(cart)
                    .product(productA)
                    .quantity(2)
                    .unitPriceSnapshot(productA.getPrice())
                    .build();

            MarketplaceCartItem itemB = MarketplaceCartItem.builder()
                    .id(2L)
                    .cart(cart)
                    .product(productB)
                    .quantity(1)
                    .unitPriceSnapshot(productB.getPrice())
                    .build();

            MarketplaceOrderGroup savedGroup = MarketplaceOrderGroup.builder()
                    .id(99L)
                    .groupCode("MOG-SPLIT")
                    .buyerUser(buyer)
                    .idempotencyKey("idem-split")
                    .requestFingerprint("fp")
                    .build();

            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceCartItemRepository.findByCartIdWithProductForUpdate(100L)).thenReturn(List.of(itemA, itemB));
            when(marketplaceOrderGroupRepository.findByBuyerUser_IdAndIdempotencyKey(10L, "idem-split"))
                    .thenReturn(Optional.empty());
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"k\":\"v\"}");
            when(marketplaceProductRepository.findAllByIdInForUpdate(List.of(200L, 201L)))
                    .thenReturn(List.of(productA, productB));
            when(marketplaceOrderGroupRepository.save(any(MarketplaceOrderGroup.class))).thenReturn(savedGroup);
            when(marketplaceOrderRepository.save(any(MarketplaceOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    "idem-split");

            MarketplaceCreateOrderResultResponse response = marketplaceService.createOrder(request, null);
            assertNotNull(response);
            assertEquals(2, response.splitCount());
            assertEquals(2, response.orders().size());
            assertEquals("MOG-SPLIT", response.orderGroupCode());
            verify(marketplaceCartItemRepository).deleteAllByCartId(100L);
        }

        @Test
        @DisplayName("Returns existing order group result for idempotency replay")
        void createOrder_IdempotencyReplay_ReturnsExistingResult() throws Exception {
            MarketplaceCartItem cartItem = MarketplaceCartItem.builder()
                    .id(1000L)
                    .cart(cart)
                    .product(product)
                    .quantity(1)
                    .unitPriceSnapshot(product.getPrice())
                    .build();

            MarketplaceOrderGroup existingGroup = MarketplaceOrderGroup.builder()
                    .id(7L)
                    .groupCode("MOG-REPLAY")
                    .buyerUser(buyer)
                    .idempotencyKey("idem-replay")
                    .requestFingerprint("666c1aa02e8068c6d5cc1d3295009432c16790bec28ec8ce119d0d1a18d61319")
                    .build();

            MarketplaceOrder existingOrder = MarketplaceOrder.builder()
                    .id(501L)
                    .orderGroup(existingGroup)
                    .orderCode("MO-REPLAY-1")
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .status(MarketplaceOrderStatus.PENDING)
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("100000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("120000"))
                    .items(List.of())
                    .build();

            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceCartItemRepository.findByCartIdWithProductForUpdate(100L)).thenReturn(List.of(cartItem));
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"k\":\"v\"}");
            when(marketplaceOrderGroupRepository.findByBuyerUser_IdAndIdempotencyKey(10L, "idem-replay"))
                    .thenReturn(Optional.of(existingGroup));
            when(marketplaceOrderRepository.findAllByOrderGroupIdWithItems(7L))
                    .thenReturn(List.of(existingOrder));

            MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                    MarketplacePaymentMethod.COD,
                    null,
                    "Buyer Name",
                    "0909000000",
                    "123 Road",
                    null,
                    "idem-replay");

            MarketplaceCreateOrderResultResponse response = marketplaceService.createOrder(request, null);
            assertEquals("MOG-REPLAY", response.orderGroupCode());
            assertEquals(1, response.orders().size());
        }
    }

    @Nested
    @DisplayName("mergeCart()")
    class MergeCartTests {

        @Test
        @DisplayName("Merges quantity with existing product and returns server cart")
        void mergeCart_MergeExistingItem_ReturnsMergedCart() {
            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceProductRepository.findById(200L)).thenReturn(Optional.of(product));

            MarketplaceCartItem existing = MarketplaceCartItem.builder()
                    .id(1001L)
                    .cart(cart)
                    .product(product)
                    .quantity(2)
                    .unitPriceSnapshot(product.getPrice())
                    .build();

            when(marketplaceCartItemRepository.findByCart_IdAndProduct_Id(100L, 200L)).thenReturn(Optional.of(existing));
            when(marketplaceCartItemRepository.save(any(MarketplaceCartItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MarketplaceCartItem updated = MarketplaceCartItem.builder()
                    .id(1001L)
                    .cart(cart)
                    .product(product)
                    .quantity(5)
                    .unitPriceSnapshot(product.getPrice())
                    .build();
            when(marketplaceCartItemRepository.findByCartIdWithProduct(100L)).thenReturn(List.of(updated));

            MarketplaceMergeCartRequest request = new MarketplaceMergeCartRequest(
                    List.of(new MarketplaceMergeCartRequest.MarketplaceMergeCartItem(200L, 3)));

            MarketplaceCartResponse response = marketplaceService.mergeCart(request);
            assertNotNull(response);
            assertEquals(5, response.itemCount());
            assertEquals(1, response.items().size());
            assertEquals(5, response.items().getFirst().quantity());
        }

        @Test
        @DisplayName("Throws MARKETPLACE_STOCK_CONFLICT when merged quantity exceeds stock")
        void mergeCart_ExceedStock_ThrowsException() {
            when(currentUserService.getCurrentUser()).thenReturn(buyer);
            when(marketplaceCartRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(cart));
            when(marketplaceProductRepository.findById(200L)).thenReturn(Optional.of(product));

            MarketplaceCartItem existing = MarketplaceCartItem.builder()
                    .id(1001L)
                    .cart(cart)
                    .product(product)
                    .quantity(8)
                    .unitPriceSnapshot(product.getPrice())
                    .build();
            when(marketplaceCartItemRepository.findByCart_IdAndProduct_Id(100L, 200L)).thenReturn(Optional.of(existing));

            MarketplaceMergeCartRequest request = new MarketplaceMergeCartRequest(
                    List.of(new MarketplaceMergeCartRequest.MarketplaceMergeCartItem(200L, 3)));

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.mergeCart(request));
            assertEquals(ErrorCode.MARKETPLACE_STOCK_CONFLICT, ex.getErrorCode());
        }
    }

    @Nested
    @DisplayName("cancelOrder()")
    class CancelOrderTests {

        @Test
        @DisplayName("Restores stock and marks order as cancelled for cancellable status")
        void cancelOrder_WithPendingStatus_RestoresStock() {
            when(currentUserService.getCurrentUserId()).thenReturn(10L);

            MarketplaceOrderGroup group = MarketplaceOrderGroup.builder().id(5L).groupCode("MOG-20260419-ABC").build();
            MarketplaceOrder order = MarketplaceOrder.builder()
                    .id(300L)
                    .orderGroup(group)
                    .status(MarketplaceOrderStatus.PENDING)
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("200000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("220000"))
                    .build();

            MarketplaceOrderItem orderItem = MarketplaceOrderItem.builder()
                    .id(1L)
                    .order(order)
                    .product(product)
                    .quantity(2)
                    .unitPriceSnapshot(new BigDecimal("100000"))
                    .lineTotal(new BigDecimal("200000"))
                    .traceableSnapshot(false)
                    .build();
            order.setItems(List.of(orderItem));

            when(marketplaceOrderRepository.findByIdAndBuyerUserIdWithItems(300L, 10L)).thenReturn(Optional.of(order));
            when(marketplaceProductRepository.findAllByIdInForUpdate(List.of(200L))).thenReturn(List.of(product));
            when(marketplaceOrderRepository.save(any(MarketplaceOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MarketplaceOrderResponse response = marketplaceService.cancelOrder(300L);

            assertEquals(MarketplaceOrderStatus.CANCELLED, response.status());
            assertEquals(12, product.getStockQuantity());
            verify(marketplaceProductRepository).saveAll(any());
            verify(marketplaceOrderRepository).save(order);
        }

        @Test
        @DisplayName("Rejects cancellation when order status is COMPLETED")
        void cancelOrder_InvalidStatus_ThrowsException() {
            when(currentUserService.getCurrentUserId()).thenReturn(10L);

            MarketplaceOrder order = MarketplaceOrder.builder()
                    .id(300L)
                    .status(MarketplaceOrderStatus.COMPLETED)
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("200000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("220000"))
                    .items(List.of())
                    .build();

            when(marketplaceOrderRepository.findByIdAndBuyerUserIdWithItems(300L, 10L)).thenReturn(Optional.of(order));

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.cancelOrder(300L));
            assertEquals(ErrorCode.MARKETPLACE_ORDER_CANCEL_NOT_ALLOWED, ex.getErrorCode());
        }
    }

    @Nested
    @DisplayName("updateFarmerOrderStatus()")
    class UpdateFarmerOrderStatusTests {

        @Test
        @DisplayName("Cancelling own order restores stock")
        void updateFarmerOrderStatus_Cancel_RestoresStock() {
            when(currentUserService.getCurrentUserId()).thenReturn(20L);

            MarketplaceOrder order = MarketplaceOrder.builder()
                    .id(301L)
                    .status(MarketplaceOrderStatus.CONFIRMED)
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("200000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("220000"))
                    .build();

            MarketplaceOrderItem orderItem = MarketplaceOrderItem.builder()
                    .id(2L)
                    .order(order)
                    .product(product)
                    .quantity(3)
                    .unitPriceSnapshot(new BigDecimal("100000"))
                    .lineTotal(new BigDecimal("300000"))
                    .traceableSnapshot(false)
                    .build();
            order.setItems(List.of(orderItem));

            when(marketplaceOrderRepository.findByIdAndFarmerUserIdWithItems(301L, 20L)).thenReturn(Optional.of(order));
            when(marketplaceProductRepository.findAllByIdInForUpdate(List.of(200L))).thenReturn(List.of(product));
            when(marketplaceOrderRepository.save(any(MarketplaceOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MarketplaceOrderResponse response = marketplaceService.updateFarmerOrderStatus(
                    301L,
                    new MarketplaceUpdateOrderStatusRequest(MarketplaceOrderStatus.CANCELLED));

            assertEquals(MarketplaceOrderStatus.CANCELLED, response.status());
            assertEquals(13, product.getStockQuantity());
            verify(marketplaceProductRepository).saveAll(any());
        }

        @Test
        @DisplayName("Invalid transition throws BAD_REQUEST")
        void updateFarmerOrderStatus_InvalidTransition_ThrowsBadRequest() {
            when(currentUserService.getCurrentUserId()).thenReturn(20L);

            MarketplaceOrder order = MarketplaceOrder.builder()
                    .id(302L)
                    .status(MarketplaceOrderStatus.PENDING)
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("100000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("120000"))
                    .items(List.of())
                    .build();

            when(marketplaceOrderRepository.findByIdAndFarmerUserIdWithItems(302L, 20L)).thenReturn(Optional.of(order));

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.updateFarmerOrderStatus(
                    302L,
                    new MarketplaceUpdateOrderStatusRequest(MarketplaceOrderStatus.DELIVERING)));
            assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        }

        @Test
        @DisplayName("Valid transition PENDING -> CONFIRMED passes")
        void updateFarmerOrderStatus_ValidTransition_Passes() {
            when(currentUserService.getCurrentUserId()).thenReturn(20L);

            MarketplaceOrder order = MarketplaceOrder.builder()
                    .id(303L)
                    .status(MarketplaceOrderStatus.PENDING)
                    .buyerUser(buyer)
                    .farmerUser(User.builder().id(20L).build())
                    .paymentMethod(MarketplacePaymentMethod.COD)
                    .shippingRecipientName("Buyer")
                    .shippingPhone("0909000000")
                    .shippingAddressLine("123 Road")
                    .subtotal(new BigDecimal("100000"))
                    .shippingFee(new BigDecimal("20000"))
                    .totalAmount(new BigDecimal("120000"))
                    .items(List.of())
                    .build();

            when(marketplaceOrderRepository.findByIdAndFarmerUserIdWithItems(303L, 20L)).thenReturn(Optional.of(order));
            when(marketplaceOrderRepository.save(any(MarketplaceOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MarketplaceOrderResponse response = marketplaceService.updateFarmerOrderStatus(
                    303L,
                    new MarketplaceUpdateOrderStatusRequest(MarketplaceOrderStatus.CONFIRMED));
            assertEquals(MarketplaceOrderStatus.CONFIRMED, response.status());
        }
    }

    @Nested
    @DisplayName("seller ownership")
    class SellerOwnershipTests {

        @Test
        @DisplayName("Farmer cannot update product owned by another farmer")
        void updateFarmerProduct_NotOwner_ThrowsNotOwner() {
            when(currentUserService.getCurrentUserId()).thenReturn(20L);
            MarketplaceProduct otherFarmerProduct = MarketplaceProduct.builder()
                    .id(900L)
                    .slug("other-product")
                    .name("Other Product")
                    .price(new BigDecimal("10000"))
                    .unit("kg")
                    .stockQuantity(5)
                    .status(MarketplaceProductStatus.DRAFT)
                    .traceable(false)
                    .farmerUser(User.builder().id(99L).build())
                    .build();
            when(marketplaceProductRepository.findById(900L)).thenReturn(Optional.of(otherFarmerProduct));

            MarketplaceFarmerProductUpsertRequest request = new MarketplaceFarmerProductUpsertRequest(
                    "Updated",
                    "Vegetable",
                    "short",
                    "desc",
                    new BigDecimal("12000"),
                    "kg",
                    10,
                    null,
                    null,
                    1,
                    null,
                    null,
                    false);

            AppException ex = assertThrows(AppException.class, () -> marketplaceService.updateFarmerProduct(900L, request));
            assertEquals(ErrorCode.NOT_OWNER, ex.getErrorCode());
        }
    }

    @Nested
    @DisplayName("admin moderation")
    class AdminModerationTests {

        @Test
        @DisplayName("Admin can publish pending-review product")
        void updateAdminProductStatus_PublishPendingReview_Success() {
            MarketplaceProduct pendingProduct = MarketplaceProduct.builder()
                    .id(777L)
                    .slug("pending-product")
                    .name("Pending Product")
                    .price(new BigDecimal("30000"))
                    .unit("kg")
                    .stockQuantity(9)
                    .status(MarketplaceProductStatus.PENDING_REVIEW)
                    .traceable(false)
                    .farmerUser(User.builder().id(20L).build())
                    .build();

            when(marketplaceProductRepository.findById(777L)).thenReturn(Optional.of(pendingProduct));
            when(marketplaceProductRepository.save(any(MarketplaceProduct.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(marketplaceProductReviewRepository.aggregateRatingsByProductIds(List.of(777L))).thenReturn(List.of());

            MarketplaceProductDetailResponse response = marketplaceService.updateAdminProductStatus(
                    777L,
                    new MarketplaceUpdateProductStatusRequest(MarketplaceProductStatus.PUBLISHED));

            assertEquals(MarketplaceProductStatus.PUBLISHED, response.status());
            assertNotNull(pendingProduct.getPublishedAt());
        }
    }
}
