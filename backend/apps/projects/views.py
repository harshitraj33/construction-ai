from rest_framework import viewsets, permissions
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Project.objects.all()
        elif user.role == 'CLIENT':
            return Project.objects.filter(client=user)
        else:  # CONTRACTOR, VENDOR, LABOR
            return (Project.objects.filter(owner=user) | 
                    Project.objects.filter(tasks__assigned_to=user)).distinct()

    def perform_create(self, serializer):
        # Default the owner to the current logged in user
        serializer.save(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.all()
        project_id = self.request.query_params.get('project_id')
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)

        user = self.request.user
        if user.role == 'ADMIN':
            return queryset
        elif user.role == 'CLIENT':
            return queryset.filter(project__client=user)
        elif user.role in ['LABOR', 'VENDOR']:
            return queryset.filter(assigned_to=user)
        else:  # CONTRACTOR
            return (queryset.filter(project__owner=user) | 
                    queryset.filter(assigned_to=user)).distinct()
