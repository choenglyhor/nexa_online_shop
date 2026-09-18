from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['category_thumbnail', 'name', 'slug', 'product_count']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    readonly_fields = ['category_image_preview']

    def category_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px;" />', obj.image.url)
        return format_html('<span style="color: #999;">No image</span>')
    category_thumbnail.short_description = 'Image'

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'

    def category_image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 180px; max-width: 240px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No image uploaded yet"
    category_image_preview.short_description = 'Current Image Preview'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'discount_price', 'stock', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total', 'created_at']
    list_filter = ['status']
    inlines = [OrderItemInline]


admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Wishlist)
