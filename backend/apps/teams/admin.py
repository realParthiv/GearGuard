from django.contrib import admin
from .models import MaintenanceTeam

@admin.register(MaintenanceTeam)
class MaintenanceTeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'company')
    list_filter = ('company',)
    search_fields = ('name',)
    filter_horizontal = ('members',) # Makes ManyToMany relationship easier to manage
