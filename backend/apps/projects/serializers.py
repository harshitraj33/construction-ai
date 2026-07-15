from rest_framework import serializers
from .models import Project, Task
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSimpleSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    owner_details = UserSimpleSerializer(source='owner', read_only=True)
    client_details = UserSimpleSerializer(source='client', read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
        extra_kwargs = {
            'owner': {'required': False}  # Will auto-assign to request.user in view
        }
