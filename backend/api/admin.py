from django.contrib import admin
from .models import Note, Blog, BlogBlock, Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "email",
        "phone",
        "payment_method",
        "total",
        "created_at",
    )

    list_filter = (
        "payment_method",
        "furnished_status",
        "parking",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "phone",
    )

    readonly_fields = (
        "total",
        "created_at",
    )

    fieldsets = (
        ("Customer Details", {
            "fields": (
                "name",
                "email",
                "phone",
                "payment_method",
            )
        }),
        ("Property Details", {
            "fields": (
                "furnished_status",
                "parking",
            )
        }),
        ("Cleaning Selections", {
            "fields": (
                "selected_areas",
                "quantities",
            )
        }),
        ("Payment", {
            "fields": (
                "total",
                "paymentlink",
            )
        }),
        ("System", {
            "fields": (
                "created_at",
            )
        }),
    )


admin.site.register(Note)
admin.site.register(Blog)
admin.site.register(BlogBlock)
