from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('products', views.ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),

    path('cart/', views.cart_view),
    path('cart/add/', views.cart_add_view),
    path('cart/items/<int:item_id>/', views.cart_item_view),

    path('wishlist/', views.wishlist_view),
    path('wishlist/<int:product_id>/', views.wishlist_remove_view),

    path('orders/', views.orders_view),
    path('orders/<int:order_id>/', views.order_detail_view),
    path('orders/clear/', views.orders_clear_view),

    path('dashboard/stats/', views.dashboard_stats_view),
    path('dashboard/orders/<int:order_id>/', views.dashboard_order_status_view),
]
