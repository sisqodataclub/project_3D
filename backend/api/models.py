from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes"  # user.notes.all()
    )

    def __str__(self):
        return self.title




class Blog(models.Model):
    title   = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    # optional “headline” extras
    tag     = models.CharField(max_length=100, blank=True)
    snippet = models.TextField(blank=True)
    image   = models.URLField(blank=True)

    author  = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blogs"
    )

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.title


class BlogBlock(models.Model):
    """
    One paragraph / quote / image that belongs to a Blog
    """
    blog   = models.ForeignKey(
        Blog, on_delete=models.CASCADE, related_name="blocks"
    )
    order  = models.PositiveIntegerField(default=0, db_index=True)
    text   = models.TextField(blank=True)
    image  = models.URLField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.blog.title[:30]} – block {self.order}"



class Comment(models.Model):
    blog    = models.ForeignKey("Blog", on_delete=models.CASCADE,
                                related_name="comments")
    author  = models.ForeignKey(User, on_delete=models.SET_NULL,
                                null=True, blank=True,
                                related_name="comments")
    guest_name = models.CharField(max_length=80, blank=True)   # populated if author is NULL
    text    = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        who = self.author.username if self.author else self.guest_name
        return f"{who} on {self.blog.title[:30]}…"
