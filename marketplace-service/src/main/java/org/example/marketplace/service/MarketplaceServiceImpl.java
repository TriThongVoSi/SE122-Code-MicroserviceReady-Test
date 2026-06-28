package org.example.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.marketplace.client.FarmClient;
import org.example.marketplace.client.IdentityClient;
import org.example.marketplace.client.InventoryClient;
import org.example.marketplace.client.SeasonClient;
import org.example.marketplace.dto.client.FarmDetailDto;
import org.example.marketplace.dto.client.FarmSummaryDto;
import org.example.marketplace.dto.request.MarketplaceAddCartItemRequest;
import org.example.marketplace.dto.request.MarketplaceAddressUpsertRequest;
import org.example.marketplace.dto.request.MarketplaceCreateOrderRequest;
import org.example.marketplace.dto.request.MarketplaceCreateReviewRequest;
import org.example.marketplace.dto.request.MarketplaceFarmerProductUpsertRequest;
import org.example.marketplace.dto.request.MarketplaceMergeCartRequest;
import org.example.marketplace.dto.request.MarketplaceRejectPaymentProofRequest;
import org.example.marketplace.dto.request.MarketplaceUpdateCartItemRequest;
import org.example.marketplace.dto.request.MarketplaceUpdateOrderStatusRequest;
import org.example.marketplace.dto.request.MarketplaceUpdatePaymentVerificationRequest;
import org.example.marketplace.dto.request.MarketplaceUpdateProductStatusRequest;
import org.example.marketplace.dto.request.MarketplaceUpdateReviewRequest;
import org.example.marketplace.dto.response.MarketplaceAdminStatsResponse;
import org.example.marketplace.dto.response.MarketplaceAddressResponse;
import org.example.marketplace.dto.response.MarketplaceCartResponse;
import org.example.marketplace.dto.response.MarketplaceCreateOrderResultResponse;
import org.example.marketplace.dto.response.MarketplaceFarmerDashboardResponse;
import org.example.marketplace.dto.response.MarketplaceFarmerProductFormFarmOptionResponse;
import org.example.marketplace.dto.response.MarketplaceFarmerProductFormLotOptionResponse;
import org.example.marketplace.dto.response.MarketplaceFarmerProductFormOptionsResponse;
import org.example.marketplace.dto.response.MarketplaceFarmerProductFormSeasonOptionResponse;
import org.example.marketplace.dto.response.MarketplaceFarmDetailResponse;
import org.example.marketplace.dto.response.MarketplaceFarmSummaryResponse;
import org.example.marketplace.dto.response.MarketplaceOrderAuditLogResponse;
import org.example.marketplace.dto.response.MarketplaceOrderItemResponse;
import org.example.marketplace.dto.response.MarketplaceOrderPaymentResponse;
import org.example.marketplace.dto.response.MarketplaceOrderPreviewResponse;
import org.example.marketplace.dto.response.MarketplaceOrderResponse;
import org.example.marketplace.dto.response.MarketplacePaymentProofResponse;
import org.example.marketplace.dto.response.MarketplaceProductDetailResponse;
import org.example.marketplace.dto.response.MarketplaceProductSummaryResponse;
import org.example.marketplace.dto.response.MarketplaceReviewResponse;
import org.example.marketplace.dto.response.MarketplaceTraceabilityResponse;
import org.example.marketplace.entity.MarketplaceAddress;
import org.example.marketplace.entity.MarketplaceCart;
import org.example.marketplace.entity.MarketplaceCartItem;
import org.example.marketplace.entity.MarketplaceOrder;
import org.example.marketplace.entity.MarketplaceOrderGroup;
import org.example.marketplace.entity.MarketplaceOrderItem;
import org.example.marketplace.entity.MarketplaceProduct;
import org.example.marketplace.entity.MarketplaceProductReview;
import org.example.marketplace.event.DomainEventPublisher;
import org.example.marketplace.event.MarketplaceOrderCancelledEvent;
import org.example.marketplace.event.MarketplaceOrderCompletedEvent;
import org.example.marketplace.event.MarketplaceOrderCreatedEvent;
import org.example.marketplace.event.MarketplacePaymentSubmittedEvent;
import org.example.marketplace.event.MarketplacePaymentVerifiedEvent;
import org.example.marketplace.model.MarketplaceOrderStatus;
import org.example.marketplace.model.MarketplacePaymentMethod;
import org.example.marketplace.model.MarketplacePaymentVerificationStatus;
import org.example.marketplace.model.MarketplaceProductStatus;
import org.example.marketplace.repository.MarketplaceAddressRepository;
import java.util.Comparator;
import org.example.marketplace.repository.MarketplaceCartItemRepository;
import org.example.marketplace.repository.MarketplaceCartRepository;
import org.example.marketplace.repository.MarketplaceOrderGroupRepository;
import org.example.marketplace.repository.MarketplaceOrderItemRepository;
import org.example.marketplace.repository.MarketplaceOrderRepository;
import org.example.marketplace.repository.MarketplaceProductRepository;
import org.example.marketplace.repository.MarketplaceProductReviewRepository;
import org.example.marketplace.shared.security.CurrentUserService;
import org.example.DTO.Common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    static final BigDecimal DEFAULT_SHIPPING_FEE = new BigDecimal("20000");
    static final String CURRENCY_VND = "VND";
    static final BigDecimal LOW_STOCK_THRESHOLD = new BigDecimal("10");
    static final BigDecimal ZERO_QUANTITY = BigDecimal.ZERO;

    MarketplaceProductRepository marketplaceProductRepository;
    MarketplaceCartRepository marketplaceCartRepository;
    MarketplaceCartItemRepository marketplaceCartItemRepository;
    MarketplaceOrderGroupRepository marketplaceOrderGroupRepository;
    MarketplaceOrderItemRepository marketplaceOrderItemRepository;
    MarketplaceOrderRepository marketplaceOrderRepository;
    MarketplaceAddressRepository marketplaceAddressRepository;
    MarketplaceProductReviewRepository marketplaceProductReviewRepository;
    FarmClient farmClient;
    SeasonClient seasonClient;
    InventoryClient inventoryClient;
    IdentityClient identityClient;
    CurrentUserService currentUserService;
    ObjectMapper objectMapper;
    IdempotencyService idempotencyService;
    MarketplaceStorageService storageService;
    DomainEventPublisher domainEventPublisher;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceProductSummaryResponse> listProducts(
            String category, String q, String region, Boolean traceable,
            BigDecimal minPrice, BigDecimal maxPrice, String sort,
            Integer farmId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceProduct> productPage = marketplaceProductRepository.findPublishedProducts(
                category, q, region, traceable, minPrice, maxPrice, farmId, pageable);

        List<MarketplaceProductSummaryResponse> items = productPage.getContent().stream()
                .map(this::toProductSummary)
                .toList();

        return PageResponse.of(productPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceProductDetailResponse getProductBySlug(String slug) {
        MarketplaceProduct product = marketplaceProductRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDetail(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceReviewResponse> listProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceProductReview> reviewPage = marketplaceProductReviewRepository.findByProductId(productId, pageable);
        List<MarketplaceReviewResponse> items = reviewPage.getContent().stream()
                .map(this::toReviewResponse)
                .toList();
        return PageResponse.of(reviewPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceFarmSummaryResponse> listFarms(String q, String region, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        // TODO: Implement via FarmClient - fetch farms and map to response
        List<MarketplaceFarmSummaryResponse> items = List.of();
        return new PageResponse<>(items, page, size, 0, 0, false, false);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceFarmDetailResponse getFarmDetail(Integer farmId) {
        // TODO: Implement via FarmClient
        FarmDetailDto farmDetail = farmClient.getFarmDetail(farmId);
        if (farmDetail == null) {
            throw new RuntimeException("Farm not found");
        }
        return new MarketplaceFarmDetailResponse(
                farmDetail.id(),
                farmDetail.name(),
                farmDetail.region(),
                null,
                farmDetail.coverImageUrl(),
                0L,
                farmDetail.active(),
                farmDetail.averageRating(),
                farmDetail.ratingCount(),
                false,
                null,
                farmDetail.ownerUserId(),
                farmDetail.ownerName(),
                farmDetail.ownerPhone());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceReviewResponse> listFarmReviews(Integer farmId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceProductReview> reviewPage = marketplaceProductReviewRepository.findByFarmId(farmId, pageable);
        List<MarketplaceReviewResponse> items = reviewPage.getContent().stream()
                .map(this::toReviewResponse)
                .toList();
        return PageResponse.of(reviewPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceTraceabilityResponse getTraceability(Long productId) {
        MarketplaceProduct product = marketplaceProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return buildTraceabilityResponse(product, null);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceTraceabilityResponse getOrderItemTraceability(Long orderId, Long itemId) {
        Long userId = currentUserService.getCurrentUserId();

        // Verify access to the order
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndBuyerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Get the order item
        MarketplaceOrderItem item = marketplaceOrderItemRepository.findByIdAndOrderId(itemId, orderId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        return buildTraceabilityResponse(null, item);
    }

    @Override
    @Transactional
    public MarketplaceReviewResponse createReview(Long orderId, MarketplaceCreateReviewRequest request) {
        // TODO: Implement full review creation logic
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public MarketplaceReviewResponse createReviewLegacy(MarketplaceCreateReviewRequest request) {
        return createReview(null, request);
    }

    @Override
    @Transactional
    public MarketplaceReviewResponse editReview(Long reviewId, MarketplaceUpdateReviewRequest request) {
        MarketplaceProductReview review = marketplaceProductReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        Long userId = currentUserService.getCurrentUserId();
        if (!Objects.equals(review.getBuyerUserId(), userId)) {
            throw new RuntimeException("Forbidden");
        }

        if (request.rating() != null) {
            review.setRating(request.rating());
        }
        if (request.comment() != null) {
            review.setComment(request.comment());
        }

        review = marketplaceProductReviewRepository.save(review);
        return toReviewResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        MarketplaceProductReview review = marketplaceProductReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        Long userId = currentUserService.getCurrentUserId();
        if (!Objects.equals(review.getBuyerUserId(), userId)) {
            throw new RuntimeException("Forbidden");
        }

        marketplaceProductReviewRepository.delete(review);
    }

    @Override
    @Transactional
    public MarketplaceReviewResponse adminHideReview(Long reviewId) {
        MarketplaceProductReview review = marketplaceProductReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setHidden(true);
        review = marketplaceProductReviewRepository.save(review);
        return toReviewResponse(review);
    }

    @Override
    @Transactional
    public void adminDeleteReview(Long reviewId) {
        marketplaceProductReviewRepository.deleteById(reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceCartResponse getCart() {
        Long userId = currentUserService.getCurrentUserId();
        Optional<MarketplaceCart> cartOpt = marketplaceCartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            return emptyCart(userId);
        }
        return buildCartResponse(userId, cartOpt.get());
    }

    @Override
    @Transactional
    public MarketplaceCartResponse addCartItem(MarketplaceAddCartItemRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceCart cart = getOrCreateCart(userId);

        MarketplaceProduct product = marketplaceProductRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<MarketplaceCartItem> existingItem = marketplaceCartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            MarketplaceCartItem item = existingItem.get();
            item.setQuantity(item.getQuantity().add(request.quantity()));
            marketplaceCartItemRepository.save(item);
        } else {
            MarketplaceCartItem item = MarketplaceCartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .unitPriceSnapshot(product.getPrice())
                    .build();
            marketplaceCartItemRepository.save(item);
        }

        return buildCartResponse(userId, cart);
    }

    @Override
    @Transactional
    public MarketplaceCartResponse updateCartItem(Long productId, MarketplaceUpdateCartItemRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceCart cart = marketplaceCartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        MarketplaceCartItem item = marketplaceCartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        item.setQuantity(request.quantity());
        marketplaceCartItemRepository.save(item);

        return buildCartResponse(userId, cart);
    }

    @Override
    @Transactional
    public MarketplaceCartResponse removeCartItem(Long productId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceCart cart = marketplaceCartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        marketplaceCartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);

        return buildCartResponse(userId, cart);
    }

    @Override
    @Transactional
    public MarketplaceCartResponse mergeCart(MarketplaceMergeCartRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceCart cart = getOrCreateCart(userId);

        for (MarketplaceMergeCartRequest.MarketplaceMergeCartItem mergeItem : request.items()) {
            MarketplaceProduct product = marketplaceProductRepository.findById(mergeItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Optional<MarketplaceCartItem> existingItem = marketplaceCartItemRepository
                    .findByCartIdAndProductId(cart.getId(), product.getId());

            if (existingItem.isPresent()) {
                MarketplaceCartItem item = existingItem.get();
                item.setQuantity(item.getQuantity().add(mergeItem.quantity()));
                marketplaceCartItemRepository.save(item);
            } else {
                MarketplaceCartItem item = MarketplaceCartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(mergeItem.quantity())
                        .unitPriceSnapshot(product.getPrice())
                        .build();
                marketplaceCartItemRepository.save(item);
            }
        }

        return buildCartResponse(userId, cart);
    }

    @Override
    @Transactional
    public MarketplaceCartResponse clearCart() {
        Long userId = currentUserService.getCurrentUserId();
        Optional<MarketplaceCart> cartOpt = marketplaceCartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            marketplaceCartItemRepository.deleteAllByCartId(cartOpt.get().getId());
        }
        return emptyCart(userId);
    }

    @Override
    @Transactional
    public MarketplaceOrderPreviewResponse previewOrder(MarketplaceCreateOrderRequest request) {
        // TODO: Implement full preview logic
        return new MarketplaceOrderPreviewResponse(
                List.of(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                null, null, null,
                0,
                CURRENCY_VND);
    }

    @Override
    @Transactional
    public MarketplaceCreateOrderResultResponse createOrder(MarketplaceCreateOrderRequest request, String idempotencyKey) {
        // Validate idempotency key
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new RuntimeException("X-Idempotency-Key header is required for checkout");
        }

        String endpoint = "/api/v1/marketplace/orders";

        // Check if we've already processed this request
        var existingResponse = idempotencyService.getExistingResponse(
                idempotencyKey, endpoint, MarketplaceCreateOrderResultResponse.class);
        if (existingResponse.isPresent()) {
            log.info("Returning cached response for idempotency key: {}", idempotencyKey);
            return existingResponse.get();
        }

        // Try to acquire lock for this idempotency key
        if (!idempotencyService.tryAcquireLock(idempotencyKey, endpoint)) {
            throw new RuntimeException("Order is already being processed. Please wait and try again.");
        }

        try {
            return processCreateOrder(request, idempotencyKey);
        } catch (Exception e) {
            log.error("Failed to create order with idempotency key: {}", idempotencyKey, e);
            throw e;
        }
    }

    private MarketplaceCreateOrderResultResponse processCreateOrder(MarketplaceCreateOrderRequest request, String idempotencyKey) {
        final String endpoint = "/api/v1/marketplace/orders";
        Long buyerUserId = currentUserService.getCurrentUserId();

        // 1. Get cart items and group by farmer
        MarketplaceCart cart = marketplaceCartRepository.findByUserIdWithItems(buyerUserId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<MarketplaceCartItem> cartItems = cart.getItems();
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 2. Group items by farmer
        Map<Long, List<MarketplaceCartItem>> itemsByFarmer = cartItems.stream()
                .collect(java.util.stream.Collectors.groupingBy(MarketplaceCartItem::getFarmerUserId));

        // 3. Reserve stock in inventory service for all items
        List<InventoryClient.ReserveItem> reserveItems = cartItems.stream()
                .map(item -> new InventoryClient.ReserveItem(
                        item.getId(),
                        item.getLotId(),
                        item.getLotCode(),
                        item.getQuantity(),
                        item.getProduct().getUnit()))
                .toList();

        InventoryClient.ReservationResult reserveResult = inventoryClient.reserveStock(
                idempotencyKey + "-reserve",
                null, // orderId not known yet
                reserveItems);

        if (!reserveResult.success()) {
            throw new RuntimeException("Failed to reserve stock: " + reserveResult.message());
        }

        // 4. Create order group
        String groupCode = "OG-" + System.currentTimeMillis() + "-" + buyerUserId;
        MarketplaceOrderGroup orderGroup = MarketplaceOrderGroup.builder()
                .groupCode(groupCode)
                .buyerUserId(buyerUserId)
                .idempotencyKey(idempotencyKey)
                .requestFingerprint(request.toString().hashCode() + "-" + buyerUserId)
                .totalAmount(BigDecimal.ZERO)
                .status("PENDING")
                .build();
        MarketplaceOrderGroup savedOrderGroup = marketplaceOrderGroupRepository.save(orderGroup);

        Long orderGroupId = savedOrderGroup.getId();

        // 5. Create orders and order items per farmer
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<MarketplaceOrder> createdOrders = new ArrayList<>();

        for (Map.Entry<Long, List<MarketplaceCartItem>> farmerEntry : itemsByFarmer.entrySet()) {
            Long farmerUserId = farmerEntry.getKey();
            List<MarketplaceCartItem> farmerItems = farmerEntry.getValue();

            // Create order for this farmer
            MarketplaceOrder order = MarketplaceOrder.builder()
                    .orderGroupId(orderGroupId)
                    .buyerUserId(buyerUserId)
                    .farmerUserId(farmerUserId)
                    .status(MarketplaceOrderStatus.PAYMENT_SUBMITTED)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
            order = marketplaceOrderRepository.save(order);

            BigDecimal orderTotal = BigDecimal.ZERO;

            for (MarketplaceCartItem cartItem : farmerItems) {
                MarketplaceProduct product = cartItem.getProduct();
                BigDecimal lineTotal = product.getPrice().multiply(cartItem.getQuantity());

                // Create order item
                MarketplaceOrderItem orderItem = MarketplaceOrderItem.builder()
                        .order(order)
                        .productId(product.getId())
                        .farmerUserId(farmerUserId)
                        .productNameSnapshot(product.getName())
                        .productSlugSnapshot(product.getSlug())
                        .imageUrlSnapshot(product.getImageUrl())
                        .unitPriceSnapshot(product.getPrice())
                        .quantity(cartItem.getQuantity())
                        .lineTotal(lineTotal)
                        .traceableSnapshot(product.getLotId() != null)
                        .farmId(product.getFarmId())
                        .seasonId(product.getSeasonId())
                        .lotId(product.getLotId())
                        .farmName(product.getFarmName())
                        .seasonName(product.getSeasonName())
                        .lotCode(product.getLotCode())
                        .cropName(product.getName())
                        .publishedAtSnapshot(LocalDateTime.now())
                        .build();
                marketplaceOrderItemRepository.save(orderItem);

                orderTotal = orderTotal.add(lineTotal);
            }

            order.setTotalAmount(orderTotal);
            marketplaceOrderRepository.save(order);
            createdOrders.add(order);
            totalAmount = totalAmount.add(orderTotal);
        }

        // 6. Update order group total
        savedOrderGroup.setTotalAmount(totalAmount);
        marketplaceOrderGroupRepository.save(savedOrderGroup);

        // 7. Clear the cart
        marketplaceCartItemRepository.deleteAll(cartItems);
        cart.setItems(new ArrayList<>());
        marketplaceCartRepository.save(cart);

        // 8. Record the successful response for idempotency
        MarketplaceCreateOrderResultResponse result = new MarketplaceCreateOrderResultResponse(
                orderGroupId,
                createdOrders.stream().map(MarketplaceOrder::getId).toList(),
                totalAmount,
                CURRENCY_VND,
                "Order created successfully. Please complete payment.",
                null);

        idempotencyService.recordResponse(idempotencyKey, endpoint, result, 200);

        // 9. Publish OrderCreated events for each order
        for (MarketplaceOrder order : createdOrders) {
            List<MarketplaceOrderItem> items = marketplaceOrderItemRepository.findByOrderId(order.getId());
            publishOrderCreatedEvent(order, items);
        }

        return result;
    }

    private void publishOrderCreatedEvent(MarketplaceOrder order, List<MarketplaceOrderItem> items) {
        List<MarketplaceOrderCreatedEvent.OrderItemPayload> itemPayloads = items.stream()
                .map(item -> new MarketplaceOrderCreatedEvent.OrderItemPayload(
                        item.getId(),
                        item.getProductId(),
                        item.getProductNameSnapshot(),
                        item.getLotCode(),
                        item.getFarmId(),
                        item.getFarmName(),
                        item.getSeasonId(),
                        item.getSeasonName(),
                        item.getQuantity().intValue()
                ))
                .toList();

        MarketplaceOrderCreatedEvent event = new MarketplaceOrderCreatedEvent(
                java.util.UUID.randomUUID().toString(),
                "MarketplaceOrder",
                order.getId().toString(),
                LocalDateTime.now(),
                new MarketplaceOrderCreatedEvent.Payload(
                        order.getOrderGroupId(),
                        order.getId(),
                        order.getBuyerUserId(),
                        order.getFarmerUserId(),
                        order.getStatus().name(),
                        itemPayloads
                )
        );
        domainEventPublisher.publish(event);
    }

    @Override
    @Transactional
    public MarketplaceOrderResponse uploadPaymentProof(Long orderId, MultipartFile file) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndBuyerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Upload payment proof to MinIO
        String paymentProofUrl = storageService.storePaymentProof(file, orderId, userId);

        // Update order with payment proof info
        order.setPaymentProofFileName(file.getOriginalFilename());
        order.setPaymentProofContentType(file.getContentType());
        order.setPaymentProofStoragePath(paymentProofUrl);
        order.setPaymentProofUploadedAt(LocalDateTime.now());
        order = marketplaceOrderRepository.save(order);

        // Publish PaymentSubmitted event
        publishPaymentSubmittedEvent(order, paymentProofUrl);

        return toOrderResponse(order);
    }

    private void publishPaymentSubmittedEvent(MarketplaceOrder order, String paymentProofUrl) {
        MarketplacePaymentSubmittedEvent event = new MarketplacePaymentSubmittedEvent(
                java.util.UUID.randomUUID().toString(),
                "MarketplaceOrder",
                order.getId().toString(),
                LocalDateTime.now(),
                new MarketplacePaymentSubmittedEvent.Payload(
                        order.getId(),
                        order.getBuyerUserId(),
                        order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "TRANSFER",
                        paymentProofUrl
                )
        );
        domainEventPublisher.publish(event);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceOrderResponse> listOrders(String status, int page, int size) {
        Long userId = currentUserService.getCurrentUserId();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MarketplaceOrder> orderPage = marketplaceOrderRepository.findByBuyerUserId(userId, pageable);

        List<MarketplaceOrderResponse> items = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .toList();

        return PageResponse.of(orderPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceOrderResponse getOrderDetail(Long orderId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndBuyerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public MarketplaceOrderResponse cancelOrder(Long orderId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndBuyerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Release inventory reservations for this order
        InventoryClient.ReservationResult releaseResult = inventoryClient.releaseReservation(
                orderId, "Order cancelled by buyer");
        if (!releaseResult.success()) {
            log.warn("Failed to release inventory reservations for order {}: {}", orderId, releaseResult.message());
        }

        order.setStatus(MarketplaceOrderStatus.CANCELLED);
        order = marketplaceOrderRepository.save(order);

        // Publish OrderCancelled event
        publishOrderCancelledEvent(order, userId, "Cancelled by buyer");

        return toOrderResponse(order);
    }

    private void publishOrderCancelledEvent(MarketplaceOrder order, Long cancelledByUserId, String reason) {
        MarketplaceOrderCancelledEvent event = new MarketplaceOrderCancelledEvent(
                java.util.UUID.randomUUID().toString(),
                "MarketplaceOrder",
                order.getId().toString(),
                LocalDateTime.now(),
                new MarketplaceOrderCancelledEvent.Payload(
                        order.getId(),
                        order.getOrderGroupId(),
                        order.getBuyerUserId(),
                        cancelledByUserId,
                        reason
                )
        );
        domainEventPublisher.publish(event);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceOrderResponse> listFarmerOrders(MarketplaceOrderStatus status, int page, int size) {
        Long userId = currentUserService.getCurrentUserId();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MarketplaceOrder> orderPage = marketplaceOrderRepository.findByFarmerUserId(userId, pageable);

        List<MarketplaceOrderResponse> items = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .toList();

        return PageResponse.of(orderPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceOrderResponse getFarmerOrderDetail(Long orderId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndFarmerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public MarketplaceOrderResponse updateFarmerOrderStatus(Long orderId, MarketplaceUpdateOrderStatusRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndFarmerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(request.status());
        order = marketplaceOrderRepository.save(order);

        // Confirm inventory stock-out when order is confirmed/completed
        if (request.status() == MarketplaceOrderStatus.CONFIRMED ||
            request.status() == MarketplaceOrderStatus.COMPLETED) {
            InventoryClient.ReservationResult confirmResult = inventoryClient.confirmStockOut(
                    orderId, "Order " + request.status().name().toLowerCase() + " by farmer");
            if (!confirmResult.success()) {
                log.warn("Failed to confirm stock-out for order {}: {}", orderId, confirmResult.message());
            }
        }

        // Publish OrderCompleted event
        if (request.status() == MarketplaceOrderStatus.COMPLETED) {
            publishOrderCompletedEvent(order);
        }

        return toOrderResponse(order);
    }

    private void publishOrderCompletedEvent(MarketplaceOrder order) {
        MarketplaceOrderCompletedEvent event = new MarketplaceOrderCompletedEvent(
                java.util.UUID.randomUUID().toString(),
                "MarketplaceOrder",
                order.getId().toString(),
                LocalDateTime.now(),
                new MarketplaceOrderCompletedEvent.Payload(
                        order.getId(),
                        order.getOrderGroupId(),
                        order.getBuyerUserId(),
                        order.getFarmerUserId(),
                        LocalDateTime.now().toString()
                )
        );
        domainEventPublisher.publish(event);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceOrderResponse> listAdminOrders(MarketplaceOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MarketplaceOrder> orderPage = marketplaceOrderRepository.findAll(pageable);

        List<MarketplaceOrderResponse> items = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .toList();

        return PageResponse.of(orderPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceOrderResponse getAdminOrderDetail(Long orderId) {
        MarketplaceOrder order = marketplaceOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public MarketplaceOrderResponse updateAdminOrderStatus(Long orderId, MarketplaceUpdateOrderStatusRequest request) {
        MarketplaceOrder order = marketplaceOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(request.status());
        order = marketplaceOrderRepository.save(order);

        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public MarketplaceOrderResponse updateAdminPaymentVerification(Long orderId, MarketplaceUpdatePaymentVerificationRequest request) {
        MarketplaceOrder order = marketplaceOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentVerificationStatus(request.verificationStatus());
        if (request.verificationNote() != null) {
            order.setPaymentVerificationNote(request.verificationNote());
        }
        order = marketplaceOrderRepository.save(order);

        return toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketplaceOrderAuditLogResponse> listOrderAuditLogs(Long orderId) {
        // TODO: Implement audit log retrieval
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceAdminStatsResponse getAdminStats() {
        // TODO: Implement full stats calculation
        return new MarketplaceAdminStatsResponse(
                0L, 0L, 0L, 0L,
                0L, 0L, 0L, 0L, 0L,
                BigDecimal.ZERO,
                false, false, false,
                null,
                List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplacePaymentProofResponse> listAdminPaymentProofs(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceOrder> orderPage = marketplaceOrderRepository.findByPaymentVerificationStatus(
                MarketplacePaymentVerificationStatus.SUBMITTED, pageable);

        List<MarketplacePaymentProofResponse> items = orderPage.getContent().stream()
                .map(this::toPaymentProofResponse)
                .toList();

        return PageResponse.of(orderPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplacePaymentProofResponse getPaymentProof(Long orderId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceOrder order = marketplaceOrderRepository.findByIdAndBuyerUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toPaymentProofResponse(order);
    }

    @Override
    @Transactional
    public MarketplacePaymentProofResponse verifyAdminPaymentProof(Long orderId) {
        MarketplaceOrder order = marketplaceOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentVerificationStatus(MarketplacePaymentVerificationStatus.VERIFIED);
        order = marketplaceOrderRepository.save(order);

        // Publish PaymentVerified event
        publishPaymentVerifiedEvent(order, currentUserService.getCurrentUserId());

        return toPaymentProofResponse(order);
    }

    private void publishPaymentVerifiedEvent(MarketplaceOrder order, Long verifiedByUserId) {
        MarketplacePaymentVerifiedEvent event = new MarketplacePaymentVerifiedEvent(
                java.util.UUID.randomUUID().toString(),
                "MarketplaceOrder",
                order.getId().toString(),
                LocalDateTime.now(),
                new MarketplacePaymentVerifiedEvent.Payload(
                        order.getId(),
                        order.getBuyerUserId(),
                        verifiedByUserId,
                        "VERIFIED"
                )
        );
        domainEventPublisher.publish(event);
    }

    @Override
    @Transactional
    public MarketplacePaymentProofResponse rejectAdminPaymentProof(Long orderId, MarketplaceRejectPaymentProofRequest request) {
        MarketplaceOrder order = marketplaceOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentVerificationStatus(MarketplacePaymentVerificationStatus.REJECTED);
        order.setPaymentVerificationNote(request.reason());
        order = marketplaceOrderRepository.save(order);
        return toPaymentProofResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketplaceAddressResponse> listAddresses() {
        Long userId = currentUserService.getCurrentUserId();
        List<MarketplaceAddress> addresses = marketplaceAddressRepository.findByUserId(userId);
        return addresses.stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Override
    @Transactional
    public MarketplaceAddressResponse createAddress(MarketplaceAddressUpsertRequest request) {
        Long userId = currentUserService.getCurrentUserId();

        MarketplaceAddress address = MarketplaceAddress.builder()
                .userId(userId)
                .fullName(request.fullName())
                .phone(request.phone())
                .province(request.province())
                .district(request.district())
                .ward(request.ward())
                .street(request.street())
                .detail(request.detail())
                .label(request.label())
                .isDefault(request.isDefault() != null ? request.isDefault() : false)
                .build();

        address = marketplaceAddressRepository.save(address);
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public MarketplaceAddressResponse updateAddress(Long addressId, MarketplaceAddressUpsertRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceAddress address = marketplaceAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setFullName(request.fullName());
        address.setPhone(request.phone());
        address.setProvince(request.province());
        address.setDistrict(request.district());
        address.setWard(request.ward());
        address.setStreet(request.street());
        address.setDetail(request.detail());
        address.setLabel(request.label());
        if (request.isDefault() != null) {
            address.setIsDefault(request.isDefault());
        }

        address = marketplaceAddressRepository.save(address);
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public MarketplaceAddressResponse setDefaultAddress(Long addressId) {
        Long userId = currentUserService.getCurrentUserId();
        List<MarketplaceAddress> addresses = marketplaceAddressRepository.findByUserId(userId);

        for (MarketplaceAddress addr : addresses) {
            addr.setIsDefault(addr.getId().equals(addressId));
        }
        marketplaceAddressRepository.saveAll(addresses);

        MarketplaceAddress address = marketplaceAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId) {
        Long userId = currentUserService.getCurrentUserId();
        marketplaceAddressRepository.deleteByIdAndUserId(addressId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceFarmerDashboardResponse getFarmerDashboard() {
        Long userId = currentUserService.getCurrentUserId();
        // TODO: Implement full dashboard logic
        return new MarketplaceFarmerDashboardResponse(
                0L, 0L, 0L, 0L, 0L,
                BigDecimal.ZERO,
                false, false, false,
                null,
                List.of(),
                List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceProductSummaryResponse> listFarmerProducts(
            String q, MarketplaceProductStatus status, int page, int size) {
        Long userId = currentUserService.getCurrentUserId();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceProduct> productPage = marketplaceProductRepository.findByFarmerUserId(userId, pageable);

        List<MarketplaceProductSummaryResponse> items = productPage.getContent().stream()
                .map(this::toProductSummary)
                .toList();

        return PageResponse.of(productPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceFarmerProductFormOptionsResponse getFarmerProductFormOptions() {
        Long userId = currentUserService.getCurrentUserId();

        // Get farms via FarmClient
        List<MarketplaceFarmerProductFormFarmOptionResponse> farms = List.of();
        // TODO: Implement via FarmClient

        // Get seasons via SeasonClient
        List<MarketplaceFarmerProductFormSeasonOptionResponse> seasons = List.of();
        // TODO: Implement via SeasonClient

        // Get lots via InventoryClient
        List<MarketplaceFarmerProductFormLotOptionResponse> lots = List.of();
        // TODO: Implement via InventoryClient

        return new MarketplaceFarmerProductFormOptionsResponse(farms, seasons, lots);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceProductDetailResponse getFarmerProductDetail(Long productId) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceProduct product = marketplaceProductRepository.findByIdAndFarmerUserId(productId, userId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDetail(product);
    }

    @Override
    @Transactional
    public MarketplaceProductDetailResponse createFarmerProduct(MarketplaceFarmerProductUpsertRequest request) {
        Long userId = currentUserService.getCurrentUserId();

        MarketplaceProduct product = MarketplaceProduct.builder()
                .name(request.name())
                .category(request.category())
                .shortDescription(request.shortDescription())
                .description(request.description())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .imageUrl(request.imageUrl())
                .farmerUserId(userId)
                .lotId(request.lotId())
                .status(MarketplaceProductStatus.DRAFT)
                .traceable(true)
                .averageRating(0.0)
                .ratingCount(0)
                .build();

        product = marketplaceProductRepository.save(product);
        return toProductDetail(product);
    }

    @Override
    @Transactional
    public MarketplaceProductDetailResponse updateFarmerProduct(Long productId, MarketplaceFarmerProductUpsertRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceProduct product = marketplaceProductRepository.findByIdAndFarmerUserId(productId, userId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.name());
        product.setCategory(request.category());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(request.imageUrl());
        product.setLotId(request.lotId());

        product = marketplaceProductRepository.save(product);
        return toProductDetail(product);
    }

    @Override
    @Transactional
    public MarketplaceProductDetailResponse updateFarmerProductStatus(Long productId, MarketplaceUpdateProductStatusRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        MarketplaceProduct product = marketplaceProductRepository.findByIdAndFarmerUserId(productId, userId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(request.status());
        if (request.statusReason() != null) {
            product.setStatusReason(request.statusReason());
        }
        product.setStatusChangedAt(LocalDateTime.now());
        product.setStatusChangedByUserId(userId);

        product = marketplaceProductRepository.save(product);
        return toProductDetail(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MarketplaceProductSummaryResponse> listAdminProducts(
            String q, MarketplaceProductStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MarketplaceProduct> productPage = marketplaceProductRepository.findAll(pageable);

        List<MarketplaceProductSummaryResponse> items = productPage.getContent().stream()
                .map(this::toProductSummary)
                .toList();

        return PageResponse.of(productPage, items);
    }

    @Override
    @Transactional(readOnly = true)
    public MarketplaceProductDetailResponse getAdminProductDetail(Long productId) {
        MarketplaceProduct product = marketplaceProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDetail(product);
    }

    @Override
    @Transactional
    public MarketplaceProductDetailResponse updateAdminProductStatus(Long productId, MarketplaceUpdateProductStatusRequest request) {
        MarketplaceProduct product = marketplaceProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(request.status());
        if (request.statusReason() != null) {
            product.setStatusReason(request.statusReason());
        }
        product.setStatusChangedAt(LocalDateTime.now());
        product.setStatusChangedByUserId(currentUserService.getCurrentUserId());

        product = marketplaceProductRepository.save(product);
        return toProductDetail(product);
    }

    // ==================== Helper Methods ====================

    private MarketplaceCart getOrCreateCart(Long userId) {
        return marketplaceCartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    MarketplaceCart cart = MarketplaceCart.builder()
                            .userId(userId)
                            .build();
                    return marketplaceCartRepository.save(cart);
                });
    }

    private MarketplaceCartResponse buildCartResponse(Long userId, MarketplaceCart cart) {
        List<MarketplaceCartItem> items = marketplaceCartItemRepository.findByCartId(cart.getId());

        List<org.example.marketplace.dto.response.MarketplaceCartItemResponse> itemResponses = items.stream()
                .map(item -> new org.example.marketplace.dto.response.MarketplaceCartItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getSlug(),
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getUnitPriceSnapshot(),
                        item.getQuantity(),
                        item.getProduct().getStockQuantity(),
                        item.getProduct().getFarmerUserId(),
                        item.getProduct().getTraceable()))
                .toList();

        BigDecimal subtotal = items.stream()
                .map(item -> item.getUnitPriceSnapshot().multiply(item.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MarketplaceCartResponse(
                userId,
                itemResponses,
                List.of(), // sellerGroups - TODO
                BigDecimal.valueOf(items.size()),
                subtotal,
                CURRENCY_VND);
    }

    private MarketplaceCartResponse emptyCart(Long userId) {
        return new MarketplaceCartResponse(
                userId,
                List.of(),
                List.of(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                CURRENCY_VND);
    }

    private MarketplaceProductSummaryResponse toProductSummary(MarketplaceProduct product) {
        return new MarketplaceProductSummaryResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getCategory(),
                product.getShortDescription(),
                product.getPrice(),
                product.getUnit(),
                product.getStockQuantity(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getFarmerUserId(),
                product.getFarmerDisplayName(),
                product.getFarmId(),
                product.getFarmName(),
                product.getSeasonId(),
                product.getSeasonName(),
                product.getLotId(),
                product.getFarmRegion(),
                product.getTraceable(),
                product.getAverageRating(),
                (long) product.getRatingCount(),
                product.getStatus(),
                product.getStatusReason(),
                product.getPublishedAt(),
                product.getStatusChangedAt(),
                true,
                List.of(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    private MarketplaceProductDetailResponse toProductDetail(MarketplaceProduct product) {
        return new MarketplaceProductDetailResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getCategory(),
                product.getShortDescription(),
                product.getDescription(),
                product.getPrice(),
                product.getUnit(),
                product.getStockQuantity(),
                product.getStockQuantity(),
                product.getImageUrl(),
                null, // imageUrls
                product.getFarmerUserId(),
                product.getFarmerDisplayName(),
                product.getFarmId(),
                product.getFarmName(),
                product.getSeasonId(),
                product.getSeasonName(),
                product.getLotId(),
                product.getFarmRegion(),
                product.getTraceable(),
                null, // traceabilityCode
                product.getAverageRating(),
                (long) product.getRatingCount(),
                product.getStatus(),
                product.getStatusReason(),
                product.getPublishedAt(),
                product.getStatusChangedAt(),
                true,
                List.of(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    private MarketplaceReviewResponse toReviewResponse(MarketplaceProductReview review) {
        return new MarketplaceReviewResponse(
                review.getId(),
                review.getProductId(),
                review.getOrderId(),
                review.getOrderItemId(),
                review.getBuyerUserId(),
                review.getBuyerDisplayName(),
                review.getRating(),
                review.getComment(),
                review.getHidden(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }

    private MarketplaceOrderResponse toOrderResponse(MarketplaceOrder order) {
        List<MarketplaceOrderItem> items = marketplaceOrderItemRepository.findByOrderId(order.getId());

        List<MarketplaceOrderItemResponse> itemResponses = items.stream()
                .map(item -> new MarketplaceOrderItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductNameSnapshot(),
                        null, // slug
                        item.getImageUrlSnapshot(),
                        item.getUnitPriceSnapshot(),
                        item.getQuantity(),
                        item.getLineTotal(),
                        item.getTraceableSnapshot(),
                        false, // canReview
                        null)) // reviewId
                .toList();

        return new MarketplaceOrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getOrderGroupId() != null ? order.getOrderGroupId().toString() : null,
                order.getBuyerUserId(),
                order.getFarmerUserId(),
                order.getStatus(),
                null, // payment
                order.getShippingRecipientName(),
                order.getShippingPhone(),
                order.getShippingAddressLine(),
                order.getNote(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTotalAmount(),
                canCancel(order),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses);
    }

    private boolean canCancel(MarketplaceOrder order) {
        return order.getStatus() == MarketplaceOrderStatus.PENDING_PAYMENT
                || order.getStatus() == MarketplaceOrderStatus.PAYMENT_SUBMITTED
                || order.getStatus() == MarketplaceOrderStatus.CONFIRMED;
    }

    private MarketplacePaymentProofResponse toPaymentProofResponse(MarketplaceOrder order) {
        return new MarketplacePaymentProofResponse(
                order.getId(),
                order.getOrderCode(),
                order.getBuyerUserId(),
                null, // proofFileName
                null, // proofContentType
                order.getPaymentProofStoragePath(),
                order.getPaymentProofUploadedAt(),
                order.getPaymentVerificationStatus(),
                order.getPaymentVerificationNote(),
                order.getPaymentVerifiedAt(),
                order.getPaymentVerifiedByUserId());
    }

    private MarketplaceAddressResponse toAddressResponse(MarketplaceAddress address) {
        return new MarketplaceAddressResponse(
                address.getId(),
                address.getUserId(),
                address.getFullName(),
                address.getPhone(),
                address.getProvince(),
                address.getDistrict(),
                address.getWard(),
                address.getStreet(),
                address.getDetail(),
                address.getLabel(),
                address.getIsDefault());
    }

    private MarketplaceTraceabilityResponse buildTraceabilityResponse(MarketplaceProduct product, MarketplaceOrderItem orderItem) {
        Long productId;
        Boolean traceable;

        MarketplaceTraceabilityResponse.FarmTraceability farm = null;
        MarketplaceTraceabilityResponse.PlotTraceability plot = null;
        MarketplaceTraceabilityResponse.SeasonTraceability season = null;
        MarketplaceTraceabilityResponse.HarvestTraceability harvest = null;
        MarketplaceTraceabilityResponse.ProductLotTraceability productLot = null;

        if (product != null) {
            productId = product.getId();
            traceable = product.getTraceable();

            if (product.getFarmId() != null) {
                farm = new MarketplaceTraceabilityResponse.FarmTraceability(
                        product.getFarmId(),
                        product.getFarmName(),
                        product.getFarmRegion(),
                        null, // address
                        null  // certification
                );
            }

            if (product.getSeasonId() != null) {
                season = new MarketplaceTraceabilityResponse.SeasonTraceability(
                        product.getSeasonId(),
                        product.getSeasonName(),
                        product.getCropName(),
                        null, // varietyName
                        null, // plantingDate
                        null  // harvestDate
                );
            }

            if (product.getLotId() != null) {
                productLot = new MarketplaceTraceabilityResponse.ProductLotTraceability(
                        product.getLotId(),
                        product.getLotCode(),
                        product.getLotHarvestDate() != null ? product.getLotHarvestDate().toLocalDate() : null,
                        product.getLotReceivedAt(),
                        null, // unit
                        product.getLotInitialQuantity(),
                        product.getLotGrade(),
                        product.getLotWarehouseName(),
                        product.getLotStorageLocation()
                );
            }

            if (product.getPlotId() != null) {
                plot = new MarketplaceTraceabilityResponse.PlotTraceability(
                        product.getPlotId(),
                        product.getPlotName(),
                        product.getPlotArea()
                );
            }
        } else if (orderItem != null) {
            productId = orderItem.getProductId();
            traceable = orderItem.getTraceableSnapshot();

            if (orderItem.getFarmId() != null) {
                farm = new MarketplaceTraceabilityResponse.FarmTraceability(
                        orderItem.getFarmId(),
                        orderItem.getFarmName(),
                        null, // region
                        null, // address
                        null  // certification
                );
            }

            if (orderItem.getSeasonId() != null) {
                season = new MarketplaceTraceabilityResponse.SeasonTraceability(
                        orderItem.getSeasonId(),
                        orderItem.getSeasonName(),
                        orderItem.getCropName(),
                        null, // varietyName
                        null, // plantingDate
                        null  // harvestDate
                );
            }

            if (orderItem.getLotId() != null) {
                productLot = new MarketplaceTraceabilityResponse.ProductLotTraceability(
                        orderItem.getLotId(),
                        orderItem.getLotCode(),
                        orderItem.getLotHarvestDate() != null ? orderItem.getLotHarvestDate().toLocalDate() : null,
                        orderItem.getLotReceivedAt(),
                        null, // unit
                        orderItem.getLotInitialQuantity(),
                        orderItem.getLotGrade(),
                        orderItem.getLotWarehouseName(),
                        orderItem.getLotStorageLocation()
                );
            }

            if (orderItem.getPlotId() != null) {
                plot = new MarketplaceTraceabilityResponse.PlotTraceability(
                        orderItem.getPlotId(),
                        orderItem.getPlotName(),
                        orderItem.getPlotArea()
                );
            }
        } else {
            throw new IllegalArgumentException("Either product or orderItem must be provided");
        }

        // Build timeline milestones
        List<MarketplaceTraceabilityResponse.TimelineMilestone> timeline = buildTimeline(product, orderItem);

        return new MarketplaceTraceabilityResponse(
                productId,
                traceable,
                farm,
                plot,
                season,
                harvest,
                productLot,
                timeline,
                LocalDateTime.now()
        );
    }

    private List<MarketplaceTraceabilityResponse.TimelineMilestone> buildTimeline(MarketplaceProduct product, MarketplaceOrderItem orderItem) {
        List<MarketplaceTraceabilityResponse.TimelineMilestone> milestones = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();

        // Add milestones based on available data
        if (product != null && product.getPublishedAt() != null) {
            milestones.add(new MarketplaceTraceabilityResponse.TimelineMilestone(
                    "PRODUCT_LISTED",
                    product.getPublishedAt(),
                    "Product listed on marketplace"
            ));
        }

        if (orderItem != null && orderItem.getCreatedAt() != null) {
            milestones.add(new MarketplaceTraceabilityResponse.TimelineMilestone(
                    "ORDER_PLACED",
                    orderItem.getCreatedAt(),
                    "Order placed by buyer"
            ));
        }

        if (orderItem != null && orderItem.getLotReceivedAt() != null) {
            milestones.add(new MarketplaceTraceabilityResponse.TimelineMilestone(
                    "LOT_RECEIVED",
                    orderItem.getLotReceivedAt(),
                    "Product lot received at warehouse"
            ));
        }

        // Sort timeline chronologically
        milestones.sort(Comparator.comparing(MarketplaceTraceabilityResponse.TimelineMilestone::date));

        return milestones;
    }
}
