# from django.urls import path
# from . import views

# urlpatterns = [
#     path('csrf/', views.csrf_token_view),
#     path('register/', views.register_view),
#     path('login/', views.login_view),
#     path('logout/', views.logout_view),
#     path('me/', views.current_user_view),
#     path('profile/', views.profile_view),
# ]
from django.urls import path
from . import views

urlpatterns = [
    # CSRF
    path('csrf/', views.csrf_token_view, name='csrf'),
    
    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.current_user_view, name='current_user'),
    path('me/', views.current_user_view, name='current_user_alias'),
    
    # Profile
    path('profile/', views.profile_view, name='profile'),
    
    # Password change
    path('change-password/', views.change_password_view, name='change_password'),
    
    # Admin endpoints
    path('admin/users/', views.admin_users_list_view, name='admin_users_list'),
    path('admin/users/<int:user_id>/role/', views.admin_user_role_view, name='admin_user_role'),
    path('admin/users/<int:user_id>/delete/', views.admin_user_delete_view, name='admin_user_delete'),
    path('users/', views.admin_users_list_view, name='users_list_alias'),
    path('users/<int:user_id>/role/', views.admin_user_role_view, name='user_role_alias'),
    path('users/<int:user_id>/delete/', views.admin_user_delete_view, name='user_delete_alias'),
]
