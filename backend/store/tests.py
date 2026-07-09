from django.contrib.auth.models import User
from django.test import TestCase

from store.models import Category, Order, Product


class StoreApiIntegrationTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics',
            description='Useful everyday tech.',
        )
        self.product = Product.objects.create(
            name='Wireless Headphones',
            slug='wireless-headphones',
            category=self.category,
            description='Comfortable wireless audio.',
            price='59.99',
            stock=10,
        )

    def test_customer_registration_cart_wishlist_and_checkout(self):
        register = self.client.post(
            '/api/auth/register/',
            {
                'username': 'customer',
                'email': 'customer@example.com',
                'password': 'customer123',
            },
            content_type='application/json',
        )
        self.assertEqual(register.status_code, 201)

        add_cart = self.client.post(
            '/api/cart/add/',
            {'product_id': self.product.id, 'quantity': 2},
            content_type='application/json',
        )
        self.assertEqual(add_cart.status_code, 201)
        self.assertEqual(add_cart.json()['items'][0]['quantity'], 2)

        wishlist = self.client.post(
            '/api/wishlist/',
            {'product_id': self.product.id},
            content_type='application/json',
        )
        self.assertEqual(wishlist.status_code, 201)

        checkout = self.client.post(
            '/api/orders/',
            {'shipping_address': 'Phnom Penh'},
            content_type='application/json',
        )
        self.assertEqual(checkout.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)

    def test_admin_can_manage_catalog_and_view_stats(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123',
            is_staff=True,
        )
        self.client.force_login(admin)

        category = self.client.post(
            '/api/categories/',
            {'name': 'Beauty', 'description': 'Personal care products.'},
            content_type='application/json',
        )
        self.assertEqual(category.status_code, 201)

        product = self.client.post(
            '/api/products/',
            {
                'name': 'Skincare Set',
                'category': category.json()['id'],
                'description': 'Daily skincare essentials.',
                'price': '39.99',
                'stock': 12,
                'is_active': True,
            },
            content_type='application/json',
        )
        self.assertEqual(product.status_code, 201)
        self.assertEqual(product.json()['slug'], 'skincare-set')

        stats = self.client.get('/api/dashboard/stats/')
        self.assertEqual(stats.status_code, 200)
        self.assertEqual(stats.json()['total_products'], 2)
