from django.utils.text import slugify
from rest_framework import serializers

from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem


def unique_slug(model, value, instance=None):
    base = slugify(value) or 'item'
    slug = base
    index = 2
    queryset = model.objects.all()
    if instance and instance.pk:
        queryset = queryset.exclude(pk=instance.pk)
    while queryset.filter(slug=slug).exists():
        slug = f'{base}-{index}'
        index += 1
    return slug


class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Category, validated_data['name'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = unique_slug(Category, validated_data['name'], instance)
        return super().update(instance, validated_data)


class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'category_slug',
            'description', 'price', 'discount_price', 'stock', 'image',
            'is_active', 'in_stock', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'in_stock', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        data = data.copy()
        for field in ('category', 'discount_price', 'image'):
            if data.get(field) == '':
                data[field] = None
        return super().to_internal_value(data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            url = instance.image.url
            data['image'] = request.build_absolute_uri(url) if request else url
        return data

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Product, validated_data['name'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = unique_slug(Product, validated_data['name'], instance)
        return super().update(instance, validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True,
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total']


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True,
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'added_at']


class OrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product_name', read_only=True)
    qty = serializers.IntegerField(source='quantity', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'name', 'price', 'quantity', 'qty', 'image']

    def get_image(self, obj):
        if not obj.product or not obj.product.image:
            return None
        request = self.context.get('request')
        url = obj.product.image.url
        return request.build_absolute_uri(url) if request else url


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'username', 'status', 'shipping_address', 'total', 'created_at', 'items']
