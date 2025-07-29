from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Note, Blog
from .serializers import NoteSerializer, BlogSerializer, UserSerializer, UserCreateSerializer


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)


class BlogListCreate(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        author_id = self.request.query_params.get('author')
        if author_id:
            return Blog.objects.filter(author__id=author_id)
        return Blog.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class BlogRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Blog.objects.all()

    def perform_update(self, serializer):
        if self.request.user != self.get_object().author:
            raise PermissionDenied("Cannot edit another user's blog.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.author:
            raise PermissionDenied("Cannot delete another user's blog.")
        instance.delete()


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserCreateSerializer(request.user)
        return Response(serializer.data)


# api/views.py
from rest_framework import generics, permissions
from .models import Comment, Blog
from .serializers import CommentSerializer
from datetime import datetime

class CommentListCreate(generics.ListCreateAPIView):
    """
    GET /api/blogs/<pk>/comments/  -> list
    POST /api/blogs/<pk>/comments/ -> create
    """
    serializer_class   = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Comment.objects.filter(blog_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        blog = Blog.objects.get(pk=self.kwargs["pk"])
        user = self.request.user if self.request.user.is_authenticated else None
        guest_label = ""
        if not user:
            guest_label = f"Guest {datetime.now():%Y-%m-%d %H:%M}"
        serializer.save(blog=blog, author=user, guest_name=guest_label)
