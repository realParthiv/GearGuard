from django.contrib import admin
from .models import Equipment

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'serial_number', 'department', 'company', 'is_scrapped', 'created_at')
    list_filter = ('company', 'department', 'is_scrapped')
    search_fields = ('name', 'serial_number', 'asset_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
