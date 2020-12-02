from django.contrib import admin

from .models import BlastJob, BlastResult

admin.site.register(BlastJob)
admin.site.register(BlastResult)

# Register your models here.
