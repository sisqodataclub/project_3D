from django.contrib import admin
from .models import Note, Blog, BlogBlock

# Register your models here.
admin.site.register(Note)
admin.site.register(Blog)
admin.site.register(BlogBlock)