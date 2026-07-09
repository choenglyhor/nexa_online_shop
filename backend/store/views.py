from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, Prefetch, Q, Sum
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer,
    WishlistSerializer, OrderSerializer,
)


class IsSellerOrAdmin(permissions.BasePermission):
    """Allow write access to staff users or users whose profile.is_seller_admin is True."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user.is_authenticated:
            return False
        return user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSellerOrAdmin]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        request = self.request
        user = request.user
        show_all = (
            request.query_params.get('all') == '1'
            and user.is_authenticated
            and (user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False))
        )
        qs = Product.objects.all() if show_all else Product.objects.filter(is_active=True)
        qs = qs.select_related('category').order_by('-created_at')

        search = request.query_params.get('search')
        category = request.query_params.get('category')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if category:
            qs = qs.filter(Q(category__slug=category) | Q(category__name__iexact=category))
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs


# ---------------- Cart ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return Response(CartSerializer(cart).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    try:
        quantity = max(1, int(request.data.get('quantity', 1)))
    except (TypeError, ValueError):
        return Response({'detail': 'Quantity must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    if product.stock <= 0:
        return Response({'detail': 'Product is out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

    item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
    if not created:
        item.quantity = min(item.quantity + quantity, product.stock)
        item.save()
    return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_item_view(request, item_id):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        item.delete()
        return Response(CartSerializer(cart).data)

    try:
        quantity = int(request.data.get('quantity', item.quantity))
    except (TypeError, ValueError):
        return Response({'detail': 'Quantity must be a number.'}, status=status.HTTP_400_BAD_REQUEST)
    if quantity <= 0:
        item.delete()
    else:
        item.quantity = min(quantity, item.product.stock)
        item.save()
    return Response(CartSerializer(cart).data)


# ---------------- Wishlist ----------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    if request.method == 'GET':
        items = Wishlist.objects.filter(user=request.user).select_related('product')
        return Response(WishlistSerializer(items, many=True).data)

    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    items = Wishlist.objects.filter(user=request.user).select_related('product')
    return Response(WishlistSerializer(items, many=True).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_remove_view(request, product_id):
    Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
    items = Wishlist.objects.filter(user=request.user).select_related('product')
    return Response(WishlistSerializer(items, many=True).data)


# ---------------- Orders ----------------

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def orders_view(request):
    if request.method == 'GET':
        user = request.user
        if user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False):
            orders = Order.objects.all()
        else:
            orders = Order.objects.filter(user=user)
        order_items = OrderItem.objects.select_related('product')
        orders = orders.select_related('user').prefetch_related(Prefetch('items', queryset=order_items)).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True, context={'request': request}).data)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = cart.items.select_related('product').all()
    if not items.exists():
        return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        for item in items:
            if item.product.stock < item.quantity:
                return Response(
                    {'detail': f'{item.product.name} does not have enough stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        order = Order.objects.create(
            user=request.user,
            shipping_address=request.data.get('shipping_address', ''),
            total=cart.total,
        )
        for item in items:
            price = item.product.discount_price or item.product.price
            OrderItem.objects.create(
                order=order, product=item.product, product_name=item.product.name,
                price=price, quantity=item.quantity,
            )
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock', 'updated_at'])
        cart.items.all().delete()
    return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def order_detail_view(request, order_id):
    user = request.user
    qs = Order.objects.all() if (user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False)) else Order.objects.filter(user=user)
    try:
        order = qs.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def orders_clear_view(request):
    user = request.user
    if user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False):
        Order.objects.all().delete()
    else:
        Order.objects.filter(user=user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------- Seller / Admin dashboard ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    user = request.user
    if not (user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False)):
        return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.aggregate(total=Sum('total'))['total'] or 0
    total_users = User.objects.count()
    total_categories = Category.objects.count()
    low_stock = Product.objects.filter(stock__lte=5).count()
    status_counts = {
        item['status']: item['count']
        for item in Order.objects.values('status').annotate(count=Count('id'))
    }
    order_items = OrderItem.objects.select_related('product')
    recent_orders = Order.objects.select_related('user').prefetch_related(Prefetch('items', queryset=order_items)).order_by('-created_at')[:10]

    return Response({
        'total_products': total_products,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'total_users': total_users,
        'total_categories': total_categories,
        'low_stock': low_stock,
        'pending': status_counts.get('pending', 0),
        'processing': status_counts.get('processing', 0),
        'shipped': status_counts.get('shipped', 0),
        'delivered': status_counts.get('delivered', 0),
        'cancelled': status_counts.get('cancelled', 0),
        'recent_orders': OrderSerializer(recent_orders, many=True, context={'request': request}).data,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def dashboard_order_status_view(request, order_id):
    user = request.user
    if not (user.is_staff or getattr(getattr(user, 'profile', None), 'is_seller_admin', False)):
        return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    order.status = request.data.get('status', order.status)
    order.save()
    return Response(OrderSerializer(order, context={'request': request}).data)
