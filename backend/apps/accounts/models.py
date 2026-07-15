from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ADMIN = 'ADMIN'
    CONTRACTOR = 'CONTRACTOR'
    CLIENT = 'CLIENT'
    VENDOR = 'VENDOR'
    LABOR = 'LABOR'

    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (CONTRACTOR, 'Contractor'),
        (CLIENT, 'Client'),
        (VENDOR, 'Vendor'),
        (LABOR, 'Labor'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CLIENT)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
