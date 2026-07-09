from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from accounts.models import Profile


class Command(BaseCommand):
    help = 'Grant seller/admin dashboard access to an existing user.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f'User "{username}" does not exist.')

        profile, _ = Profile.objects.get_or_create(user=user)
        profile.is_seller_admin = True
        profile.save()
        self.stdout.write(self.style.SUCCESS(f'{username} can now access the seller dashboard.'))
