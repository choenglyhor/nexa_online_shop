from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Category, Product


class Command(BaseCommand):
    help = 'Seed the database with sample categories and products.'

    def handle(self, *args, **options):
        categories = {
            'Electronics': 'Phones, accessories, audio, and useful everyday tech.',
            'Fashion': 'Clothing, shoes, and wearable essentials.',
            'Home & Living': 'Simple upgrades for the home and workspace.',
            'Beauty': 'Skincare, self-care, and personal care picks.',
            'Sports': 'Fitness gear and active lifestyle products.',
        }
        cat_objs = {}
        for name, description in categories.items():
            cat, _ = Category.objects.get_or_create(
                name=name,
                slug=slugify(name),
                defaults={'description': description},
            )
            if not cat.description:
                cat.description = description
                cat.save(update_fields=['description'])
            cat_objs[name] = cat

        sample_products = [
            ('Wireless Headphones', 'Electronics', 59.99, 49.99, 25),
            ('Smart Watch', 'Electronics', 129.99, None, 15),
            ('Bluetooth Speaker', 'Electronics', 39.99, 29.99, 30),
            ('Men\'s Denim Jacket', 'Fashion', 79.99, None, 20),
            ('Women\'s Summer Dress', 'Fashion', 45.00, 35.00, 18),
            ('Running Sneakers', 'Sports', 89.99, 69.99, 22),
            ('Yoga Mat', 'Sports', 25.00, None, 40),
            ('Ceramic Mug Set', 'Home & Living', 19.99, None, 50),
            ('Scented Candle', 'Home & Living', 14.99, 9.99, 60),
            ('Skincare Set', 'Beauty', 49.99, 39.99, 35),
        ]

        for name, cat_name, price, discount, stock in sample_products:
            Product.objects.get_or_create(
                name=name,
                slug=slugify(name),
                defaults={
                    'category': cat_objs[cat_name],
                    'description': f'High quality {name.lower()} at a great price.',
                    'price': price,
                    'discount_price': discount,
                    'stock': stock,
                }
            )

        self.stdout.write(self.style.SUCCESS('Seed data created successfully.'))
