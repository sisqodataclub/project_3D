from django.contrib import admin
from django.urls import path
from django.template.response import TemplateResponse
from django.db.models import Sum
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date

from .models import Note, Blog, BlogBlock, Booking
from django.contrib import messages 
from django.core.mail import EmailMessage 
from django.http import HttpResponseRedirect
import platform

# =====================================================
# Custom Admin Site
# =====================================================

class DashboardAdminSite(admin.AdminSite):
    site_header = "FrancisCodes Admin"
    site_title = "FrancisCodes Admin"
    index_title = "Dashboard"

    # Make /dashboard-admin/ show the dashboard
    def index(self, request, extra_context=None):
        return self.dashboard_view(request)

    def dashboard_view(self, request):
        today = date.today()

        total_users = User.objects.count()
        total_bookings = Booking.objects.count()
        total_revenue = Booking.objects.aggregate(total=Sum("total"))["total"] or 0

        bookings_today = Booking.objects.filter(created_at__date=today).count()
        revenue_today = Booking.objects.filter(created_at__date=today).aggregate(total=Sum("total"))["total"] or 0

        upcoming_bookings = Booking.objects.filter(
            quantities__booking_date__gte=str(today)
        ).count()

        avg_order_value = (
            total_revenue / total_bookings if total_bookings > 0 else 0
        )

        recent_bookings = Booking.objects.order_by("-created_at")[:5]

        context = dict(
            self.each_context(request),
            total_users=total_users,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            bookings_today=bookings_today,
            revenue_today=revenue_today,
            upcoming_bookings=upcoming_bookings,
            avg_order_value=avg_order_value,
            recent_bookings=recent_bookings,
        )
        return TemplateResponse(request, "admin/dashboard.html", context)


# Instantiate custom admin site
dashboard_admin_site = DashboardAdminSite(name="dashboard_admin")


# =====================================================
# Booking Admin
# =====================================================

from django.urls import path
from django.http import HttpResponse
from django.template.loader import render_to_string
import pdfkit  # or xhtml2pdf, WeasyPrint, etc.

class BookingAdmin(admin.ModelAdmin):

    change_form_template = "admin/booking_change_form.html"

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

    search_fields = ("name", "email", "phone")

    readonly_fields = ("total", "created_at")

    fieldsets = (
        ("Customer Details", {
            "fields": ("name", "email", "phone", "payment_method")
        }),
        ("Property Details", {
            "fields": ("furnished_status", "parking")
        }),
        ("Cleaning Selections", {
            "fields": ("selected_areas", "quantities")
        }),
        ("Payment", {
            "fields": ("total", "paymentlink")
        }),
        ("System", {
            "fields": ("created_at",)
        }),
    )

    # Add custom URL for PDF
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<int:booking_id>/pdf/",
                self.admin_site.admin_view(self.generate_pdf),
                name="booking_pdf",
            ),
            path( 
                "<int:booking_id>/send-invoice/", 
                self.admin_site.admin_view(self.send_invoice), 
                name="booking_send_invoice", ),
        ]
        return custom_urls + urls

    # PDF generator

    def generate_pdf(self, request, booking_id):
        booking = Booking.objects.get(id=booking_id)

        html = render_to_string("admin/booking_pdf.html", {"booking": booking})

        if platform.system() == "Windows":
            wkhtml_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        else:
            wkhtml_path = "/usr/local/bin/wkhtmltopdf"

        config = pdfkit.configuration(wkhtmltopdf=wkhtml_path)

        pdf = pdfkit.from_string(html, False, configuration=config)

        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename=booking_{booking_id}.pdf"
        return response

    from django.contrib import messages
    from django.core.mail import EmailMessage

    def send_invoice(self, request, booking_id):
        booking = Booking.objects.get(id=booking_id)

        # Example email content
        subject = f"Your Invoice – Booking #{booking.id}"
        body = render_to_string("email/invoice_email.html", {"booking": booking})
        recipient = booking.email

        # Generate PDF HTML
        html = render_to_string("admin/booking_pdf.html", {"booking": booking})

        if platform.system() == "Windows":
            wkhtml_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        else:
            wkhtml_path = "/usr/local/bin/wkhtmltopdf"

        config = pdfkit.configuration(wkhtmltopdf=wkhtml_path)


        pdf = pdfkit.from_string(html, False, configuration=config)

        email = EmailMessage(subject, body, to=[recipient])
        email.content_subtype = "html"
        email.attach(f"invoice_{booking.id}.pdf", pdf, "application/pdf")
        email.send()

        messages.success(request, "Invoice sent successfully.")
        return HttpResponseRedirect(f"../{booking_id}/change/")




# =====================================================
# Register models on DEFAULT admin
# =====================================================


# =====================================================
# Register models on CUSTOM dashboard admin
# =====================================================

# =====================================================
# Register models on DEFAULT admin
# =====================================================

# =====================================================
# Register models on DEFAULT admin
# =====================================================

# =====================================================
# Register models on DEFAULT admin
# =====================================================

admin.site.register(Note)
admin.site.register(Blog)
admin.site.register(BlogBlock)
admin.site.register(Booking, BookingAdmin)   # Only once


# =====================================================
# Register models on CUSTOM dashboard admin
# =====================================================

dashboard_admin_site.register(Note)
dashboard_admin_site.register(Blog)
dashboard_admin_site.register(BlogBlock)
dashboard_admin_site.register(Booking, BookingAdmin)  # Only once


