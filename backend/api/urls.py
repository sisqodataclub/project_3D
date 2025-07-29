from django.urls import path
from . import views
from .views import CurrentUserView


from .views import BlogListCreate, BlogRetrieveUpdateDestroy, CommentListCreate

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("blogs/",            views.BlogListCreate.as_view(),            name="blog-list-create"),
    path("blogs/<int:pk>/",   views.BlogRetrieveUpdateDestroy.as_view(), name="blog-detail"),
    path("user/", views.CurrentUserView.as_view(), name="current-user"),
    # api/urls.py
    path("blogs/<int:pk>/comments/", CommentListCreate.as_view(), name="comments"),

]



